// backend/routes/me.js
import express from 'express'

// ⚠️ si tu utilises réellement jwt/node-fetch, garde-les, sinon tu peux les retirer
// import jwt from 'jsonwebtoken'
// import fetch from 'node-fetch'

const router = express.Router()

// --- Middleware: parse le JWT et peuple req.user ---
router.use((req, _res, next) => {
  try {
    const auth = req.headers.authorization || ''
    const token = auth.startsWith('Bearer ') ? auth.slice(7) : null
    if (token) {
      const payloadB64 = token.split('.')[1]
      const payload = JSON.parse(Buffer.from(payloadB64, 'base64').toString('utf8'))
      // adapte si ton identifiant est ailleurs (ex: payload.preferred_username)
      req.user = { id: payload?.sub, raw: payload }
    }
  } catch (_) {
    // on ignore et on laisse req.user indéfini
  }
  next()
})

// --- GET /api/me/roles (inchangé, mais robuste) ---
router.get('/roles', (req, res) => {
  try {
    const payload = req.user?.raw
    if (!payload) return res.json({ roles: [] })

    const clientId = process.env.FRONT_CLIENT_ID || 'react-app'
    const realm = Array.isArray(payload?.realm_access?.roles) ? payload.realm_access.roles : []
    const client = Array.isArray(payload?.resource_access?.[clientId]?.roles)
      ? payload.resource_access[clientId].roles
      : []
    const roles = Array.from(new Set([...realm, ...client]))
    return res.json({ roles })
  } catch {
    return res.json({ roles: [] })
  }
})

// --- Simule une "DB" en mémoire si db.userPrefs n'existe pas ---
const memStore = new Map()
// essaie de charger ta vraie db si dispo
let db
try {
  db = await import('../db.js').then(m => m.default || m).catch(() => null)
} catch (_) { db = null }
const hasDb = !!(db && db.userPrefs)

// --- Helpers DB (DB réelle OU mémoire) ---
const upsertPrefs = async (userId, valueObj) => {
  if (hasDb) {
    return db.userPrefs.upsert({ userId, key: 'dashboard', value: JSON.stringify(valueObj) })
  }
  memStore.set(userId, JSON.stringify(valueObj))
}
const findPrefs = async (userId) => {
  if (hasDb) {
    const row = await db.userPrefs.findOne({ where: { userId, key: 'dashboard' } })
    return row ? row.value : null
  }
  return memStore.get(userId) || null
}

// --- PUT /api/me/dashboard-prefs ---
router.put('/dashboard-prefs', express.json(), async (req, res) => {
  try {
    const userId = req.user?.id
    if (!userId) return res.status(401).json({ error: 'unauthorized' })

    const prefs = req.body || {}
    // validation simple: autoriser uniquement ces IDs
    const ALLOWED = new Set(['users', 'roles', 'groups', 'realm'])
    const cleanList = (arr) => Array.isArray(arr) ? [...new Set(arr)].filter(id => ALLOWED.has(id)) : []
    const visible = cleanList(prefs.visible)
    const order = cleanList(prefs.order)

    await upsertPrefs(userId, { visible, order })
    return res.sendStatus(204)
  } catch (e) {
    console.error('PUT /dashboard-prefs error:', e)
    return res.status(500).json({ error: 'server_error' })
  }
})

// --- GET /api/me/dashboard-prefs ---
router.get('/dashboard-prefs', async (req, res) => {
  try {
    const userId = req.user?.id
    if (!userId) return res.status(401).json({ error: 'unauthorized' })

    const value = await findPrefs(userId)
    if (!value) return res.status(204).end() // pas de prefs encore
    // value peut déjà être string JSON
    const json = typeof value === 'string' ? JSON.parse(value) : value
    return res.json(json)
  } catch (e) {
    console.error('GET /dashboard-prefs error:', e)
    return res.status(500).json({ error: 'server_error' })
  }
})

export default router
