import Database from 'better-sqlite3';
import bcrypt from 'bcryptjs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const db = new Database(join(__dirname, '..', 'artist.db'));
db.pragma('journal_mode = WAL');

// Создание таблиц
const initTables = () => {
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

  console.log('Database tables created successfully');
};

// Создаём админа по умолчанию
const initAdmin = () => {
  const username = process.env.ADMIN_USERNAME || 'admin';
  const password = process.env.ADMIN_PASSWORD || 'admin123';
  
  const passwordHash = bcrypt.hashSync(password, 10);
  
  try {
    const stmt = db.prepare('INSERT INTO users (username, password_hash) VALUES (?, ?)');
    stmt.run(username, passwordHash);
    console.log(`Admin user created: ${username}`);
  } catch (error) {
    if (error.code === 'SQLITE_CONSTRAINT') {
      console.log('Admin user already exists');
    } else {
      throw error;
    }
  }
};

// Инициализация данных "О художнике"
const initAboutInfo = () => {
  try {
    const stmt = db.prepare(`
      INSERT INTO about_info (id, title, name, bio, experience, phone, email, vk, instagram)
      VALUES (1, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    stmt.run(
      'О художнике',
      'Имя художника',
      'Я художник с более чем 10 лет опыта в различных техниках живописи и рисунка.',
      '10+ лет профессиональной деятельности',
      '+7 (999) 123-45-67',
      'artist@example.com',
      'https://vk.com/artist',
      'https://instagram.com/artist'
    );
    console.log('About info initialized');
  } catch (error) {
    if (error.code === 'SQLITE_CONSTRAINT') {
      console.log('About info already exists');
    } else {
      throw error;
    }
  }
};

// Запускаем инициализацию таблиц перед созданием пользователей
initTables();
initAdmin();
initAboutInfo();

db.close();
console.log('Initialization complete!');
