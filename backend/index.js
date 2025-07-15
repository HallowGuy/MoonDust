const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');

const app = express();
app.use(cors());
app.use(express.json());

const pool = new Pool({
  host: process.env.DB_HOST || 'database',
  port: process.env.DB_PORT || 5432,
  user: process.env.DB_USER || 'appuser',
  password: process.env.DB_PASSWORD || 'apppassword',
  database: process.env.DB_DATABASE || 'appdb'
});

app.get('/contacts', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM metaappback.contact ORDER BY id');
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'internal error' });
  }
});

app.get('/contacts/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { rows } = await pool.query('SELECT * FROM metaappback.contact WHERE id = $1', [id]);
    if (rows.length === 0) return res.sendStatus(404);
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'internal error' });
  }
});

app.post('/contacts', async (req, res) => {
  try {
    const { name, phone, email, kind } = req.body;
    const { rows } = await pool.query(
      'INSERT INTO metaappback.contact (name, phone, email, kind) VALUES ($1, $2, $3, $4) RETURNING *',
      [name, phone, email, kind]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'internal error' });
  }
});

app.put('/contacts/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, phone, email, kind } = req.body;
    const result = await pool.query(
      'UPDATE metaappback.contact SET name=$1, phone=$2, email=$3, kind=$4 WHERE id=$5 RETURNING *',
      [name, phone, email, kind, id]
    );
    if (result.rowCount === 0) return res.sendStatus(404);
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'internal error' });
  }
});

app.delete('/contacts/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('DELETE FROM metaappback.contact WHERE id=$1', [id]);
    if (result.rowCount === 0) return res.sendStatus(404);
    res.sendStatus(204);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'internal error' });
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
