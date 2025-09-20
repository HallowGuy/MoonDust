// backend/routes/audit.js
import express from "express";
import pool, { DB_SCHEMA } from "../db.js";

const router = express.Router();

// GET /api/audit
router.get("/", async (_req, res) => {
  try {
    const result = await pool.query(`
      SELECT a.id, a.actor_user_id, a.entity_type, a.entity_id, a.action, a.meta, a.occurred_at,
             u.username AS actor_username
      FROM ${DB_SCHEMA}.audit_log a
      LEFT JOIN ${DB_SCHEMA}.users u ON a.actor_user_id = u.id
      ORDER BY a.occurred_at DESC
      LIMIT 100
    `);
    res.json(result.rows);
  } catch (e) { res.status(500).json({ error: "Erreur serveur" }); }
});

export default router;
