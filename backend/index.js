require('dotenv').config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const pinoHttp = require('pino-http');
const logger = require('./logger');
const pool = require('./db');

const app = express();
const port = process.env.PORT || 3000;

const corsOptions = {
  origin: process.env.CORS_ORIGIN,
  optionsSuccessStatus: 200,
};

app.use(helmet());
app.use(cors(corsOptions));
app.use(express.json());
app.use(pinoHttp({ logger }));

app.get('/healthcheck', (req, res) => {
  res.json({ status: 'ok' });
});

app.get('/', (req, res) => {
  res.json({ message: 'Hello from backend' });
});

app.get('/api/entity', async (req, res, next) => {
  try {
    const result = await pool.query('SELECT id, name, created_at FROM entity ORDER BY id DESC');
    res.json(result.rows);
  } catch (err) {
    next(err);
  }
});

app.post('/api/entity', async (req, res, next) => {
  const { name } = req.body;
  if (typeof name !== 'string' || !name.trim()) {
    return res.status(400).json({ error: 'Invalid name' });
  }
  try {
    const result = await pool.query('INSERT INTO entity (name) VALUES ($1) RETURNING id, name, created_at', [name.trim()]);
    res.status(201).json(result.rows[0]);
  } catch (err) {
    next(err);
  }
});

// 404 handler
app.use((req, res, next) => {
  res.status(404).json({ error: 'Not Found' });
});

// Global error handler
app.use((err, req, res, next) => {
  req.log.error(err);
  res.status(err.status || 500).json({ error: err.message || 'Internal server error' });
});

if (require.main === module) {
  app.listen(port, () => {
    logger.info(`Backend listening on port ${port}`);
  });
}

module.exports = app;
