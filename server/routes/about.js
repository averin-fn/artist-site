import express from 'express';
import db from '../database.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

// Получить информацию "О художнике" (публичный)
router.get('/', (req, res) => {
  try {
    const info = db.prepare('SELECT * FROM about_info WHERE id = 1').get();
    const gallery = db.prepare('SELECT image_path FROM about_gallery ORDER BY order_index').all();

    if (!info) {
      return res.status(404).json({ error: 'Информация не найдена' });
    }

    res.json({
      ...info,
      gallery: gallery.map(g => g.image_path)
    });
  } catch (error) {
    console.error('Get about info error:', error);
    res.status(500).json({ error: 'Ошибка получения информации' });
  }
});

// Обновить информацию "О художнике" (требуется авторизация)
router.put('/', authMiddleware, (req, res) => {
  try {
    const { title, name, bio, experience, phone, email, vk, instagram, gallery } = req.body;

    const updateInfo = db.prepare(`
      UPDATE about_info 
      SET title = ?, name = ?, bio = ?, experience = ?, phone = ?, email = ?, vk = ?, instagram = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = 1
    `);

    updateInfo.run(title, name, bio, experience, phone, email, vk, instagram);

    // Обновить галерею
    if (gallery) {
      db.prepare('DELETE FROM about_gallery').run();
      
      const insertGallery = db.prepare('INSERT INTO about_gallery (image_path, order_index) VALUES (?, ?)');
      gallery.forEach((imagePath, index) => {
        insertGallery.run(imagePath, index);
      });
    }

    res.json({ message: 'Информация обновлена' });
  } catch (error) {
    console.error('Update about info error:', error);
    res.status(500).json({ error: 'Ошибка обновления информации' });
  }
});

export default router;
