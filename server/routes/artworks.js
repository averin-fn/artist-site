import express from 'express';
import db from '../database.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

// Получить все работы (публичный)
router.get('/', (req, res) => {
  try {
    const artworks = db.prepare(`
      SELECT a.*, GROUP_CONCAT(ai.image_path, '|') as images
      FROM artworks a
      LEFT JOIN artwork_images ai ON a.id = ai.artwork_id
      GROUP BY a.id
      ORDER BY a.created_at DESC
    `).all();

    const formattedArtworks = artworks.map(artwork => ({
      ...artwork,
      images: artwork.images ? artwork.images.split('|') : []
    }));

    res.json(formattedArtworks);
  } catch (error) {
    console.error('Get artworks error:', error);
    res.status(500).json({ error: 'Ошибка получения работ' });
  }
});

// Получить одну работу (публичный)
router.get('/:id', (req, res) => {
  try {
    const artwork = db.prepare('SELECT * FROM artworks WHERE id = ?').get(req.params.id);
    
    if (!artwork) {
      return res.status(404).json({ error: 'Работа не найдена' });
    }

    const images = db.prepare('SELECT image_path FROM artwork_images WHERE artwork_id = ? ORDER BY order_index').all(req.params.id);
    artwork.images = images.map(img => img.image_path);

    res.json(artwork);
  } catch (error) {
    console.error('Get artwork error:', error);
    res.status(500).json({ error: 'Ошибка получения работы' });
  }
});

// Создать новую работу (требуется авторизация)
router.post('/', authMiddleware, (req, res) => {
  try {
    const { title, description, price, category, year, medium, size, images } = req.body;

    if (!title || !category) {
      return res.status(400).json({ error: 'Требуется название и категория' });
    }

    // Используем транзакцию для атомарности
    const transaction = db.transaction(() => {
      const insertArtwork = db.prepare(`
        INSERT INTO artworks (title, description, price, category, year, medium, size)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `);

      const result = insertArtwork.run(title, description, price, category, year, medium, size);
      const artworkId = result.lastInsertRowid;

      // Добавить изображения
      if (images && images.length > 0) {
        const insertImage = db.prepare('INSERT INTO artwork_images (artwork_id, image_path, order_index) VALUES (?, ?, ?)');
        images.forEach((imagePath, index) => {
          insertImage.run(artworkId, imagePath, index);
        });
      }

      return artworkId;
    });

    const artworkId = transaction();
    res.status(201).json({ id: artworkId, message: 'Работа создана' });
  } catch (error) {
    console.error('Create artwork error:', error);
    res.status(500).json({ error: 'Ошибка создания работы' });
  }
});

// Обновить работу (требуется авторизация)
router.put('/:id', authMiddleware, (req, res) => {
  try {
    const { title, description, price, category, year, medium, size, images } = req.body;
    const artworkId = req.params.id;

    // Используем транзакцию
    const transaction = db.transaction(() => {
      const updateArtwork = db.prepare(`
        UPDATE artworks 
        SET title = ?, description = ?, price = ?, category = ?, year = ?, medium = ?, size = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `);

      const result = updateArtwork.run(title, description, price, category, year, medium, size, artworkId);

      if (result.changes === 0) {
        throw new Error('Работа не найдена');
      }

      // Обновить изображения
      if (images) {
        db.prepare('DELETE FROM artwork_images WHERE artwork_id = ?').run(artworkId);
        
        const insertImage = db.prepare('INSERT INTO artwork_images (artwork_id, image_path, order_index) VALUES (?, ?, ?)');
        images.forEach((imagePath, index) => {
          insertImage.run(artworkId, imagePath, index);
        });
      }
    });

    transaction();
    res.json({ message: 'Работа обновлена' });
  } catch (error) {
    console.error('Update artwork error:', error);
    if (error.message === 'Работа не найдена') {
      return res.status(404).json({ error: error.message });
    }
    res.status(500).json({ error: 'Ошибка обновления работы' });
  }
});

// Удалить работу (требуется авторизация)
router.delete('/:id', authMiddleware, (req, res) => {
  try {
    const result = db.prepare('DELETE FROM artworks WHERE id = ?').run(req.params.id);

    if (result.changes === 0) {
      return res.status(404).json({ error: 'Работа не найдена' });
    }

    res.json({ message: 'Работа удалена' });
  } catch (error) {
    console.error('Delete artwork error:', error);
    res.status(500).json({ error: 'Ошибка удаления работы' });
  }
});

export default router;
