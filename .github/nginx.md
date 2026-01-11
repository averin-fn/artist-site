# Конфигурация Nginx для Artist Site

## 📋 Базовая конфигурация (HTTP)

Создайте файл `/etc/nginx/sites-available/artist-site`:

```nginx
server {
    listen 80;
    listen [::]:80;
    server_name your-domain.com www.your-domain.com;

    # Логи
    access_log /var/log/nginx/artist-site-access.log;
    error_log /var/log/nginx/artist-site-error.log;

    # Максимальный размер загружаемых файлов
    client_max_body_size 10M;

    # Frontend статика (React SPA)
    location / {
        root /var/www/artist-site/dist;
        try_files $uri $uri/ /index.html;
        
        # Кеширование HTML
        location ~* \.html$ {
            expires -1;
            add_header Cache-Control "no-cache, no-store, must-revalidate";
        }
        
        # Кеширование статики (CSS, JS, изображения)
        location ~* \.(css|js|jpg|jpeg|png|gif|ico|svg|woff|woff2|ttf|eot)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # Таймауты
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # Admin панель
    location /admin {
        proxy_pass http://localhost:3001/admin;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Загруженные изображения
    location /uploads {
        alias /var/www/artist-site/public/uploads;
        
        # Кеширование
        expires 1y;
        add_header Cache-Control "public, immutable";
        
        # CORS для изображений
        add_header Access-Control-Allow-Origin *;
    }

    # Защита от доступа к системным файлам
    location ~ /\. {
        deny all;
        access_log off;
        log_not_found off;
    }

    # Защита от доступа к конфигурационным файлам
    location ~* \.(env|md|json|lock|yml|yaml)$ {
        deny all;
        access_log off;
        log_not_found off;
    }

    # Gzip сжатие
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss application/json application/javascript;
}
```

## 🔒 Конфигурация с SSL (HTTPS)

После установки SSL сертификата через Let's Encrypt:

```nginx
# Редирект с HTTP на HTTPS
server {
    listen 80;
    listen [::]:80;
    server_name your-domain.com www.your-domain.com;
    
    return 301 https://$server_name$request_uri;
}

# HTTPS сервер
server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name your-domain.com www.your-domain.com;

    # SSL сертификаты (Let's Encrypt)
    ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;
    ssl_trusted_certificate /etc/letsencrypt/live/your-domain.com/chain.pem;

    # SSL параметры (рекомендуемые настройки)
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers 'ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384';
    ssl_prefer_server_ciphers off;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;
    ssl_stapling on;
    ssl_stapling_verify on;

    # HSTS (опционально, но рекомендуется)
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;

    # Заголовки безопасности
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;

    # Логи
    access_log /var/log/nginx/artist-site-access.log;
    error_log /var/log/nginx/artist-site-error.log;

    # Максимальный размер загружаемых файлов
    client_max_body_size 10M;

    # Frontend статика
    location / {
        root /var/www/artist-site/dist;
        try_files $uri $uri/ /index.html;
        
        location ~* \.html$ {
            expires -1;
            add_header Cache-Control "no-cache, no-store, must-revalidate";
        }
        
        location ~* \.(css|js|jpg|jpeg|png|gif|ico|svg|woff|woff2|ttf|eot)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # Admin панель
    location /admin {
        proxy_pass http://localhost:3001/admin;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Загруженные изображения
    location /uploads {
        alias /var/www/artist-site/public/uploads;
        expires 1y;
        add_header Cache-Control "public, immutable";
        add_header Access-Control-Allow-Origin *;
    }

    # Защита системных файлов
    location ~ /\. {
        deny all;
        access_log off;
        log_not_found off;
    }

    location ~* \.(env|md|json|lock|yml|yaml)$ {
        deny all;
        access_log off;
        log_not_found off;
    }

    # Gzip сжатие
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss application/json application/javascript;
}
```

## 🚀 Установка

