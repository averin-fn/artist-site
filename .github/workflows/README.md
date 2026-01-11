<<<<<<< HEAD
# Настройка автоматического деплоя на VPS

## 🎯 Быстрый старт

После настройки GitHub Secrets, деплой происходит автоматически при push в `main`:

```bash
git add .
git commit -m "Deploy update"
git push origin main
```

## 📋 Шаг 1: Подготовка VPS

Подключитесь к вашему VPS и выполните:
=======
# GitHub Actions для автоматического деплоя

## 📋 Настройка деплоя на VPS

### 1. Подготовка VPS сервера

Выполните следующие команды на вашем VPS:
>>>>>>> 68a6628852865b38b3eca3b329ef643020918ebe

```bash
# Обновление системы
sudo apt update && sudo apt upgrade -y

# Установка Node.js 18.x
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

<<<<<<< HEAD
# Проверка установки
node --version  # должно быть v18.x или выше
npm --version

# Установка PM2 глобально
=======
# Установка PM2
>>>>>>> 68a6628852865b38b3eca3b329ef643020918ebe
sudo npm install -g pm2

# Установка Git
sudo apt install -y git

<<<<<<< HEAD
# Создание директории для проекта (будет автоматически)
# sudo mkdir -p /var/www/artist-site
# sudo chown -R $USER:$USER /var/www

# Настройка PM2 для автозапуска при перезагрузке
pm2 startup
# Выполните команду которую выведет PM2 (начинается с sudo)
```

## 🔑 Шаг 2: Настройка SSH ключей

### На вашем локальном компьютере:

```bash
# Генерация SSH ключа специально для GitHub Actions
ssh-keygen -t ed25519 -C "github-actions-deploy" -f ~/.ssh/github_actions_deploy

# НЕ используйте пароль (нажмите Enter дважды)
```

### Добавление публичного ключа на VPS:

```bash
# Копирование публичного ключа на VPS
ssh-copy-id -i ~/.ssh/github_actions_deploy.pub ваш-пользователь@ваш-vps-ip

# Или вручную:
cat ~/.ssh/github_actions_deploy.pub
# Скопируйте вывод, подключитесь к VPS и добавьте в ~/.ssh/authorized_keys
```

### Тест подключения:

```bash
ssh -i ~/.ssh/github_actions_deploy ваш-пользователь@ваш-vps-ip
```

### Получение приватного ключа для GitHub:

```bash
# НА ЛОКАЛЬНОЙ МАШИНЕ:
cat ~/.ssh/github_actions_deploy
```

Скопируйте **ВСЁ содержимое** (включая строки `-----BEGIN` и `-----END`).

## 🔐 Шаг 3: Настройка GitHub Secrets

1. Откройте ваш репозиторий на GitHub
2. Перейдите: `Settings` → `Secrets and variables` → `Actions`
3. Нажмите `New repository secret`

Создайте следующие секреты:

### Обязательные секреты:

| Имя секрета | Описание | Пример значения |
|-------------|----------|-----------------|
| **VPS_HOST** | IP адрес или домен VPS | `123.45.67.89` |
| **VPS_USERNAME** | Имя пользователя SSH | `root` или `ubuntu` |
| **VPS_SSH_KEY** | Приватный SSH ключ | Содержимое `~/.ssh/github_actions_deploy` |
| **JWT_SECRET** | Секретный ключ для JWT | См. генерацию ниже |

### Опциональные секреты:

| Имя секрета | Описание | Значение по умолчанию |
|-------------|----------|-----------------------|
| **VPS_PORT** | SSH порт | `22` |
| **DEPLOY_PATH** | Путь к проекту на VPS | `/var/www/artist-site` |
| **ADMIN_USERNAME** | Имя администратора | `admin` |
| **ADMIN_PASSWORD** | Пароль администратора | `admin123` |

### Генерация JWT_SECRET:

```bash
# Linux/Mac:
openssl rand -base64 64

# Windows PowerShell:
-join ((48..57) + (65..90) + (97..122) | Get-Random -Count 64 | ForEach-Object {[char]$_})

# Или используйте онлайн генератор:
# https://www.random.org/strings/
```

