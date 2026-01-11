#!/bin/bash
# Скрипт диагностики проблем с деплоем
# Запустите на VPS: bash DIAGNOSTIC_SCRIPT.sh

echo "==================================="
echo "🔍 ДИАГНОСТИКА ARTIST SITE"
echo "==================================="

echo ""
echo "1️⃣ Проверка PM2 процесса"
echo "-----------------------------------"
pm2 list
pm2 logs artist-site-backend --lines 20 --nostream

echo ""
echo "2️⃣ Проверка Backend (localhost:3001)"
echo "-----------------------------------"
curl -v http://localhost:3001/api 2>&1 | head -20

echo ""
echo "3️⃣ Проверка портов"
echo "-----------------------------------"
sudo netstat -tlnp | grep -E '3001|80|443' || netstat -tln | grep -E '3001|80|443'

echo ""
echo "4️⃣ Проверка Nginx"
echo "-----------------------------------"
sudo systemctl status nginx --no-pager || systemctl status nginx --no-pager || echo "Nginx не установлен или не работает"

echo ""
echo "5️⃣ Проверка конфигурации Nginx"
echo "-----------------------------------"
if [ -f /etc/nginx/sites-enabled/artist-site ]; then
  echo "Конфигурация найдена:"
  cat /etc/nginx/sites-enabled/artist-site
else
  echo "⚠️ Конфигурация Nginx не найдена в /etc/nginx/sites-enabled/artist-site"
  echo "Доступные конфигурации:"
  ls -la /etc/nginx/sites-enabled/ 2>/dev/null || echo "Директория не найдена"
fi

echo ""
echo "6️⃣ Проверка Frontend файлов"
echo "-----------------------------------"
if [ -d /var/www/artist-site/dist ]; then
  echo "✅ Директория dist существует"
  ls -lh /var/www/artist-site/dist/ | head -10
else
  echo "❌ Директория dist не найдена"
fi

echo ""
echo "7️⃣ Проверка Firewall"
echo "-----------------------------------"
sudo ufw status 2>/dev/null || echo "UFW не установлен или не активен"

echo ""
echo "8️⃣ Проверка логов Nginx"
echo "-----------------------------------"
if [ -f /var/log/nginx/error.log ]; then
  echo "Последние ошибки Nginx:"
  sudo tail -20 /var/log/nginx/error.log
else
  echo "Логи Nginx не найдены"
fi

echo ""
echo "==================================="
echo "✅ ДИАГНОСТИКА ЗАВЕРШЕНА"
echo "==================================="
