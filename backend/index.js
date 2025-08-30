const express = require('express')
const cors = require('cors')
const pool = require('./db')
const fs = require('fs')
const path = require('path')
const mime = require('mime-types')
require('dotenv').config()
const nodemailer = require('nodemailer')
const multer = require('multer')
const { logAction } = require('./utils/logger')

const app = express()
const PORT = process.env.PORT || 5001

// ---------- MIDDLEWARES ----------
app.use(cors({
  origin: [
    'http://localhost:3000',  // CRA
    'http://localhost:5173',  // Vite par défaut
    'http://localhost:3002'   // ✅ ton nouveau port frontend
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type']
}))
app.use(express.json())

// Healthcheck
app.get('/health', (_req, res) => {
  res.status(200).json({ status: 'ok' })
})

// 👉 servir les fichiers uploadés
app.get('/uploads/:file', (req, res) => {
  const filePath = path.join(__dirname, 'uploads', req.params.file)

  if (!fs.existsSync(filePath)) {
    return res.status(404).send('Fichier introuvable')
  }

  const type = mime.lookup(filePath) || 'application/octet-stream'
  res.setHeader('Content-Type', type)
  res.setHeader('Content-Disposition', `inline; filename="${req.params.file}"`)

  fs.createReadStream(filePath).pipe(res)
})

// ---------- EMAIL (Nodemailer) ----------
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT || 587),
  secure: process.env.SMTP_SECURE === 'true',   // true pour 465
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
})

transporter.verify()
  .catch(err => console.error('⚠️ SMTP non dispo :', err.message))

// ---------- MULTER CONFIG ----------
const storageLogo = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join(__dirname, 'uploads/logo')),
  filename: (req, file, cb) => cb(null, 'theme-logo.svg'), // ✅ écrase toujours
})
const uploadLogo = multer({ storage: storageLogo })

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join(__dirname, 'uploads')),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname)
    cb(null, Date.now() + ext)
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

// Compter les utilisateurs actifs du mois courant
app.get('/api/users/active', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT COUNT(*) 
      FROM demo_first.users 
      WHERE is_active = true
    `)
    res.json({ userActive: Number(result.rows[0].count) })
  } catch (err) {
    console.error('❌ Erreur SQL (active users month):', err)
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
    const newUser = rows[0]

    await logAction(
  newUser.id,               // l’utilisateur qui agit (ici c’est le nouvel utilisateur lui-même, mais tu peux mettre l’admin connecté si tu as un système d’auth)
  'user',                   // type d’entité
  newUser.id,               // ID de l’entité concernée
  'create',                 // action
  { username: newUser.username, email: newUser.email } // meta JSON
)


    try {
      await transporter.sendMail({
  from: process.env.MAIL_FROM || process.env.SMTP_USER,
  to: newUser.email,
  subject: `Bienvenue ${newUser.username} !`,
  text: `Bonjour ${newUser.display_name || newUser.username},

Votre compte a bien été créé 🚀
Cliquez sur le lien ci-dessous pour vous connecter :
${process.env.APP_URL || 'http://localhost:5173'}/login
  `,
  html: `
    <p>Bonjour <b>${newUser.display_name || newUser.username}</b>,</p>
    <p>Votre compte a bien été créé 🚀</p>
    <p>
      <a href="${process.env.APP_URL || 'http://localhost:5173'}/login"
         style="display:inline-block;
                padding:10px 20px;
                background-color:#4f46e5;
                color:#fff;
                border-radius:6px;
                text-decoration:none;
                font-weight:bold;">
        Se connecter
      </a>
    </p>
  `
})

      console.log(`📧 Mail envoyé à ${newUser.email}`)
    } catch (mailErr) {
      console.error('⚠️ Erreur envoi mail:', mailErr)
    }

    res.status(201).json(newUser)
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

    const updatedUser = rows[0]

    // 📝 Audit log
    await logAction(
      id,                     // acteur → si tu as un admin connecté remplace par son ID
      'user',                 // type d’entité
      updatedUser.id,         // ID du user modifié
      'update',               // action
      {                       // meta JSON
        username: updatedUser.username,
        email: updatedUser.email,
        display_name: updatedUser.display_name,
        is_active: updatedUser.is_active
      }
    )

    res.json(updatedUser)
  } catch (e) {
    console.error('❌ Erreur SQL :', e)
    res.status(500).json({ error: 'Erreur serveur' })
  }
})


app.delete('/api/users/:id', async (req, res) => {
  const client = await pool.connect()
  try {
    await client.query('BEGIN')

    const { id } = req.params

    // 1. supprimer les rôles liés
    await client.query('DELETE FROM demo_first.user_roles WHERE user_id = $1', [id])

    // 2. supprimer l’utilisateur
    const { rowCount } = await client.query('DELETE FROM demo_first.users WHERE id=$1', [id])
    if (rowCount === 0) {
      await client.query('ROLLBACK')
      return res.status(404).json({ error: 'User introuvable' })
    }

    // 3. audit log
    await logAction(null, 'user', id, 'delete', { message: `Suppression de l’utilisateur #${id}` })

    await client.query('COMMIT')
    res.status(204).send()
  } catch (e) {
    await client.query('ROLLBACK')
    console.error('❌ Erreur delete user:', e)
    res.status(500).json({ error: 'Erreur serveur' })
  } finally {
    client.release()
  }
})




