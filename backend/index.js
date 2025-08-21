const express = require('express');
const cors = require('cors');
const pool = require('./db');

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.json({ message: 'Hello from backend' });
});

app.get('/api/entity', async (req, res) => {
  try {
    const result = await pool.query('SELECT id, name, created_at FROM entity ORDER BY id DESC');
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching entities', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/entity', async (req, res) => {
  const { name } = req.body;
  if (typeof name !== 'string' || !name.trim()) {
    return res.status(400).json({ error: 'Invalid name' });
  }
  try {
    const result = await pool.query('INSERT INTO entity (name) VALUES ($1) RETURNING id, name, created_at', [name.trim()]);
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Error inserting entity', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

if (require.main === module) {
  app.listen(port, () => {
    console.log(`Backend listening on port ${port}`);
  });
}

module.exports = app;
