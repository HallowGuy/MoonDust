const express = require('express')
const cors = require('cors')
const pool = require('./db')
const fs = require('fs')
const path = require('path')
const mime = require('mime-types')
require('dotenv').config()

const app = express()
const PORT = process.env.PORT || 5001

// ---------- MIDDLEWARES ----------
app.use(cors({
  origin: [
    'http://localhost:3000', // React CRA
    'http://localhost:5173'  // Vite
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type']
}))

app.use(express.json())

// 👉 servir les fichiers uploadés
app.get('/uploads/:file', (req, res) => {
  const filePath = path.join(__dirname, 'uploads', req.params.file)

  if (!fs.existsSync(filePath)) {
    return res.status(404).send('Fichier introuvable')
  }

  const type = mime.lookup(filePath) || 'application/octet-stream'
  res.setHeader('Content-Type', type)

  // ✅ forcer l'affichage inline au lieu de téléchargement
  res.setHeader('Content-Disposition', `inline; filename="${req.params.file}"`)

  fs.createReadStream(filePath).pipe(res)
})

// ---------- MULTER CONFIG ----------
const multer = require('multer')

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join(__dirname, 'uploads')),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname)
    cb(null, Date.now() + ext) // ex: 1693223123123.pdf
  }
})
const upload = multer({ storage })

// ----------------------------------------------------
// ------------------------- USERS --------------------
// ----------------------------------------------------
app.get('/api/users', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM demo_first.users ORDER BY id')
    res.json(result.rows)
  } catch (error) {
    console.error('❌ Erreur SQL :', error)
    res.status(500).json({ error: 'Erreur serveur' })
  }
})

app.get('/api/users/count', async (req, res) => {
  try {
    const result = await pool.query('SELECT COUNT(*) FROM demo_first.users')
    res.json({ count: result.rows[0].count })
  } catch (err) {
    console.error('❌ Erreur SQL :', err)
    res.status(500).send('Erreur serveur')
  }
})

app.post('/api/users', async (req, res) => {
  try {
    const { username, email, display_name } = req.body
    if (!username || !email) {
      return res.status(400).json({ error: 'username et email requis' })
    }

    const { rows } = await pool.query(
      `INSERT INTO demo_first.users (username, email, display_name) 
       VALUES ($1, $2, $3) RETURNING *`,
      [username, email, display_name || null]
    )
    res.status(201).json(rows[0])
  } catch (e) {
    console.error('❌ Erreur SQL :', e)
    res.status(500).json({ error: 'Erreur serveur' })
  }
})

app.put('/api/users/:id', async (req, res) => {
  try {
    const { id } = req.params
    const { username, email, display_name, is_active } = req.body
    if (!username || !email) {
      return res.status(400).json({ error: 'username et email requis' })
    }

    const { rows } = await pool.query(
      `UPDATE demo_first.users 
       SET username=$1, email=$2, display_name=$3, is_active=$4, updated_at=NOW()
       WHERE id=$5 RETURNING *`,
      [username, email, display_name || null, is_active ?? true, id]
    )

    if (rows.length === 0) {
      return res.status(404).json({ error: 'User introuvable' })
    }
    res.json(rows[0])
  } catch (e) {
    console.error('❌ Erreur SQL :', e)
    res.status(500).json({ error: 'Erreur serveur' })
  }
})

app.delete('/api/users/:id', async (req, res) => {
  try {
    const { id } = req.params
    const { rowCount } = await pool.query('DELETE FROM demo_first.users WHERE id=$1', [id])
    if (rowCount === 0) {
      return res.status(404).json({ error: 'User introuvable' })
    }
    res.status(204).send()
  } catch (e) {
    console.error('❌ Erreur SQL :', e)
    res.status(500).json({ error: 'Erreur serveur' })
  }
})

// ----------------------------------------------------
// ------------------------- ROLES --------------------
// ----------------------------------------------------
app.get('/api/roles', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM demo_first.roles ORDER BY id')
    res.json(result.rows)
  } catch (e) {
    console.error('❌ Erreur SQL :', e)
    res.status(500).json({ error: 'Erreur serveur' })
  }
})

app.post('/api/roles', async (req, res) => {
  try {
    const { code, label } = req.body
    if (!code || !label) return res.status(400).json({ error: 'code et label requis' })

    const { rows } = await pool.query(
      `INSERT INTO demo_first.roles (code, label) VALUES ($1, $2) RETURNING *`,
      [code, label]
    )
    res.status(201).json(rows[0])
  } catch (e) {
    console.error('❌ Erreur SQL :', e)
    res.status(500).json({ error: 'Erreur serveur' })
  }
})

app.put('/api/roles/:id', async (req, res) => {
  try {
    const { id } = req.params
    const { code, label } = req.body
    if (!code || !label) return res.status(400).json({ error: 'code et label requis' })

    const { rows } = await pool.query(
      `UPDATE demo_first.roles SET code=$1, label=$2, updated_at=NOW() WHERE id=$3 RETURNING *`,
      [code, label, id]
    )

    if (rows.length === 0) return res.status(404).json({ error: 'Rôle introuvable' })
    res.json(rows[0])
  } catch (e) {
    console.error('❌ Erreur SQL :', e)
    res.status(500).json({ error: 'Erreur serveur' })
  }
})

app.delete('/api/roles/:id', async (req, res) => {
  try {
    const { id } = req.params
    const { rowCount } = await pool.query('DELETE FROM demo_first.roles WHERE id=$1', [id])
    if (rowCount === 0) return res.status(404).json({ error: 'Rôle introuvable' })
    res.status(204).send()
  } catch (e) {
    console.error('❌ Erreur SQL :', e)
    res.status(500).json({ error: 'Erreur serveur' })
  }
})