// ----------------------------------------------------
// ---------------------- AUDIT -----------------------
// ----------------------------------------------------
app.get('/api/audit', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT a.id, a.actor_user_id, a.entity_type, a.entity_id, a.action, a.meta, a.occurred_at,
             u.username AS actor_username
      FROM demo_first.audit_log a
      LEFT JOIN demo_first.users u ON a.actor_user_id = u.id
      ORDER BY a.occurred_at DESC
      LIMIT 100
    `)
    res.json(result.rows)
  } catch (err) {
    console.error('❌ Erreur SQL audit:', err)
    res.status(500).json({ error: 'Erreur serveur audit' })
  }
})



// ----------------------------------------------------
// ------------------------- ROLES --------------------
// ----------------------------------------------------

// 📌 Lister tous les rôles
app.get('/api/roles', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM demo_first.roles ORDER BY id')
    res.json(result.rows)
  } catch (e) {
    console.error('❌ Erreur SQL get roles:', e)
    res.status(500).json({ error: 'Erreur serveur' })
  }
})

// 📌 Créer un rôle
app.post('/api/roles', async (req, res) => {
  try {
    const { code, label } = req.body
    if (!code || !label) {
      return res.status(400).json({ error: 'code et label requis' })
    }

    const { rows } = await pool.query(
      `INSERT INTO demo_first.roles (code, label) VALUES ($1, $2) RETURNING *`,
      [code, label]
    )
    const newRole = rows[0]

    // 🔍 Audit log
    await logAction(
      null,          // pas d’acteur identifié (à remplacer par l’ID admin si tu ajoutes l’auth)
      'role',        // type d’entité
      newRole.id,    // ID du rôle créé
      'create',      // action
      { code, label } // meta JSON
    )

    res.status(201).json(newRole)
  } catch (e) {
    console.error('❌ Erreur SQL insert role:', e)
    res.status(500).json({ error: 'Erreur serveur' })
  }
})

// 📌 Modifier un rôle
app.put('/api/roles/:id', async (req, res) => {
  try {
    const { id } = req.params
    const { code, label } = req.body
    if (!code || !label) {
      return res.status(400).json({ error: 'code et label requis' })
    }

    const { rows } = await pool.query(
      `UPDATE demo_first.roles 
       SET code=$1, label=$2 
       WHERE id=$3 RETURNING *`,
      [code, label, id]
    )

    if (rows.length === 0) return res.status(404).json({ error: 'Rôle introuvable' })

    const updatedRole = rows[0]

    // 🔍 Audit log
    await logAction(
      null,
      'role',
      updatedRole.id,
      'update',
      { code: updatedRole.code, label: updatedRole.label }
    )

    res.json(updatedRole)
  } catch (e) {
    console.error('❌ Erreur SQL update role:', e)
    res.status(500).json({ error: 'Erreur serveur' })
  }
})

// 📌 Supprimer un rôle
app.delete('/api/roles/:id', async (req, res) => {
  try {
    const { id } = req.params

    const { rowCount } = await pool.query('DELETE FROM demo_first.roles WHERE id=$1', [id])
    if (rowCount === 0) return res.status(404).json({ error: 'Rôle introuvable' })

    // 🔍 Audit log
    await logAction(
      null,
      'role',
      id,
      'delete',
      { message: `Suppression du rôle #${id}` }
    )

    res.status(204).send()
  } catch (e) {
    console.error('❌ Erreur SQL delete role:', e)
    res.status(500).json({ error: 'Erreur serveur' })
  }
})

