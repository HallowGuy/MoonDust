// backend/routes/keycloakUsers.js
import express from "express"
import fetch from "node-fetch"
import pool from "../db.js"
import { getAdminToken } from "../utils/keycloak.js"
import { authenticate } from "../middleware/authenticate.js";

const router = express.Router()

// Synchroniser les utilisateurs Keycloak -> DB
router.post("/sync", async (_req, res) => {
  try {
    const token = await getAdminToken()
    const kcRes = await fetch(
      `${process.env.KEYCLOAK_URL}/admin/realms/${process.env.REALM}/users`,
      { headers: { Authorization: `Bearer ${token}` } }
    )
    const users = await kcRes.json()

    for (const u of users) {
      await pool.query(
        `INSERT INTO demo_first.keycloak_users (id, username, email)
         VALUES ($1, $2, $3)
         ON CONFLICT (id) DO UPDATE
         SET username = EXCLUDED.username,
             email = EXCLUDED.email`,
        [u.id, u.username, u.email]
      )
    }

    res.json({ success: true, count: users.length })
  } catch (err) {
    console.error("❌ Erreur sync users:", err)
    res.status(500).json({ error: "Erreur lors de la synchro Keycloak" })
  }
})

// Lister les utilisateurs (côté DB)
router.get("/", async (_req, res) => {
  try {
    const result = await pool.query(`SELECT * FROM demo_first.keycloak_users ORDER BY username ASC`)
    res.json(result.rows)
  } catch (err) {
    console.error("❌ Erreur list users:", err)
    res.status(500).json({ error: "Erreur lors de la lecture des utilisateurs" })
  }
})

// recherche utilisateurs par username ou email
router.get("/search", authenticate, async (req, res) => {
  const { q } = req.query;
  try {
    const result = await pool.query(
      `SELECT id, username, email
       FROM demo_first.keycloak_users
       WHERE username ILIKE $1 OR email ILIKE $1
       LIMIT 10`,
      [`%${q}%`]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router