**ВАЖНО:** JWT_SECRET должен быть длинным (64+ символов) и случайным!

## 🚀 Шаг 4: Первый деплой

### Автоматический (рекомендуется):

```bash
# На локальной машине в директории проекта:
git add .
git commit -m "Initial production deploy"
git push origin main
```

GitHub Actions автоматически:
- Соберет frontend
- Установит зависимости backend
- Подключится к VPS
- Клонирует репозиторий (первый раз) или обновит код
- Создаст .env файл с секретами
- Инициализирует базу данных
- Запустит приложение через PM2

### Мониторинг деплоя:

1. Перейдите на GitHub: `Actions` → последний workflow
2. Следите за прогрессом в реальном времени
3. При ошибках смотрите логи каждого шага

## 📊 Шаг 5: Проверка работы

### На VPS:

```bash
# Подключитесь к VPS
ssh ваш-пользователь@ваш-vps-ip

# Проверьте PM2 процесс
pm2 status

# Должен быть запущен процесс: artist-site-backend

# Проверьте логи
pm2 logs artist-site-backend --lines 50

# Проверьте что приложение слушает порт
sudo netstat -tlnp | grep 3001
# или
curl http://localhost:3001/api
```

### В браузере:

```
http://ваш-vps-ip:3001/api        # Backend API
http://ваш-vps-ip:3001/admin      # Админ-панель
```

## 🌐 Шаг 6: Настройка Nginx (опционально, но рекомендуется)

Nginx нужен для:
- Проксирования backend на стандартный порт 80/443
- Отдачи frontend статики
- SSL сертификатов
- Кеширования

### Установка:

```bash
sudo apt install -y nginx
```

### Создание конфигурации:

```bash
sudo nano /etc/nginx/sites-available/artist-site
```

Вставьте (замените `your-domain.com`):
=======
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
>>>>>>> 68a6628852865b38b3eca3b329ef643020918ebe

```nginx
server {
    listen 80;
<<<<<<< HEAD
    server_name your-domain.com www.your-domain.com;

    client_max_body_size 10M;
=======
    server_name your-domain.com;
>>>>>>> 68a6628852865b38b3eca3b329ef643020918ebe

    # Frontend
    location / {
        root /var/www/artist-site/dist;
        try_files $uri $uri/ /index.html;
<<<<<<< HEAD
=======
        
        # Кеширование статики
        location ~* \.(jpg|jpeg|png|gif|ico|css|js)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
>>>>>>> 68a6628852865b38b3eca3b329ef643020918ebe
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
<<<<<<< HEAD
        proxy_set_header Host $host;
=======
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
>>>>>>> 68a6628852865b38b3eca3b329ef643020918ebe
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Admin panel
    location /admin {
        proxy_pass http://localhost:3001/admin;
        proxy_http_version 1.1;
<<<<<<< HEAD
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    # Uploads
    location /uploads {
        alias /var/www/artist-site/public/uploads;
        expires 1y;
=======
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
>>>>>>> 68a6628852865b38b3eca3b329ef643020918ebe
    }
}
```

<<<<<<< HEAD
### Активация:
=======
Активация конфигурации:
>>>>>>> 68a6628852865b38b3eca3b329ef643020918ebe

```bash
# Создание симлинка
sudo ln -s /etc/nginx/sites-available/artist-site /etc/nginx/sites-enabled/

<<<<<<< HEAD
# Удаление default (опционально)
=======
# Удаление default конфигурации (опционально)
>>>>>>> 68a6628852865b38b3eca3b329ef643020918ebe
sudo rm /etc/nginx/sites-enabled/default

# Проверка конфигурации
sudo nginx -t

# Перезапуск Nginx
sudo systemctl restart nginx
```

<<<<<<< HEAD
Теперь доступ:
```
http://your-domain.com          # Frontend
http://your-domain.com/api      # Backend
http://your-domain.com/admin    # Admin
```

## 🔒 Шаг 7: SSL сертификат (Let's Encrypt)
=======
### 5. Настройка SSL с Let's Encrypt (рекомендуется)
>>>>>>> 68a6628852865b38b3eca3b329ef643020918ebe

