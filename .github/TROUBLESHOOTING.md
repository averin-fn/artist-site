# 🐛 Решение ошибок деплоя

## Ошибка: `fatal: not a git repository`

**Причина:** На VPS нет git репозитория в указанной директории.

**Решение:** Обновленный workflow автоматически клонирует репозиторий при первом деплое.

### Ручное решение (если нужно):

```bash
# Подключитесь к VPS
ssh ваш-пользователь@ваш-vps-ip

# Перейдите в родительскую директорию
cd /var/www

# Удалите директорию если она пустая или неправильная
rm -rf artist-site

# Клонируйте репозиторий
git clone https://github.com/ваш-username/artist-site.git
cd artist-site

# Установите зависимости
npm install
cd server && npm install
```

---

## Ошибка: `npm ci` требует package-lock.json

**Причина:** `npm ci` работает только с существующим package-lock.json

**Решение 1:** Обновленный workflow использует `npm install` для первой установки

**Решение 2:** Убедитесь что package-lock.json есть в репозитории:

```bash
# На локальной машине
npm install  # Это создаст package-lock.json если его нет
git add package-lock.json
git commit -m "Add package-lock.json"
git push

cd server
npm install
git add package-lock.json
git commit -m "Add server package-lock.json"
git push
```

---

## Ошибка: `cd: server: No such file or directory`

**Причина:** Workflow пытается перейти в директорию server из неправильного места.

**Решение:** Обновленный workflow использует абсолютные пути:

```bash
DEPLOY_PATH="/var/www/artist-site"
cd "$DEPLOY_PATH/server"
```

**Проверка на VPS:**

```bash
cd /var/www/artist-site
ls -la  # Должна быть директория server/
cd server
ls -la  # Должны быть файлы server.js, package.json и т.д.
```

---

## Ошибка: `Script not found: /var/www/server.js`

**Причина:** PM2 запускается с неправильным путем к server.js

**Решение:** Обновленный workflow использует правильный путь:

```bash
cd "$DEPLOY_PATH/server"
pm2 start server.js --name artist-site-backend
```

**Ручное исправление:**

```bash
# На VPS
pm2 delete artist-site-backend

# Перейдите в правильную директорию
cd /var/www/artist-site/server

# Запустите с правильным путем
pm2 start server.js --name artist-site-backend --time

# Сохраните конфигурацию
pm2 save
```

---

## Ошибка: Deployment failed - Permission denied

**Причина:** У пользователя нет прав на директорию /var/www

**Решение:**

```bash
# На VPS (под пользователем с sudo)
sudo mkdir -p /var/www/artist-site
sudo chown -R $USER:$USER /var/www/artist-site

# Или дайте права конкретному пользователю
sudo chown -R ubuntu:ubuntu /var/www/artist-site
```

---

## Ошибка: Port 3001 already in use

**Причина:** Приложение уже запущено или порт занят другим процессом

**Решение:**

```bash
# Проверьте PM2 процессы
pm2 list

# Если есть старый процесс
pm2 delete artist-site-backend

# Проверьте что порт свободен
sudo netstat -tlnp | grep 3001

# Если порт занят другим процессом
sudo lsof -ti:3001 | xargs kill -9

# Запустите заново
cd /var/www/artist-site/server
pm2 start server.js --name artist-site-backend
```

---

## Ошибка: Cannot find module 'express'

**Причина:** Зависимости backend не установлены

**Решение:**

```bash
cd /var/www/artist-site/server
npm install
pm2 restart artist-site-backend
```

---

## Ошибка: Database locked

**Причина:** SQLite база данных заблокирована другим процессом

**Решение:**

```bash
# Остановите приложение
pm2 stop artist-site-backend

# Подождите 5 секунд
sleep 5

# Запустите заново
pm2 start artist-site-backend

# Если не помогло - проверьте WAL файлы
cd /var/www/artist-site/server
ls -la *.db*

# В крайнем случае удалите WAL файлы (безопасно)
rm -f artist.db-shm artist.db-wal
pm2 restart artist-site-backend
```

---

## Ошибка: 502 Bad Gateway (Nginx)

**Причина:** Backend не запущен или не отвечает

**Решение:**

```bash
# 1. Проверьте статус PM2
pm2 status
pm2 logs artist-site-backend --lines 50

# 2. Проверьте что backend слушает порт
curl http://localhost:3001/api

# 3. Проверьте логи Nginx
sudo tail -f /var/log/nginx/error.log

# 4. Если backend не запущен
cd /var/www/artist-site/server
pm2 start server.js --name artist-site-backend

# 5. Проверьте конфигурацию Nginx
sudo nginx -t
sudo systemctl restart nginx
```

---

## Ошибка: GitHub Actions timeout

**Причина:** SSH подключение занимает слишком много времени

**Решение:**

```bash
# Проверьте что можете подключиться вручную
ssh -i ~/.ssh/github_actions_deploy ваш-пользователь@ваш-vps-ip

# Проверьте что порт SSH открыт
telnet ваш-vps-ip 22

# Проверьте firewall на VPS
sudo ufw status
sudo ufw allow 22/tcp
```

---

## Ошибка: Frontend не обновляется после деплоя

**Причина:** Nginx отдает кешированные файлы

**Решение:**

```bash
# На VPS
cd /var/www/artist-site

# Пересоберите frontend
npm run build

# Очистите кеш Nginx (если используете)
sudo systemctl reload nginx

# В браузере очистите кеш (Ctrl+Shift+R)
```

---

## 🔍 Общая диагностика

```bash
# Проверка всего стека
echo "=== Checking Node.js ==="
node --version
npm --version

echo "=== Checking PM2 ==="
pm2 --version
pm2 status

echo "=== Checking project ==="
cd /var/www/artist-site
ls -la
cat server/.env

echo "=== Checking database ==="
ls -la server/*.db*

echo "=== Checking ports ==="
sudo netstat -tlnp | grep -E '3001|80|443'

echo "=== Checking logs ==="
pm2 logs artist-site-backend --lines 20 --nostream
```

---

## 📝 Чеклист после ошибки

- [ ] PM2 процесс запущен: `pm2 status`
- [ ] Backend отвечает: `curl http://localhost:3001/api`
- [ ] База данных существует: `ls server/artist.db`
- [ ] .env файл существует: `ls server/.env`
- [ ] Зависимости установлены: `ls server/node_modules`
- [ ] Порт свободен: `sudo netstat -tlnp | grep 3001`
- [ ] Логи без критических ошибок: `pm2 logs`
- [ ] Git репозиторий инициализирован: `ls -la .git`

---

## 🆘 Полный сброс (крайняя мера)

Если ничего не помогает:

```bash
# На VPS
cd /var/www

# Остановите приложение
pm2 delete artist-site-backend

# Создайте бэкап БД
cp artist-site/server/artist.db ~/artist_backup_$(date +%Y%m%d).db

# Удалите директорию
rm -rf artist-site

# Клонируйте заново
git clone https://github.com/ваш-username/artist-site.git
cd artist-site

# Установите зависимости
npm install
cd server && npm install

# Восстановите БД если нужно
cp ~/artist_backup_*.db server/artist.db

# Создайте .env (скопируйте из старого или заново)
nano server/.env

# Запустите
pm2 start server/server.js --name artist-site-backend --time
pm2 save
```

---

## 📞 Нужна помощь?

1. Проверьте логи: `pm2 logs artist-site-backend`
2. Проверьте статус: `pm2 status`
3. Проверьте GitHub Actions логи в репозитории
4. Следуйте пошаговой инструкции в `.github/workflows/README.md`
