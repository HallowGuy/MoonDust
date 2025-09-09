import express from "express";
import pool from "../db.js";

const router = express.Router();

// Liste de tous les contacts (avec nom de l'entreprise)
router.get("/", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT c.*, e.nom AS entreprise_nom
      FROM demo_first.contacts c
      LEFT JOIN demo_first.entreprises e ON c.entreprise_id = e.id
      ORDER BY c.created_at DESC
    `);
    res.json(result.rows);
  } catch (err) {
    console.error("Erreur SQL GET /contacts:", err);
    res.status(500).json({ error: err.message });
  }
});

// Un seul contact
router.get("/:id", async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT c.*, e.nom AS entreprise_nom
       FROM demo_first.contacts c
       LEFT JOIN demo_first.entreprises e ON c.entreprise_id = e.id
       WHERE c.id = $1`,
      [req.params.id]
    );
    if (result.rows.length === 0)
      return res.status(404).json({ error: "Contact non trouvé" });
    res.json(result.rows[0]);
  } catch (err) {
    console.error("Erreur SQL GET /contacts/:id:", err);
    res.status(500).json({ error: err.message });
  }
});

// Création
router.post("/", async (req, res) => {
  try {
    const {
      entreprise_id, prenom, nom, email, telephone, poste,
      civilite, mobile, adresse, ville, pays,
      tags, source, statut, notes, last_interaction
    } = req.body;

    const result = await pool.query(
      `INSERT INTO demo_first.contacts 
        (entreprise_id, prenom, nom, email, telephone, poste,
         civilite, mobile, adresse, ville, pays,
         tags, source, statut, notes, last_interaction)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16)
       RETURNING *`,
      [
        entreprise_id, prenom, nom, email, telephone, poste,
        civilite, mobile, adresse, ville, pays,
        tags, source, statut, notes, last_interaction
      ]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("Erreur SQL POST /contacts:", err);
    res.status(500).json({ error: err.message });
  }
});

// Modification
router.put("/:id", async (req, res) => {
  try {
    const {
      entreprise_id, prenom, nom, email, telephone, poste,
      civilite, mobile, adresse, ville, pays,
      tags, source, statut, notes, last_interaction
    } = req.body;

    const result = await pool.query(
      `UPDATE demo_first.contacts
       SET entreprise_id=$1, prenom=$2, nom=$3, email=$4, telephone=$5, poste=$6,
           civilite=$7, mobile=$8, adresse=$9, ville=$10, pays=$11,
           tags=$12, source=$13, statut=$14, notes=$15, last_interaction=$16
       WHERE id=$17 RETURNING *`,
      [
        entreprise_id, prenom, nom, email, telephone, poste,
        civilite, mobile, adresse, ville, pays,
        tags, source, statut, notes, last_interaction,
        req.params.id
      ]
    );

    if (result.rows.length === 0)
      return res.status(404).json({ error: "Contact non trouvé" });

    res.json(result.rows[0]);
  } catch (err) {
    console.error("Erreur SQL PUT /contacts/:id:", err);
    res.status(500).json({ error: err.message });
  }
});

// Suppression
router.delete("/:id", async (req, res) => {
  try {
    const result = await pool.query(
      "DELETE FROM demo_first.contacts WHERE id=$1 RETURNING *",
      [req.params.id]
    );
    if (result.rows.length === 0)
      return res.status(404).json({ error: "Contact non trouvé" });
    res.json({ message: "Contact supprimé" });
  } catch (err) {
    console.error("Erreur SQL DELETE /contacts/:id:", err);
    res.status(500).json({ error: err.message });
  }
});

export default router;