// ----------------------------------------------------
// ---------- Association USER ↔ ROLES ----------------
// ----------------------------------------------------

// 📌 Récupérer les rôles d’un utilisateur
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
    console.error('❌ Erreur SQL get user roles:', e)
    res.status(500).json({ error: 'Erreur serveur' })
  }
})

// 📌 Associer des rôles à un utilisateur (remplace l’existant)
app.post('/api/users/:id/roles', async (req, res) => {
  try {
    const { id } = req.params
    const { roles } = req.body

    if (!roles || !Array.isArray(roles)) {
      return res.status(400).json({ error: 'roles (array) requis' })
    }

    // 🗑️ Supprimer les anciens rôles
    await pool.query('DELETE FROM demo_first.user_roles WHERE user_id = $1', [id])

    // ➕ Ajouter les nouveaux
    for (const role_id of roles) {
      await pool.query(
        `INSERT INTO demo_first.user_roles (user_id, role_id) VALUES ($1, $2)`,
        [id, role_id]
      )
    }

    // 🔍 Audit log
    await logAction(
      id,
      'user_roles',
      id,
      'update',
      { roles }
    )

    res.status(201).json({ success: true })
  } catch (e) {
    console.error('❌ Erreur SQL assoc user roles:', e)
    res.status(500).json({ error: 'Erreur lors de l’association des rôles' })
  }
})

// 📌 Supprimer un rôle spécifique d’un utilisateur
app.delete('/api/users/:id/roles/:role_id', async (req, res) => {
  try {
    const { id, role_id } = req.params
    const { rowCount } = await pool.query(
      'DELETE FROM demo_first.user_roles WHERE user_id=$1 AND role_id=$2',
      [id, role_id]
    )
    if (rowCount === 0) return res.status(404).json({ error: 'Lien non trouvé' })

    // 🔍 Audit log
    await logAction(
      id,
      'user_roles',
      id,
      'delete',
      { role_id }
    )

    res.status(204).send()
  } catch (e) {
    console.error('❌ Erreur suppression rôle utilisateur:', e)
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
// ---------------------- THEME ----------------------
// ----------------------------------------------------
const themesPath = path.join(__dirname, 'themes.json')
let themes = JSON.parse(fs.readFileSync(themesPath, 'utf8'))
let currentTheme = 'default'

// ---------- LOGO THEME (⚠️ avant /api/theme/:name) ----------
app.get('/api/theme/logo', (req, res) => {
  const logoPath = path.join(__dirname, 'uploads/logo/theme-logo.svg')
  if (!fs.existsSync(logoPath)) {
    return res.status(404).json({ error: 'Aucun logo défini' })
  }
  res.sendFile(logoPath)
})

app.post('/api/theme/logo', uploadLogo.single('file'), (req, res) => {
  try {
    res.json({ ok: true, message: 'Logo mis à jour' })
  } catch (err) {
    console.error('❌ Erreur upload logo:', err)
    res.status(500).json({ error: 'Échec upload logo' })
  }
})


// ----------------------------------------------------
// ---------------------- CONGES ----------------------
// ----------------------------------------------------
console.log("➡️ Route /api/conges enregistrée")

app.get('/api/conges', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM demo_first.leave_requests ORDER BY created_at DESC;'
    )
    res.json(result.rows)
  } catch (e) {
    console.error('❌ Erreur SQL leave_requests:', e)
    res.status(500).json({ error: 'Erreur serveur' })
  }
})

