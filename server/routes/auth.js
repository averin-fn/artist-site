import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import db from '../database.js';
import dotenv from 'dotenv';

dotenv.config();

const router = express.Router();

// Вход в админку
router.post('/login', (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Требуется имя пользователя и пароль' });
    }

    const stmt = db.prepare('SELECT * FROM users WHERE username = ?');
    const user = stmt.get(username);

    if (!user || !bcrypt.compareSync(password, user.password_hash)) {
      return res.status(401).json({ error: 'Неверные учетные данные' });
    }

    const token = jwt.sign(
      { id: user.id, username: user.username },
      process.env.JWT_SECRET || 'your_secret_key',
      { expiresIn: '24h' }
    );

    res.json({ token, username: user.username });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// Проверка токена
router.get('/verify', (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ valid: false });
  }

  try {
    jwt.verify(token, process.env.JWT_SECRET || 'your_secret_key');
    res.json({ valid: true });
  } catch (error) {
    res.status(401).json({ valid: false });
  }
});

// Смена пароля
router.post('/change-password', (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({ error: 'Требуется авторизация' });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_secret_key');
    } catch (error) {
      return res.status(401).json({ error: 'Недействительный токен' });
    }

    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Требуется текущий и новый пароль' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'Новый пароль должен быть не менее 6 символов' });
    }

    // Получаем текущего пользователя
    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(decoded.id);

    if (!user) {
      return res.status(404).json({ error: 'Пользователь не найден' });
    }

    // Проверяем текущий пароль
    if (!bcrypt.compareSync(currentPassword, user.password_hash)) {
      return res.status(401).json({ error: 'Неверный текущий пароль' });
    }

    // Хешируем новый пароль
    const newPasswordHash = bcrypt.hashSync(newPassword, 10);

    // Обновляем пароль
    db.prepare('UPDATE users SET password_hash = ? WHERE id = ?').run(newPasswordHash, decoded.id);

    res.json({ message: 'Пароль успешно изменен' });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

export default router;
