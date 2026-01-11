import Database from 'better-sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const db = new Database(join(__dirname, 'artist.db'));
db.pragma('journal_mode = WAL');

// Создание таблиц
const initDB = () => {
  // Таблица для работ/картин
  db.exec(`
    CREATE TABLE IF NOT EXISTS artworks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT,
      price INTEGER,
      category TEXT NOT NULL,
      year INTEGER,
      medium TEXT,
      size TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Таблица для изображений работ
  db.exec(`
    CREATE TABLE IF NOT EXISTS artwork_images (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      artwork_id INTEGER NOT NULL,
      image_path TEXT NOT NULL,
      order_index INTEGER DEFAULT 0,
      FOREIGN KEY (artwork_id) REFERENCES artworks(id) ON DELETE CASCADE
    )
  `);

  // Таблица для настроек сайта
  db.exec(`
    CREATE TABLE IF NOT EXISTS site_settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Таблица для информации "О художнике"
  db.exec(`
    CREATE TABLE IF NOT EXISTS about_info (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      title TEXT NOT NULL,
      name TEXT NOT NULL,
      bio TEXT,
      experience TEXT,
      phone TEXT,
      email TEXT,
      vk TEXT,
      instagram TEXT,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Таблица для галереи "О художнике"
  db.exec(`
    CREATE TABLE IF NOT EXISTS about_gallery (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      image_path TEXT NOT NULL,
      order_index INTEGER DEFAULT 0
    )
  `);

  // Таблица для пользователей админки
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  console.log('Database initialized successfully');
};

initDB();

export default db;