```bash
# Установка Certbot
sudo apt install -y certbot python3-certbot-nginx

<<<<<<< HEAD
# Получение сертификата (автоматическая настройка Nginx)
=======
# Получение сертификата
>>>>>>> 68a6628852865b38b3eca3b329ef643020918ebe
sudo certbot --nginx -d your-domain.com -d www.your-domain.com

# Проверка автообновления
sudo certbot renew --dry-run
```

<<<<<<< HEAD
После этого ваш сайт будет доступен по HTTPS!

## 🔥 Firewall (UFW)

```bash
# Разрешить SSH
sudo ufw allow OpenSSH

# Разрешить HTTP и HTTPS
sudo ufw allow 'Nginx Full'

# Включить firewall
sudo ufw enable

# Проверить статус
sudo ufw status
```

## 🔄 Последующие деплои

После настройки просто делайте push:

```bash
git add .
git commit -m "Feature: добавил новую функцию"
=======
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
>>>>>>> 68a6628852865b38b3eca3b329ef643020918ebe
git push origin main
```

GitHub Actions автоматически:
<<<<<<< HEAD
1. Соберет новую версию
2. Создаст бэкап базы данных
3. Обновит код на VPS
4. Перезапустит приложение

## 🛠️ Полезные команды на VPS

```bash
# Статус PM2
=======
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
>>>>>>> 68a6628852865b38b3eca3b329ef643020918ebe
pm2 status

# Логи приложения
pm2 logs artist-site-backend

<<<<<<< HEAD
# Перезапуск
pm2 restart artist-site-backend

# Остановка
pm2 stop artist-site-backend

# Мониторинг (CPU, память)
pm2 monit

# Ручной запуск после изменений
cd /var/www/artist-site/server
pm2 restart artist-site-backend

# Просмотр структуры
cd /var/www/artist-site
ls -la
```

## 🐛 Troubleshooting

### Проблема: PM2 процесс не запускается

```bash
cd /var/www/artist-site/server
node server.js  # Запуск напрямую для просмотра ошибок
```

### Проблема: База данных не создается

```bash
=======
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
>>>>>>> 68a6628852865b38b3eca3b329ef643020918ebe
cd /var/www/artist-site/server
npm run init-db
```

<<<<<<< HEAD
### Проблема: Ошибка "Module not found"

```bash
cd /var/www/artist-site
npm install
cd server
npm install
pm2 restart artist-site-backend
```

### Проблема: 502 Bad Gateway в Nginx

```bash
# Проверить статус backend
pm2 status

# Проверить логи Nginx
sudo tail -f /var/log/nginx/error.log

# Проверить что backend слушает порт
sudo netstat -tlnp | grep 3001
```

### Проблема: GitHub Actions падает с ошибкой подключения

- Проверьте что SSH ключ добавлен в `~/.ssh/authorized_keys` на VPS
- Проверьте что в GitHub Secrets правильно указаны VPS_HOST и VPS_USERNAME
- Попробуйте подключиться вручную с локальной машины

## 📚 Дополнительные ресурсы

- [Полная конфигурация Nginx](./nginx.md)
- [Примеры команд](../DEPLOY_COMMANDS.md)
- [Production чеклист](../../PRODUCTION.md)

## ✅ Чеклист первой настройки

- [ ] VPS подготовлен (Node.js, PM2, Git установлены)
- [ ] SSH ключи сгенерированы и добавлены на VPS
- [ ] Все GitHub Secrets созданы
- [ ] JWT_SECRET сгенерирован и добавлен
- [ ] Первый push сделан, деплой прошел успешно
- [ ] PM2 процесс запущен и работает
- [ ] Nginx установлен и настроен (опционально)
- [ ] SSL сертификат получен (опционально)
- [ ] Firewall настроен
- [ ] Сайт открывается в браузере

🎉 **Поздравляем! Автоматический деплой настроен!**
=======
**Проблема**: 502 Bad Gateway в Nginx
```bash
pm2 status  # Проверьте статус backend
sudo nginx -t  # Проверьте конфигурацию nginx
```
>>>>>>> 68a6628852865b38b3eca3b329ef643020918ebe
