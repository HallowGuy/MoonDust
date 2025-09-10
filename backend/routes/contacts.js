import express from "express";
import pool from "../db.js";

const router = express.Router();

// ========================
// GET /contacts (liste)
// ========================
router.get("/", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        c.id,
        c.entreprise_id,
        c.created_at,
        c.last_interaction,
        c.form_data,
        c.form_data->>'prenom' AS prenom,
        c.form_data->>'nom' AS nom,
        c.form_data->>'email' AS email,
        c.form_data->>'telephone' AS telephone,
        c.form_data->>'poste' AS poste,
        e.nom AS entreprise_nom
      FROM demo_first.contacts c
      LEFT JOIN demo_first.entreprises e ON c.entreprise_id = e.id
      ORDER BY c.created_at DESC
    `);
    res.json(result.rows);
  } catch (err) {
    console.error("❌ Erreur SQL GET /contacts:", err);
    res.status(500).json({ error: err.message });
  }
});

// ========================
// GET /contacts/:id
// ========================
router.get("/:id", async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT 
         c.id,
         c.entreprise_id,
         c.created_at,
         c.last_interaction,
         c.form_data,
         c.form_data->>'prenom' AS prenom,
         c.form_data->>'nom' AS nom,
         c.form_data->>'email' AS email,
         c.form_data->>'telephone' AS telephone,
         c.form_data->>'poste' AS poste,
         e.nom AS entreprise_nom
       FROM demo_first.contacts c
       LEFT JOIN demo_first.entreprises e ON c.entreprise_id = e.id
       WHERE c.id = $1`,
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Contact non trouvé" });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error("❌ Erreur SQL GET /contacts/:id:", err);
    res.status(500).json({ error: err.message });
  }
});

// ========================
// POST /contacts (création)
// ========================
router.post("/", async (req, res) => {
  try {
    const { entreprise_id, last_interaction, form_data } = req.body;

    // ⚡ Nettoyage du JSON (on vire submit si présent)
    let cleanFormData = { ...form_data };
    delete cleanFormData.submit;

    const result = await pool.query(
      `INSERT INTO demo_first.contacts 
        (entreprise_id, last_interaction, form_data)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [
        entreprise_id || null,
        last_interaction || null,
        JSON.stringify(cleanFormData || {}),
      ]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("❌ Erreur SQL POST /contacts:", err);
    res.status(500).json({ error: err.message });
  }
});

// ========================
// PUT /contacts/:id (modif)
// ========================
router.put("/:id", async (req, res) => {
  try {
    const { entreprise_id, last_interaction, form_data } = req.body;

    let cleanFormData = { ...form_data };
    delete cleanFormData.submit;

    const result = await pool.query(
      `UPDATE demo_first.contacts
       SET entreprise_id=$1,
           last_interaction=$2,
           form_data=$3
       WHERE id=$4
       RETURNING *`,
      [
        entreprise_id || null,
        last_interaction || null,
        JSON.stringify(cleanFormData || {}),
        req.params.id,
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Contact non trouvé" });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error("❌ Erreur SQL PUT /contacts/:id:", err);
    res.status(500).json({ error: err.message });
  }
});

// ========================
// DELETE /contacts/:id
// ========================
router.delete("/:id", async (req, res) => {
  try {
    const result = await pool.query(
      "DELETE FROM demo_first.contacts WHERE id=$1 RETURNING *",
      [req.params.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Contact non trouvé" });
    }
    res.json({ message: "Contact supprimé" });
  } catch (err) {
    console.error("❌ Erreur SQL DELETE /contacts/:id:", err);
    res.status(500).json({ error: err.message });
  }
});

export default router;
