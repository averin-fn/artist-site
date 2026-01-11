import express from 'express';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import fs from 'fs';
import { authMiddleware } from '../middleware/auth.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const router = express.Router();

// Настройка хранилища для multer
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, '..', '..', 'public', 'uploads');
    
    // Создать директорию если её нет
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB
  },
  fileFilter: function (req, file, cb) {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Разрешены только изображения (jpeg, jpg, png, gif, webp)'));
    }
  }
});

// Загрузить одно изображение
router.post('/single', authMiddleware, upload.single('image'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Файл не загружен' });
    }

    const imagePath = `/uploads/${req.file.filename}`;
    res.json({ path: imagePath, message: 'Файл загружен успешно' });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Ошибка загрузки файла' });
  }
});

// Загрузить несколько изображений
router.post('/multiple', authMiddleware, upload.array('images', 10), (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'Файлы не загружены' });
    }

    const imagePaths = req.files.map(file => `/uploads/${file.filename}`);
    res.json({ paths: imagePaths, message: 'Файлы загружены успешно' });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Ошибка загрузки файлов' });
  }
});

// Удалить изображение
router.delete('/:filename', authMiddleware, (req, res) => {
  try {
    const filename = req.params.filename;
    const filePath = path.join(__dirname, '..', '..', 'public', 'uploads', filename);

    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      res.json({ message: 'Файл удален' });
    } else {
      res.status(404).json({ error: 'Файл не найден' });
    }
  } catch (error) {
    console.error('Delete error:', error);
    res.status(500).json({ error: 'Ошибка удаления файла' });
  }
});

export default router;
