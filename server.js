const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// 静的ファイルの配信（v7 HTMLを公開）
app.use(express.static(path.join(__dirname)));

// Database
const db = require('./database');


// ===== API ENDPOINTS =====

// 0. Configuration API
app.get('/api/config', (req, res) => {
    res.json({
      domain: process.env.DOMAIN || 'https://charm-survey-production.up.railway.app',

// Survey link generation API
app.get('/api/survey-link/:companyId', (req, res) => {
      const domain = process.env.DOMAIN || 'https://charm-survey-production.up.railway.app';
      const companyId = req.params.companyId;
      res.json({
              surveyUrl: `${domain}?mode=survey&company=${companyId}`
      });
});

// 1. 企業一覧取得


app.get('/api/companies', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM companies ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching companies:', error);
    res.status(500).json({ error: 'Failed to fetch companies' });
  }
});

// 2. 企業作成
app.post('/api/companies', async (req, res) => {
  const { name } = req.body;
  if (!name) {
    return res.status(400).json({ error: 'Company name is required' });
  }

  try {
    const result = await db.query(
      'INSERT INTO companies (name) VALUES ($1) RETURNING *',
      [name]
    );
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error creating company:', error);
    res.status(500).json({ error: 'Failed to create company' });
  }
});

// 3. 回答者一覧取得（企業別）
app.get('/api/companies/:companyId/responders', async (req, res) => {
  const { companyId } = req.params;

  try {
    const result = await db.query(
      'SELECT * FROM responders WHERE company_id = $1 ORDER BY created_at DESC',
      [companyId]
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching responders:', error);
    res.status(500).json({ error: 'Failed to fetch responders' });
  }
});

// 4. 回答を保存
app.post('/api/survey/submit', async (req, res) => {
  const { companyId, responderName, department, position, joinedDate, answers } = req.body;

  if (!companyId || !responderName || !answers) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    // 回答者情報を保存
    const responderResult = await db.query(
      'INSERT INTO responders (company_id, name, department, position, joined_date) VALUES ($1, $2, $3, $4, $5) RETURNING id',
      [companyId, responderName, department, position, joinedDate]
    );

    const responderId = responderResult.rows[0].id;

    // 各質問の回答を保存
    for (const answer of answers) {
      await db.query(
        'INSERT INTO answers (responder_id, question_id, text_answer, rating) VALUES ($1, $2, $3, $4)',
        [responderId, answer.questionId, answer.text, answer.rating]
      );
    }

    res.json({ success: true, responderId });
  } catch (error) {
    console.error('Error submitting survey:', error);
    res.status(500).json({ error: 'Failed to submit survey' });
  }
});

// 5. 回答詳細取得（回答者別）
app.get('/api/responders/:responderId/answers', async (req, res) => {
  const { responderId } = req.params;

  try {
    const result = await db.query(
      'SELECT * FROM answers WHERE responder_id = $1 ORDER BY question_id',
      [responderId]
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching answers:', error);
    res.status(500).json({ error: 'Failed to fetch answers' });
  }
});

// 6. 質問一覧取得
app.get('/api/questions', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM questions ORDER BY id');
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching questions:', error);
    res.status(500).json({ error: 'Failed to fetch questions' });
  }
});

// 7. 質問更新
app.put('/api/questions/:questionId', async (req, res) => {
  const { questionId } = req.params;
  const { text } = req.body;

  if (!text) {
    return res.status(400).json({ error: 'Question text is required' });
  }

  try {
    const result = await db.query(
      'UPDATE questions SET text = $1 WHERE id = $2 RETURNING *',
      [text, questionId]
    );
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating question:', error);
    res.status(500).json({ error: 'Failed to update question' });
  }
});

// 8. レポート統計取得
app.get('/api/reports/:companyId', async (req, res) => {
  const { companyId } = req.params;

  try {
    // 平均評価
    const avgRating = await db.query(
      `SELECT AVG(rating) as average FROM answers
       WHERE responder_id IN (SELECT id FROM responders WHERE company_id = $1)`,
      [companyId]
    );

    // 質問別平均評価
    const questionStats = await db.query(
      `SELECT question_id, AVG(rating) as average, COUNT(*) as count FROM answers
       WHERE responder_id IN (SELECT id FROM responders WHERE company_id = $1)
       GROUP BY question_id ORDER BY question_id`,
      [companyId]
    );

    // 部署別平均評価
    const departmentStats = await db.query(
      `SELECT r.department, AVG(a.rating) as average, COUNT(DISTINCT r.id) as responder_count
       FROM responders r
       LEFT JOIN answers a ON r.id = a.responder_id
       WHERE r.company_id = $1
       GROUP BY r.department
       ORDER BY r.department`,
      [companyId]
    );

    res.json({
      averageRating: parseFloat(avgRating.rows[0].average) || 0,
      questionStats: questionStats.rows,
      departmentStats: departmentStats.rows
    });
  } catch (error) {
    console.error('Error fetching report:', error);
    res.status(500).json({ error: 'Failed to fetch report' });
  }
});

// ===== ROOT ROUTE =====
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'charm_survey_v6.html'));
});

// ===== ERROR HANDLING =====
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// ===== START SERVER =====
app.listen(PORT, () => {
  console.log(`✅ CharmSurvey server running at http://localhost:${PORT}`);
  console.log(`📍 Production domain: ${process.env.DOMAIN}`);
});
