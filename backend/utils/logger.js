// utils/logger.js
import pool, { DB_SCHEMA } from "../db.js"

export async function logAction(actor_user_id, entity_type, entity_id, action, meta = {}) {
  try {
    await pool.query(
      `INSERT INTO ${DB_SCHEMA}.audit_log 
       (actor_user_id, entity_type, entity_id, action, meta) 
       VALUES ($1, $2, $3, $4, $5)`,
      [actor_user_id, entity_type, entity_id, action, meta]
    )
  } catch (err) {
    console.error("❌ Erreur enregistrement audit_log:", err)
  }
}