// ----------------------------------------------------
// ---------------------- USER_ROLES -----------------
// ----------------------------------------------------
app.get('/api/users/:id/roles', async (req, res) => {
  try {
    const { id } = req.params
    const result = await pool.query(
      `SELECT r.* 
       FROM demo_first.user_roles ur
       JOIN demo_first.roles r ON ur.role_id = r.id
       WHERE ur.user_id = $1`,
      [id]
    )
    res.json(result.rows)
  } catch (e) {
    console.error('❌ Erreur SQL :', e)
    res.status(500).json({ error: 'Erreur serveur' })
  }
})

app.post('/api/users/:id/roles', async (req, res) => {
  try {
    const { id } = req.params
    const { role_id } = req.body
    if (!role_id) return res.status(400).json({ error: 'role_id requis' })

    await pool.query(
      `INSERT INTO demo_first.user_roles (user_id, role_id) VALUES ($1, $2)
       ON CONFLICT DO NOTHING`,
      [id, role_id]
    )
    res.status(201).json({ success: true })
  } catch (e) {
    console.error('❌ Erreur SQL :', e)
    res.status(500).json({ error: 'Erreur serveur' })
  }
})

app.delete('/api/users/:id/roles/:role_id', async (req, res) => {
  try {
    const { id, role_id } = req.params
    const { rowCount } = await pool.query(
      'DELETE FROM demo_first.user_roles WHERE user_id=$1 AND role_id=$2',
      [id, role_id]
    )
    if (rowCount === 0) return res.status(404).json({ error: 'Lien non trouvé' })
    res.status(204).send()
  } catch (e) {
    console.error('❌ Erreur SQL :', e)
    res.status(500).json({ error: 'Erreur serveur' })
  }
})

// ----------------------------------------------------
// --------------------- DOCUMENTS -------------------
// ----------------------------------------------------
app.post('/api/documents', async (req, res) => {
  try {
    const { owner_user_id, name } = req.body
    const { rows } = await pool.query(
      `INSERT INTO demo_first.documents (owner_user_id, name) VALUES ($1, $2) RETURNING *`,
      [owner_user_id, name]
    )
    res.status(201).json(rows[0])
  } catch (e) {
    console.error(e)
    res.status(500).json({ error: 'Erreur création document' })
  }
})

app.post('/api/documents/:id/upload', upload.single('file'), async (req, res) => {
  try {
    const { id } = req.params
    const version = await pool.query(
      `SELECT COALESCE(MAX(version_no),0)+1 AS next FROM demo_first.document_versions WHERE document_id=$1`,
      [id]
    )
    const version_no = version.rows[0].next

    const { filename, mimetype, size } = req.file

    await pool.query(
      `UPDATE demo_first.documents 
       SET extension=$1, size_bytes=$2, mime_type=$3, updated_at=NOW()
       WHERE id=$4`,
      [path.extname(filename), size, mimetype, id]
    )

    const { rows } = await pool.query(
      `INSERT INTO demo_first.document_versions (document_id, version_no, storage_uri, checksum_sha256, created_at)
       VALUES ($1,$2,$3,$4,NOW()) RETURNING *`,
      [id, version_no, filename, null]
    )

    res.status(201).json(rows[0])
  } catch (e) {
    console.error(e)
    res.status(500).json({ error: 'Erreur upload version' })
  }
})

app.get('/api/documents', async (req, res) => {
  const { rows } = await pool.query('SELECT * FROM demo_first.documents ORDER BY id DESC')
  res.json(rows)
})

app.get('/api/documents/:id', async (req, res) => {
  const { id } = req.params
  const doc = await pool.query('SELECT * FROM demo_first.documents WHERE id=$1', [id])
  const versions = await pool.query('SELECT * FROM demo_first.document_versions WHERE document_id=$1 ORDER BY version_no DESC', [id])
  res.json({ document: doc.rows[0], versions: versions.rows })
})

app.delete('/api/documents/:id', async (req, res) => {
  const client = await pool.connect()
  try {
    const { id } = req.params
    await client.query('BEGIN')

    const versions = await client.query(
      'SELECT storage_uri FROM demo_first.document_versions WHERE document_id=$1',
      [id]
    )

    versions.rows.forEach(v => {
      const filePath = path.join(__dirname, 'uploads', v.storage_uri)
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath)
    })

    await client.query('DELETE FROM demo_first.document_versions WHERE document_id=$1', [id])
    const { rowCount } = await client.query('DELETE FROM demo_first.documents WHERE id=$1', [id])

    await client.query('COMMIT')
    if (rowCount === 0) return res.status(404).json({ error: 'Document introuvable' })
    res.status(204).send()
  } catch (e) {
    await client.query('ROLLBACK')
    console.error('❌ Erreur delete doc:', e)
    res.status(500).json({ error: 'Erreur suppression document' })
  } finally {
    client.release()
  }
})

// PUT : mettre à jour un document
app.put('/api/documents/:id', async (req, res) => {
  try {
    const { id } = req.params
    const { name, owner_user_id, status } = req.body

    const { rows } = await pool.query(
      `UPDATE demo_first.documents 
       SET name=$1, owner_user_id=$2, status=$3, updated_at=NOW()
       WHERE id=$4 RETURNING *`,
      [name, owner_user_id, status, id]
    )

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Document introuvable' })
    }

    res.json(rows[0])
  } catch (e) {
    console.error('❌ Erreur SQL (update document):', e)
    res.status(500).json({ error: 'Erreur serveur' })
  }
})


// ----------------------------------------------------
// ---------------------- SERVER ---------------------
// ----------------------------------------------------
app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ API démarrée sur http://localhost:${PORT}`)
})


