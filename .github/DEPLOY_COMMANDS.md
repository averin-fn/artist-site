# Примеры команд для деплоя

## 🚀 Автоматический деплой через GitHub Actions

### Деплой через Git Pull (основной)
```bash
# Просто сделайте push в main ветку
git add .
git commit -m "Update: новые функции"
git push origin main
```

### Ручной деплой через Rsync
```bash
# В GitHub: Actions → Deploy via RSYNC → Run workflow
```

## 🖥️ Ручной деплой на VPS

### Через SSH
```bash
# Подключение к VPS
ssh user@your-vps-ip

# Переход в проект
cd /var/www/artist-site

# Обновление кода
git pull origin main

# Обновление зависимостей и сборка
npm ci && npm run build
cd server && npm ci

# Перезапуск
pm2 restart artist-site-backend
```

### Через локальную машину с Rsync
```bash
# Сборка локально
npm ci && npm run build
cd server && npm ci && cd ..

# Загрузка на VPS (исключая ненужные файлы)
rsync -avz --progress \
  --exclude 'node_modules' \
  --exclude '.git' \
  --exclude '.env' \
  --exclude '*.db' \
  --exclude '*.db-*' \
  ./ user@your-vps-ip:/var/www/artist-site/

# Подключение и перезапуск
ssh user@your-vps-ip "cd /var/www/artist-site/server && npm ci --production && pm2 restart artist-site-backend"
```

## 📦 Создание релиза

### С использованием Git Tags
```bash
# Создание тега
git tag -a v1.0.0 -m "Release version 1.0.0"

# Отправка тега
git push origin v1.0.0

# Создание релиза на GitHub
gh release create v1.0.0 --title "Version 1.0.0" --notes "Описание изменений"
```

## 🔄 Управление PM2 процессами

### Базовые команды
```bash
# Запуск
pm2 start server/server.js --name artist-site-backend

# Остановка
pm2 stop artist-site-backend

# Перезапуск
pm2 restart artist-site-backend

# Удаление процесса
pm2 delete artist-site-backend

# Статус всех процессов
pm2 status

# Логи
pm2 logs artist-site-backend

# Мониторинг
pm2 monit
```

### Продвинутые команды
```bash
# Запуск с параметрами
pm2 start server/server.js \
  --name artist-site-backend \
  --time \
  --max-memory-restart 500M \
  --exp-backoff-restart-delay=100

# Кластерный режим (использование всех ядер)
pm2 start server/server.js \
  --name artist-site-backend \
  -i max

# Обновление переменных окружения
pm2 restart artist-site-backend --update-env

# Сброс статистики
pm2 reset artist-site-backend
```

## 💾 Бэкапы

### Создание бэкапа вручную
```bash
# База данных
cd /var/www/artist-site
timestamp=$(date +%Y%m%d_%H%M%S)
cp server/artist.db backups/artist_$timestamp.db

# Весь проект
tar -czf /backups/artist-site_$timestamp.tar.gz /var/www/artist-site
```

### Восстановление из бэкапа
```bash
# База данных
cp backups/artist_20260111_120000.db server/artist.db
pm2 restart artist-site-backend

# Весь проект
cd /var/www
tar -xzf /backups/artist-site_20260111_120000.tar.gz
cd artist-site/server
npm ci
pm2 restart artist-site-backend
```

### Автоматические бэкапы (cron)
```bash
# Редактирование crontab
crontab -e

# Ежедневный бэкап БД в 3:00
0 3 * * * cp /var/www/artist-site/server/artist.db /var/www/artist-site/backups/artist_$(date +\%Y\%m\%d).db

# Еженедельный полный бэкап в воскресенье в 4:00
0 4 * * 0 tar -czf /backups/artist-site_$(date +\%Y\%m\%d).tar.gz /var/www/artist-site

# Очистка старых бэкапов (>30 дней)
0 5 * * * find /var/www/artist-site/backups -name "artist_*.db" -mtime +30 -delete
```

## 🔍 Проверка и отладка

### Проверка работы приложения
```bash
# Проверка backend
curl http://localhost:3001/api

# Проверка с внешнего хоста
curl http://your-domain.com/api

# Проверка PM2 процесса
pm2 list

# Детальная информация о процессе
pm2 info artist-site-backend
```

### Просмотр логов
```bash
# Логи PM2
pm2 logs artist-site-backend --lines 100

# Логи Nginx
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log

# Системные логи
journalctl -u nginx -f
```

### Проверка портов
```bash
# Проверка что приложение слушает порт
sudo netstat -tlnp | grep 3001
# или
sudo ss -tlnp | grep 3001

# Проверка открытых портов
sudo ufw status
```

## 🔧 Обновление зависимостей

### Обновление npm пакетов
```bash
# Backend
cd /var/www/artist-site/server
npm outdated
npm update
npm audit fix

# Frontend
cd /var/www/artist-site
npm outdated
npm update
npm run build

# Перезапуск
pm2 restart artist-site-backend
```

### Обновление Node.js
```bash
# Через nvm
nvm install 20
nvm use 20

# Или через официальный репозиторий
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs
```

## 🚨 Аварийное восстановление

### Если сайт не работает
```bash
# 1. Проверить PM2 процесс
pm2 status
pm2 logs artist-site-backend --err

# 2. Перезапустить приложение
pm2 restart artist-site-backend

# 3. Если не помогло - удалить и запустить заново
pm2 delete artist-site-backend
cd /var/www/artist-site/server
pm2 start server.js --name artist-site-backend

# 4. Проверить Nginx
sudo nginx -t
sudo systemctl restart nginx

# 5. Восстановить из бэкапа (крайняя мера)
git reset --hard origin/main
npm ci && npm run build
cd server && npm ci
pm2 restart artist-site-backend
```

## 📊 Мониторинг производительности

### С помощью PM2
```bash
# Установка PM2 Plus (опционально)
pm2 install pm2-server-monit

# Веб-интерфейс мониторинга
pm2 web
# Доступен на http://your-vps-ip:9615
```

### Проверка ресурсов
```bash
# Использование CPU и памяти
pm2 monit

# Системная информация
htop

# Использование диска
df -h

# Размер проекта
du -sh /var/www/artist-site
```

## 🔐 Безопасность

### Обновление секретов
```bash
# На VPS
cd /var/www/artist-site/server
nano .env

# Изменить JWT_SECRET, пароли и т.д.
# Перезапустить
pm2 restart artist-site-backend
```

### Проверка безопасности
```bash
# Аудит npm пакетов
cd /var/www/artist-site/server
npm audit

# Исправление уязвимостей
npm audit fix

# Принудительное исправление (осторожно!)
npm audit fix --force
```
