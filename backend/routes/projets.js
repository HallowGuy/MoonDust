// backend/routes/projets.js
import express from "express";
import pool, { DB_SCHEMA } from "../db.js";
const router = express.Router();

router.get("/", async (_, res) => {
  try {
    const result = await pool.query(`SELECT * FROM ${DB_SCHEMA}.projets ORDER BY created_at DESC`);
    res.json(result.rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get("/:id", async (req, res) => {
  try {
    const result = await pool.query(`SELECT * FROM ${DB_SCHEMA}.projets WHERE id=$1`, [req.params.id]);
    if (!result.rows.length) return res.status(404).json({ error: "Projet non trouvé" });
    res.json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post("/", async (req, res) => {
  try {
    const { entreprise_id, nom, description, statut } = req.body;
    const result = await pool.query(
      `INSERT INTO ${DB_SCHEMA}.projets (entreprise_id, nom, description, statut)
       VALUES ($1,$2,$3,$4) RETURNING *`,
      [entreprise_id, nom, description, statut]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.put("/:id", async (req, res) => {
  try {
    const { nom, description, statut } = req.body;
    const result = await pool.query(
      `UPDATE ${DB_SCHEMA}.projets SET nom=$1, description=$2, statut=$3
       WHERE id=$4 RETURNING *`,
      [nom, description, statut, req.params.id]
    );
    if (!result.rows.length) return res.status(404).json({ error: "Projet non trouvé" });
    res.json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.delete("/:id", async (req, res) => {
  try {
    const result = await pool.query(`DELETE FROM ${DB_SCHEMA}.projets WHERE id=$1 RETURNING *`, [req.params.id]);
    if (!result.rows.length) return res.status(404).json({ error: "Projet non trouvé" });
    res.json({ message: "Projet supprimé" });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

export default router;