```bash
# 1. Создайте файл конфигурации
sudo nano /etc/nginx/sites-available/artist-site

# 2. Вставьте конфигурацию (HTTP или HTTPS)

# 3. Создайте символическую ссылку
sudo ln -s /etc/nginx/sites-available/artist-site /etc/nginx/sites-enabled/

# 4. Удалите дефолтную конфигурацию (опционально)
sudo rm /etc/nginx/sites-enabled/default

# 5. Проверьте конфигурацию
sudo nginx -t

# 6. Перезапустите Nginx
sudo systemctl restart nginx
```

## 🔒 Установка SSL с Let's Encrypt

```bash
# 1. Установите Certbot
sudo apt install -y certbot python3-certbot-nginx

# 2. Получите сертификат (автоматическая настройка Nginx)
sudo certbot --nginx -d your-domain.com -d www.your-domain.com

# 3. Или получите только сертификат (ручная настройка)
sudo certbot certonly --nginx -d your-domain.com -d www.your-domain.com

# 4. Проверьте автообновление
sudo certbot renew --dry-run

# 5. Настройте автообновление через cron (обычно уже настроено)
sudo systemctl status certbot.timer
```

## 🔧 Полезные команды

```bash
# Проверка синтаксиса конфигурации
sudo nginx -t

# Перезагрузка конфигурации без остановки
sudo nginx -s reload

# Перезапуск Nginx
sudo systemctl restart nginx

# Статус Nginx
sudo systemctl status nginx

# Просмотр логов
sudo tail -f /var/log/nginx/artist-site-access.log
sudo tail -f /var/log/nginx/artist-site-error.log

# Просмотр конфигурации
nginx -T
```

## 🎯 Оптимизация производительности

### Кеширование на уровне Nginx

Добавьте в `http` блок `/etc/nginx/nginx.conf`:

```nginx
# Кеш для статики
proxy_cache_path /var/cache/nginx levels=1:2 keys_zone=static_cache:10m max_size=1g inactive=60m use_temp_path=off;

# Кеш для API (опционально)
proxy_cache_path /var/cache/nginx/api levels=1:2 keys_zone=api_cache:10m max_size=100m inactive=10m use_temp_path=off;
```

Затем в блоке `location /api`:

```nginx
location /api {
    # Кеширование GET запросов (будьте осторожны с авторизацией!)
    proxy_cache api_cache;
    proxy_cache_methods GET;
    proxy_cache_valid 200 5m;
    proxy_cache_key "$scheme$request_method$host$request_uri";
    add_header X-Cache-Status $upstream_cache_status;
    
    proxy_pass http://localhost:3001;
    # ... остальные настройки
}
```

### Rate Limiting (защита от DDoS)

Добавьте в `http` блок:

```nginx
# Ограничение запросов
limit_req_zone $binary_remote_addr zone=api_limit:10m rate=10r/s;
limit_req_zone $binary_remote_addr zone=general_limit:10m rate=100r/s;
```

В блоке `location /api`:

```nginx
location /api {
    limit_req zone=api_limit burst=20 nodelay;
    # ... остальные настройки
}
```

## 🛡️ Безопасность

### Базовая аутентификация для админки

```bash
# Установка утилит
sudo apt install apache2-utils

# Создание файла паролей
sudo htpasswd -c /etc/nginx/.htpasswd admin

# В конфигурации Nginx добавьте в location /admin:
location /admin {
    auth_basic "Admin Area";
    auth_basic_user_file /etc/nginx/.htpasswd;
    
    proxy_pass http://localhost:3001/admin;
    # ... остальные настройки
}
```

### Ограничение доступа по IP

```nginx
location /admin {
    # Разрешить только с определенных IP
    allow 192.168.1.0/24;
    allow 10.0.0.0/8;
    deny all;
    
    proxy_pass http://localhost:3001/admin;
    # ... остальные настройки
}
```

## 🔍 Мониторинг

### Включение статистики Nginx

```nginx
location /nginx_status {
    stub_status on;
    access_log off;
    allow 127.0.0.1;
    deny all;
}
```

Проверка:
```bash
curl http://localhost/nginx_status
```