app.post('/api/conges', async (req, res) => {
  try {
    const { name, email, start_date, end_date, reason } = req.body

    // 👉 1. Insertion DB
    const { rows } = await pool.query(
      `INSERT INTO demo_first.leave_requests 
       (name, email, start_date, end_date, reason, status, created_at, updated_at) 
       VALUES ($1, $2, $3, $4, $5, 'EN ATTENTE', NOW(), NOW()) RETURNING *`,
      [name, email, start_date, end_date, reason]
    )
    const demande = rows[0]

    // 👉 2. Déclenchement workflow Activepieces
    try {
      await fetch('http://activepieces/api/v1/webhooks/gNnUPovuxR1ichOa9zdHQ', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: demande.id,          // utile pour suivi
          name: demande.name,
          email: demande.email,
          start_date: demande.start_date,
          end_date: demande.end_date,
          reason: demande.reason,
        }),
      })
      console.log("✅ Workflow Activepieces déclenché")
    } catch (err) {
      console.error("⚠️ Erreur déclenchement workflow:", err.message)
    }

    // 👉 3. Retour au frontend
    res.status(201).json(demande)
  } catch (e) {
    console.error('❌ Erreur SQL leave_requests insert:', e)
    res.status(500).json({ error: 'Erreur serveur' })
  }
})



// --- PUT pour mettre à jour le statut (approuver/refuser)
// ✅ Mettre à jour le statut d'une demande
app.put('/api/conges/:id/status', async (req, res) => {
  try {
    const { id } = req.params
    const { status } = req.body // "APPROUVÉ" ou "REJETÉ"

    const { rows } = await pool.query(
      `UPDATE demo_first.leave_requests
       SET status = $1, updated_at = NOW()
       WHERE id = $2
       RETURNING *`,
      [status, id]
    )

    if (rows.length === 0) return res.status(404).json({ error: 'Demande non trouvée' })

    res.json(rows[0])
  } catch (e) {
    console.error('❌ Erreur maj statut:', e)
    res.status(500).json({ error: 'Erreur serveur' })
  }
})


app.get('/api/conges/:id', async (req, res) => {
  try {
    const { id } = req.params
    const { rows } = await pool.query(
      'SELECT * FROM demo_first.leave_requests WHERE id = $1',
      [id]
    )
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Demande introuvable' })
    }
    res.json(rows[0])
  } catch (e) {
    console.error('❌ Erreur SQL leave_requests get by id:', e)
    res.status(500).json({ error: 'Erreur serveur' })
  }
})



// ---------- THEMES ----------
app.get('/api/theme/list', (req, res) => {
  res.json(Object.keys(themes))
})

app.get('/api/theme/current', (req, res) => {
  res.json({
    name: currentTheme,
    colors: themes[currentTheme]
  })
})


app.put('/api/theme/current', (req, res) => {
  const { name } = req.body
  if (!themes[name]) {
    return res.status(400).json({ error: 'Thème inconnu' })
  }
  currentTheme = name
  res.json({ ok: true, theme: themes[currentTheme] })
})

app.get('/api/theme/:name', (req, res) => {
  const { name } = req.params
  if (!themes[name]) {
    return res.status(404).json({ error: 'Thème non trouvé' })
  }
  res.json(themes[name])
})

app.put('/api/theme/colors', (req, res) => {
  const newColors = req.body
  themes[currentTheme] = newColors
  fs.writeFileSync(themesPath, JSON.stringify(themes, null, 2), 'utf8')
  res.json({ ok: true, theme: newColors })
})

app.get('/api/theme/colors', (req, res) => {
  res.json(themes[currentTheme])
})


// ----------------------------------------------------
// ---------------------- SERVER ---------------------
// ----------------------------------------------------
app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ API démarrée sur http://localhost:${PORT}`)
})
