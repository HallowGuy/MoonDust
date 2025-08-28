const pool = require('../db')

async function logAction(actor_user_id, entity_type, entity_id, action, meta = {}) {
  try {
    await pool.query(
      `INSERT INTO demo_first.audit_log 
       (actor_user_id, entity_type, entity_id, action, meta) 
       VALUES ($1, $2, $3, $4, $5)`,
      [actor_user_id, entity_type, entity_id, action, meta]
    )
  } catch (err) {
    console.error('❌ Erreur enregistrement audit_log:', err)
  }
}

module.exports = { logAction }
