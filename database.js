const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME
});

// ===== DATABASE INITIALIZATION =====

async function initializeDatabase() {
  try {
    // 企業テーブル
    await pool.query(`
      CREATE TABLE IF NOT EXISTS companies (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 回答者テーブル
    await pool.query(`
      CREATE TABLE IF NOT EXISTS responders (
        id SERIAL PRIMARY KEY,
        company_id INTEGER NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
        name VARCHAR(255) NOT NULL,
        department VARCHAR(100),
        position VARCHAR(100),
        joined_date DATE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 質問テーブル
    await pool.query(`
      CREATE TABLE IF NOT EXISTS questions (
        id SERIAL PRIMARY KEY,
        text TEXT NOT NULL,
        question_type VARCHAR(50) DEFAULT 'text_and_rating',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 回答テーブル
    await pool.query(`
      CREATE TABLE IF NOT EXISTS answers (
        id SERIAL PRIMARY KEY,
        responder_id INTEGER NOT NULL REFERENCES responders(id) ON DELETE CASCADE,
        question_id INTEGER NOT NULL REFERENCES questions(id),
        text_answer TEXT,
        rating INTEGER,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    console.log('✅ Database tables initialized successfully');

    // デフォルト質問を挿入
    await insertDefaultQuestions();
  } catch (error) {
    console.error('❌ Error initializing database:', error);
  }
}

async function insertDefaultQuestions() {
  try {
    const count = await pool.query('SELECT COUNT(*) FROM questions');

    if (count.rows[0].count === 0) {
      const questions = [
        'Q1: 当社のサービス／事業を一言で表すと？',
        'Q2: 当社のサービスについて、他社ではなく当社が選ばれる理由を説明できますか？',
        'Q3: 社内で当社サービスの魅力を語る際、使われている言葉や表現はどの程度共通していると感じますか？',
        'Q4: 当社サービスが、顧客の意思決定や行動を変えた事例を思い浮かべることができますか？',
        'Q5: 当社サービスの『向いていないケース』や『弱み・課題』を説明できますか？'
      ];

      for (const question of questions) {
        await pool.query('INSERT INTO questions (text) VALUES ($1)', [question]);
      }

      console.log('✅ Default questions inserted');
    }
  } catch (error) {
    console.error('❌ Error inserting default questions:', error);
  }
}

// Initialize database on startup
initializeDatabase();

module.exports = pool;
