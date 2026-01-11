import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

import authRoutes from './routes/auth.js';
import artworksRoutes from './routes/artworks.js';
import aboutRoutes from './routes/about.js';
import uploadRoutes from './routes/upload.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Статические файлы
app.use('/uploads', express.static(path.join(__dirname, '..', 'public', 'uploads')));
app.use('/admin', express.static(path.join(__dirname, 'admin')));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/artworks', artworksRoutes);
app.use('/api/about', aboutRoutes);
app.use('/api/upload', uploadRoutes);

// Базовый маршрут
app.get('/', (req, res) => {
  res.json({ 
    message: 'Artist Site API', 
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      artworks: '/api/artworks',
      about: '/api/about',
      upload: '/api/upload',
      admin: '/admin'
    }
  });
});

// Обработка ошибок
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Что-то пошло не так!' });
});

// Запуск сервера
app.listen(PORT, () => {
  console.log(`🚀 Сервер запущен на http://localhost:${PORT}`);
  console.log(`📊 Админка доступна на http://localhost:${PORT}/admin`);
  console.log(`🔌 API доступен на http://localhost:${PORT}/api`);
});
