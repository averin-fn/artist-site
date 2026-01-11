# GitHub Actions для автоматического деплоя

## 📋 Настройка деплоя на VPS

### 1. Подготовка VPS сервера

Выполните следующие команды на вашем VPS:

```bash
# Обновление системы
sudo apt update && sudo apt upgrade -y

# Установка Node.js 18.x
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Установка PM2
sudo npm install -g pm2

# Установка Git
sudo apt install -y git

# Создание директории для проекта
sudo mkdir -p /var/www/artist-site
sudo chown -R $USER:$USER /var/www/artist-site

# Клонирование репозитория (первый раз)
cd /var/www
git clone https://github.com/averin-fn/artist-site.git
cd artist-site

# Настройка PM2 для автозапуска
pm2 startup
# Скопируйте и выполните команду, которую выведет PM2
```

### 2. Настройка SSH ключа

На вашем локальном компьютере или VPS:

```bash
# Генерация SSH ключа (если еще нет)
ssh-keygen -t ed25519 -C "github-actions" -f ~/.ssh/github_actions

# Добавление публичного ключа на VPS
ssh-copy-id -i ~/.ssh/github_actions.pub user@your-vps-ip

# Копирование приватного ключа для GitHub Secrets
cat ~/.ssh/github_actions
# Скопируйте весь вывод (включая BEGIN и END строки)
```

### 3. Настройка GitHub Secrets

Перейдите в настройки вашего репозитория: `Settings` → `Secrets and variables` → `Actions` → `New repository secret`

Создайте следующие секреты:

| Secret Name | Описание | Пример |
|------------|----------|--------|
| `VPS_HOST` | IP адрес или домен VPS | `123.45.67.89` или `your-domain.com` |
| `VPS_USERNAME` | Имя пользователя SSH | `root` или `ubuntu` |
| `VPS_SSH_KEY` | Приватный SSH ключ | Содержимое `~/.ssh/github_actions` |
| `VPS_PORT` | SSH порт (опционально) | `22` (по умолчанию) |
| `DEPLOY_PATH` | Путь к проекту на VPS | `/var/www/artist-site` |
| `JWT_SECRET` | Секретный ключ JWT | Длинная случайная строка (64+ символов) |
| `ADMIN_USERNAME` | Имя администратора | `admin` |
| `ADMIN_PASSWORD` | Пароль администратора | Безопасный пароль |

#### Генерация JWT_SECRET:

```bash
# Linux/Mac
openssl rand -base64 64

# PowerShell (Windows)
-join ((48..57) + (65..90) + (97..122) | Get-Random -Count 64 | % {[char]$_})
```

### 4. Настройка Nginx (опционально, для проксирования)

```bash
# Установка Nginx
sudo apt install -y nginx

# Создание конфигурации
sudo nano /etc/nginx/sites-available/artist-site
```

Добавьте конфигурацию:

```nginx
server {
    listen 80;
    server_name your-domain.com;

    # Frontend
    location / {
        root /var/www/artist-site/dist;
        try_files $uri $uri/ /index.html;
        
        # Кеширование статики
        location ~* \.(jpg|jpeg|png|gif|ico|css|js)$ {
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
    }

    # Admin panel
    location /admin {
        proxy_pass http://localhost:3001/admin;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # Загруженные файлы
    location /uploads {
        alias /var/www/artist-site/public/uploads;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Защита файлов
    location ~ /\. {
        deny all;
    }
}
```

Активация конфигурации:

```bash
# Создание симлинка
sudo ln -s /etc/nginx/sites-available/artist-site /etc/nginx/sites-enabled/

# Удаление default конфигурации (опционально)
sudo rm /etc/nginx/sites-enabled/default

# Проверка конфигурации
sudo nginx -t

# Перезапуск Nginx
sudo systemctl restart nginx
```

### 5. Настройка SSL с Let's Encrypt (рекомендуется)

```bash
# Установка Certbot
sudo apt install -y certbot python3-certbot-nginx

# Получение сертификата
sudo certbot --nginx -d your-domain.com -d www.your-domain.com

# Проверка автообновления
sudo certbot renew --dry-run
```

### 6. Первый деплой

```bash
# Перейдите на VPS
cd /var/www/artist-site

# Установка зависимостей вручную (первый раз)
npm ci
npm run build

cd server
npm ci
npm run init-db

# Запуск через PM2
pm2 start server.js --name artist-site-backend --time
pm2 save
```

### 7. Запуск автоматического деплоя

После настройки секретов, просто сделайте push в ветку `main`:

```bash
git add .
git commit -m "Deploy to production"
git push origin main
```

GitHub Actions автоматически:
1. Соберет frontend
2. Установит зависимости backend
3. Подключится к VPS по SSH
4. Обновит код из репозитория
5. Создаст бэкап базы данных
6. Пересоберет приложение
7. Перезапустит PM2 процесс

### 8. Мониторинг на VPS

```bash
# Статус PM2 процессов
pm2 status

# Логи приложения
pm2 logs artist-site-backend

# Логи последних 100 строк
pm2 logs artist-site-backend --lines 100

# Мониторинг в реальном времени
pm2 monit

# Перезапуск приложения
pm2 restart artist-site-backend
```

### 9. Откат к предыдущей версии

```bash
cd /var/www/artist-site

# Просмотр коммитов
git log --oneline -10

# Откат к конкретному коммиту
git reset --hard <commit-hash>

# Пересборка
npm ci && npm run build
cd server && npm ci

# Перезапуск
pm2 restart artist-site-backend
```

### 10. Бэкапы базы данных

```bash
# Создание cron задачи для автоматических бэкапов
crontab -e

# Добавьте строку (бэкап каждый день в 3:00):
0 3 * * * cp /var/www/artist-site/server/artist.db /var/www/artist-site/backups/artist_$(date +\%Y\%m\%d).db

# Очистка старых бэкапов (старше 30 дней)
0 4 * * * find /var/www/artist-site/backups -name "artist_*.db" -mtime +30 -delete
```

## 🔒 Безопасность

1. **Firewall (UFW)**:
```bash
sudo ufw allow OpenSSH
sudo ufw allow 'Nginx Full'
sudo ufw enable
```

2. **Fail2Ban** (защита от брутфорса):
```bash
sudo apt install -y fail2ban
sudo systemctl enable fail2ban
sudo systemctl start fail2ban
```

3. **Обновления безопасности**:
```bash
# Автоматические обновления
sudo apt install -y unattended-upgrades
sudo dpkg-reconfigure --priority=low unattended-upgrades
```

## 📊 Проверка работы

После деплоя проверьте:

- Frontend: `http://your-domain.com`
- Backend API: `http://your-domain.com/api`
- Admin panel: `http://your-domain.com/admin`
- PM2 status: `pm2 status`
- Nginx logs: `sudo tail -f /var/log/nginx/access.log`
- App logs: `pm2 logs artist-site-backend`

## 🆘 Troubleshooting

**Проблема**: PM2 процесс не запускается
```bash
cd /var/www/artist-site/server
node server.js  # Проверка прямого запуска
```

**Проблема**: База данных не создается
```bash
cd /var/www/artist-site/server
npm run init-db
```

**Проблема**: 502 Bad Gateway в Nginx
```bash
pm2 status  # Проверьте статус backend
sudo nginx -t  # Проверьте конфигурацию nginx
```
