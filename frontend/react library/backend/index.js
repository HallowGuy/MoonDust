const express = require('express')
const cors = require('cors')
const pool = require('./db')
require('dotenv').config()

const app = express()
const PORT = 3001

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

app.listen(PORT, () => {
  console.log(`✅ API démarrée sur http://localhost:${PORT}`)
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

// UPDATE (PUT) /api/users/:id
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


// DELETE /api/users/:id
app.delete('/api/users/:id', async (req, res) => {
  try {
    const { id } = req.params
    const { rowCount } = await pool.query('DELETE FROM users WHERE id = $1', [id])
    if (rowCount === 0) return res.status(404).json({ error: 'User introuvable' })
    res.status(204).send() // No Content
  } catch (e) {
    console.error(e)
    res.status(500).json({ error: 'Erreur serveur' })
  }
})

