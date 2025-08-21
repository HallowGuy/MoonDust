const express = require('express');
const pool = require('../../db');

const router = express.Router();
const port = process.env.PORT || 3000;

router.get('/', async (req, res) => {
  const result = {
    backend: { status: 'ok', endpoints: {} },
    database: { status: 'ok', migration: 'ok' },
  };

  // Test database connection
  try {
    await pool.query('SELECT 1');
  } catch (err) {
    result.database.status = 'error';
    result.database.error = err.message;
  }

  // Verify "entity" table exists
  try {
    const tableRes = await pool.query("SELECT to_regclass('public.entity') AS table_exists");
    if (!tableRes.rows[0] || !tableRes.rows[0].table_exists) {
      result.database.migration = 'missing';
      result.database.status = 'error';
    }
  } catch (err) {
    result.database.migration = 'error';
    result.database.status = 'error';
    result.database.error = err.message;
  }

  // Test backend endpoint
  try {
    const response = await fetch(`http://localhost:${port}/api/entity`);
    result.backend.endpoints['/api/entity'] = `${response.status} ${response.statusText}`;
    if (!response.ok) {
      result.backend.status = 'error';
    }
  } catch (err) {
    result.backend.status = 'error';
    result.backend.endpoints['/api/entity'] = err.message;
  }

  res.json(result);
});

module.exports = router;
