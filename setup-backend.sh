#!/bin/bash

echo "========================================"
echo "  Установка Backend для сайта художника"
echo "========================================"
echo ""

cd server

echo "[1/3] Установка зависимостей..."
npm install

echo ""
echo "[2/3] Инициализация базы данных..."
npm run init-db

echo ""
echo "[3/3] Готово!"
echo ""
echo "========================================"
echo "  Backend успешно установлен!"
echo "========================================"
echo ""
echo "Для запуска сервера выполните:"
echo "  cd server"
echo "  npm start"
echo ""
echo "Админ-панель будет доступна на:"
echo "  http://localhost:3001/admin"
echo ""
echo "Данные для входа:"
echo "  Логин: admin"
echo "  Пароль: admin123"
echo ""
