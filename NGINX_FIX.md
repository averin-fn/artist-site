# Исправление ошибки 413 Request Entity Too Large

## Проблема
Nginx блокирует загрузку файлов из-за ограничения `client_max_body_size`.

## Решение

### Вариант 1: Обновить конфигурацию Nginx (РЕКОМЕНДУЕТСЯ)

1. **Подключитесь к серверу по SSH:**
```bash
ssh your-user@89.104.74.168
```

2. **Отредактируйте конфигурацию nginx:**
```bash
sudo nano /etc/nginx/sites-available/default
```

3. **Добавьте внутри блока `server { ... }`:**
```nginx
# Увеличить лимит загрузки файлов
client_max_body_size 50M;
client_body_timeout 300s;

# Таймауты для больших загрузок
proxy_connect_timeout 300;
proxy_send_timeout 300;
proxy_read_timeout 300;
send_timeout 300;
```

4. **Или если у вас есть отдельная конфигурация для сайта:**
```bash
sudo nano /etc/nginx/sites-available/artist-site
```

5. **Проверьте конфигурацию:**
```bash
sudo nginx -t
```

6. **Перезапустите nginx:**
```bash
sudo systemctl restart nginx
```

### Вариант 2: Использовать готовую конфигурацию

1. **Скопируйте файл `nginx.conf` на сервер:**
```bash
scp nginx.conf your-user@89.104.74.168:/tmp/
```

2. **На сервере:**
```bash
sudo cp /tmp/nginx.conf /etc/nginx/sites-available/artist-site
sudo ln -s /etc/nginx/sites-available/artist-site /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### Вариант 3: Глобальное изменение (для всех сайтов)

1. **Отредактируйте главный конфиг:**
```bash
sudo nano /etc/nginx/nginx.conf
```

2. **Добавьте в секцию `http { ... }`:**
```nginx
http {
    ...
    client_max_body_size 50M;
    ...
}
```

3. **Перезапустите nginx:**
```bash
sudo systemctl restart nginx
```

## Проверка

После изменений попробуйте загрузить изображение через админку снова.

## Дополнительно: Увеличение лимита в Multer

Если нужно загружать файлы больше 10MB, отредактируйте `server/routes/upload.js`:

```javascript
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 50 * 1024 * 1024 // 50MB вместо 10MB
  },
  ...
});
```

И обновите проверку в `server/admin/app.js` (строка 207):

```javascript
const maxSize = 50 * 1024 * 1024; // 50MB вместо 10MB
```

## Безопасность

⚠️ **Внимание:** Увеличение лимита загрузки может создать риски:
- DoS атаки через большие файлы
- Переполнение диска

**Рекомендации:**
- Используйте разумные лимиты (10-50MB)
- Настройте rate limiting в nginx
- Мониторьте использование диска
- Рассмотрите использование CDN для изображений
