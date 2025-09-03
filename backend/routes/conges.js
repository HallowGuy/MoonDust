import express from "express"
import pool from "../db.js"
import fetch from "node-fetch"

const router = express.Router()

// ----------------------------------------------------
// ---------------------- CONGES ----------------------
// ----------------------------------------------------
router.get("/", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM demo_first.leave_requests ORDER BY created_at DESC;"
    )
    res.json(result.rows)
  } catch (e) {
    console.error("❌ Erreur SQL leave_requests:", e)
    res.status(500).json({ error: "Erreur serveur" })
  }
})

router.post("/", async (req, res) => {
  try {
    const { name, email, start_date, end_date, reason } = req.body

    const { rows } = await pool.query(
      `INSERT INTO demo_first.leave_requests 
       (name, email, start_date, end_date, reason, status, created_at, updated_at) 
       VALUES ($1, $2, $3, $4, $5, 'EN ATTENTE', NOW(), NOW()) RETURNING *`,
      [name, email, start_date, end_date, reason]
    )
    const demande = rows[0]

    try {
      await fetch("http://activepieces/api/v1/webhooks/gNnUPovuxR1ichOa9zdHQ", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: demande.id,
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

    res.status(201).json(demande)
  } catch (e) {
    console.error("❌ Erreur SQL leave_requests insert:", e)
    res.status(500).json({ error: "Erreur serveur" })
  }
})

router.put("/:id/status", async (req, res) => {
  try {
    const { id } = req.params
    const { status } = req.body

    const { rows } = await pool.query(
      `UPDATE demo_first.leave_requests
       SET status = $1, updated_at = NOW()
       WHERE id = $2
       RETURNING *`,
      [status, id]
    )

    if (rows.length === 0) return res.status(404).json({ error: "Demande non trouvée" })

    res.json(rows[0])
  } catch (e) {
    console.error("❌ Erreur maj statut:", e)
    res.status(500).json({ error: "Erreur serveur" })
  }
})

router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params
    const { rows } = await pool.query("SELECT * FROM demo_first.leave_requests WHERE id = $1", [
      id,
    ])
    if (rows.length === 0) {
      return res.status(404).json({ error: "Demande introuvable" })
    }
    res.json(rows[0])
  } catch (e) {
    console.error("❌ Erreur SQL leave_requests get by id:", e)
    res.status(500).json({ error: "Erreur serveur" })
  }
})

export default router
