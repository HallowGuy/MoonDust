// backend/routes/tags.js
import express from "express";
import pool, { DB_SCHEMA } from "../db.js";
const router = express.Router();

router.get("/", async (_, res) => {
  try {
    const result = await pool.query(`SELECT * FROM ${DB_SCHEMA}.tags ORDER BY created_at DESC`);
    res.json(result.rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get("/:id", async (req, res) => {
  try {
    const result = await pool.query(`SELECT * FROM ${DB_SCHEMA}.tags WHERE id=$1`, [req.params.id]);
    if (!result.rows.length) return res.status(404).json({ error: "Tag non trouvé" });
    res.json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post("/", async (req, res) => {
  try {
    const { nom } = req.body;
    const result = await pool.query(
      `INSERT INTO ${DB_SCHEMA}.tags (nom) VALUES ($1) RETURNING *`,
      [nom]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.put("/:id", async (req, res) => {
  try {
    const { nom } = req.body;
    const result = await pool.query(
      `UPDATE ${DB_SCHEMA}.tags SET nom=$1 WHERE id=$2 RETURNING *`,
      [nom, req.params.id]
    );
    if (!result.rows.length) return res.status(404).json({ error: "Tag non trouvé" });
    res.json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.delete("/:id", async (req, res) => {
  try {
    const result = await pool.query(`DELETE FROM ${DB_SCHEMA}.tags WHERE id=$1 RETURNING *`, [req.params.id]);
    if (!result.rows.length) return res.status(404).json({ error: "Tag non trouvé" });
    res.json({ message: "Tag supprimé" });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

export default router;
