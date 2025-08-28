const express = require('express')
const cors = require('cors')
const pool = require('./db')
require('dotenv').config()

const app = express()
const PORT = process.env.PORT || 5000

app.use(cors())
app.use(express.json())

// Test route
app.get('/api/users', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM users')
    res.json(result.rows)
  } catch (error) {
    console.error('Erreur SQL :', error)
    res.status(500).json({ error: 'Erreur serveur' })
  }
})

// POST
app.post('/api/users', async (req, res) => {
  try {
    const { name, email } = req.body
    if (!name || !email) return res.status(400).json({ error: 'name et email requis' })

    const { rows } = await pool.query(
      'INSERT INTO users (name, email) VALUES ($1, $2) RETURNING *',
      [name, email]
    )
    res.status(201).json(rows[0])
  } catch (e) {
    console.error(e)
    res.status(500).json({ error: 'Erreur serveur' })
  }
})

// UPDATE
app.put('/api/users/:id', async (req, res) => {
  try {
    const { id } = req.params
    const { name, email } = req.body
    if (!name || !email) return res.status(400).json({ error: 'name et email requis' })

    const { rows } = await pool.query(
      'UPDATE users SET name=$1, email=$2 WHERE id=$3 RETURNING *',
      [name, email, id]
    )
    if (rows.length === 0) return res.status(404).json({ error: 'User introuvable' })
    res.json(rows[0])
  } catch (e) {
    console.error(e)
    res.status(500).json({ error: 'Erreur serveur' })
  }
})

// DELETE
app.delete('/api/users/:id', async (req, res) => {
  try {
    const { id } = req.params
    const { rowCount } = await pool.query('DELETE FROM users WHERE id = $1', [id])
    if (rowCount === 0) return res.status(404).json({ error: 'User introuvable' })
    res.status(204).send()
  } catch (e) {
    console.error(e)
    res.status(500).json({ error: 'Erreur serveur' })
  }
})

app.get('/api/users', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM users')
    res.json(result.rows)
  } catch (error) {
    console.error('Erreur SQL :', error)
    res.status(500).json({ error: 'Erreur serveur' })
  }
})

app.get('/api/users/count', async (req, res) => {
  try {
    const result = await pool.query('SELECT COUNT(*) FROM users')
    res.json({ count: result.rows[0].count })
  } catch (err) {
    console.error(err)
    res.status(500).send('Erreur serveur')
  }
})

// ✅ Docker-friendly listen
app.listen(PORT, "0.0.0.0", () => {
  console.log(`✅ API démarrée sur http://0.0.0.0:${PORT}`)
})
