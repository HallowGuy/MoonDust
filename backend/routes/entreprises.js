// backend/routes/entreprises.js
import express from "express";
import pool from "../db.js";

const router = express.Router();

// --- GET all ---
router.get("/", async (_, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM demo_first.entreprises ORDER BY created_at DESC"
    );
    res.json(result.rows);
  } catch (err) {
    console.error("Erreur SQL GET all:", err);
    res.status(500).json({ error: err.message });
  }
});

// --- GET by ID ---
router.get("/:id", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM demo_first.entreprises WHERE id=$1",
      [req.params.id]
    );
    if (!result.rows.length)
      return res.status(404).json({ error: "Entreprise non trouvée" });
    res.json(result.rows[0]);
  } catch (err) {
    console.error("Erreur SQL GET by ID:", err);
    res.status(500).json({ error: err.message });
  }
});

// --- CREATE ---
router.post("/", async (req, res) => {
  try {
    const { nom, secteur, adresse, telephone, email, site_web } = req.body;
    const result = await pool.query(
      `INSERT INTO demo_first.entreprises (nom, secteur, adresse, telephone, email, site_web)
       VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`,
      [nom, secteur, adresse, telephone, email, site_web]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("Erreur SQL CREATE:", err);
    res.status(500).json({ error: err.message });
  }
});

// --- UPDATE ---
router.put("/:id", async (req, res) => {
  try {
    const { nom, secteur, adresse, telephone, email, site_web } = req.body;
    const result = await pool.query(
      `UPDATE demo_first.entreprises
       SET nom=$1, secteur=$2, adresse=$3, telephone=$4, email=$5, site_web=$6
       WHERE id=$7 RETURNING *`,
      [nom, secteur, adresse, telephone, email, site_web, req.params.id]
    );
    if (!result.rows.length)
      return res.status(404).json({ error: "Entreprise non trouvée" });
    res.json(result.rows[0]);
  } catch (err) {
    console.error("Erreur SQL UPDATE:", err);
    res.status(500).json({ error: err.message });
  }
});

// --- DELETE ---
router.delete("/:id", async (req, res) => {
  try {
    const result = await pool.query(
      "DELETE FROM demo_first.entreprises WHERE id=$1 RETURNING *",
      [req.params.id]
    );
    if (!result.rows.length)
      return res.status(404).json({ error: "Entreprise non trouvée" });
    res.json({ message: "Entreprise supprimée" });
  } catch (err) {
    console.error("Erreur SQL DELETE:", err);
    res.status(500).json({ error: err.message });
  }
});

export default router;
