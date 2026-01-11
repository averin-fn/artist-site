#!/bin/bash
# Скрипт автоматической настройки Nginx для Artist Site
# Запустите на VPS: sudo bash NGINX_SETUP.sh your-domain.com

DOMAIN=$1

if [ -z "$DOMAIN" ]; then
    echo "❌ Ошибка: укажите домен"
    echo "Использование: sudo bash NGINX_SETUP.sh your-domain.com"
    echo "Или для IP: sudo bash NGINX_SETUP.sh your-server-ip"
    exit 1
fi

echo "==================================="
echo "🚀 Настройка Nginx для Artist Site"
echo "Домен/IP: $DOMAIN"
echo "==================================="

# Проверка прав
if [ "$EUID" -ne 0 ]; then
    echo "❌ Запустите скрипт с sudo"
    exit 1
fi

# Установка Nginx если не установлен
if ! command -v nginx &> /dev/null; then
    echo "📦 Установка Nginx..."
    apt update
    apt install -y nginx
fi

# Создание конфигурации
echo "📝 Создание конфигурации Nginx..."
cat > /etc/nginx/sites-available/artist-site << 'EOF'
server {
    listen 80;
    listen [::]:80;
    server_name DOMAIN_PLACEHOLDER;

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
        
        # Кеширование статики
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
    }

    # Gzip сжатие
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss application/json application/javascript;
}
EOF

# Замена домена
sed -i "s/DOMAIN_PLACEHOLDER/$DOMAIN/g" /etc/nginx/sites-available/artist-site

# Активация конфигурации
echo "🔗 Активация конфигурации..."
ln -sf /etc/nginx/sites-available/artist-site /etc/nginx/sites-enabled/

# Удаление дефолтной конфигурации
rm -f /etc/nginx/sites-enabled/default

# Проверка конфигурации
echo "✅ Проверка конфигурации Nginx..."
if nginx -t; then
    echo "✅ Конфигурация корректна"
    
    # Перезапуск Nginx
    echo "🔄 Перезапуск Nginx..."
    systemctl restart nginx
    systemctl enable nginx
    
    echo ""
    echo "==================================="
    echo "✅ Nginx успешно настроен!"
    echo "==================================="
    echo ""
    echo "📍 Ваш сайт доступен по адресу:"
    echo "   http://$DOMAIN"
    echo ""
    echo "📊 Админ-панель:"
    echo "   http://$DOMAIN/admin"
    echo ""
    echo "🔌 API:"
    echo "   http://$DOMAIN/api/artworks"
    echo ""
    echo "📝 Логи:"
    echo "   tail -f /var/log/nginx/artist-site-access.log"
    echo "   tail -f /var/log/nginx/artist-site-error.log"
    echo ""
    
    # Открытие портов в firewall
    if command -v ufw &> /dev/null; then
        echo "🔥 Настройка firewall..."
        ufw allow 80/tcp
        ufw allow 443/tcp
        echo "✅ Порты 80 и 443 открыты"
    fi
    
else
    echo "❌ Ошибка в конфигурации Nginx"
    exit 1
fi
