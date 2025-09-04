// backend/routes/conges.js
import express from "express";
import fetch from "node-fetch";
import pool from "../db.js";

const router = express.Router();

// GET /api/conges
router.get("/", async (_req, res) => {
  try {
    const result = await pool.query(
      `SELECT * FROM demo_first.leave_requests ORDER BY created_at DESC`
    );
    res.json(result.rows);
  } catch (e) { res.status(500).json({ error: "Erreur serveur" }); }
});

// POST /api/conges
router.post("/", async (req, res) => {
  try {
    const { name, email, start_date, end_date, reason } = req.body;
    const { rows } = await pool.query(
      `INSERT INTO demo_first.leave_requests
       (name, email, start_date, end_date, reason, status, created_at, updated_at)
       VALUES ($1,$2,$3,$4,$5,'EN ATTENTE', NOW(), NOW())
       RETURNING *`,
      [name, email, start_date, end_date, reason]
    );
    const demande = rows[0];

    // webhook Activepieces (fire & forget)
    try {
      await fetch("http://activepieces/api/v1/webhooks/gNnUPovuxR1ichOa9zdHQ", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: demande.id, name, email, start_date, end_date, reason,
        }),
      });
    } catch (err) {
      console.warn("⚠️ Activepieces non joignable:", err.message);
    }
    res.status(201).json(demande);
  } catch (e) { res.status(500).json({ error: "Erreur serveur" }); }
});

// PUT /api/conges/:id/status   { status: "APPROUVÉ"|"REJETÉ"|"EN ATTENTE" }
router.put("/:id/status", async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const { rows } = await pool.query(
      `UPDATE demo_first.leave_requests
       SET status=$1, updated_at=NOW()
       WHERE id=$2 RETURNING *`,
      [status, id]
    );
    if (!rows.length) return res.status(404).json({ error: "Demande introuvable" });
    res.json(rows[0]);
  } catch (e) { res.status(500).json({ error: "Erreur serveur" }); }
});

// GET /api/conges/:id
router.get("/:id", async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT * FROM demo_first.leave_requests WHERE id=$1`,
      [req.params.id]
    );
    if (!rows.length) return res.status(404).json({ error: "Demande introuvable" });
    res.json(rows[0]);
  } catch (e) { res.status(500).json({ error: "Erreur serveur" }); }
});

export default router;
