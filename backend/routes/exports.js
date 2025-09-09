// backend/routes/exports.js
import express from "express";
import pool from "../db.js";
const router = express.Router();

router.get("/", async (_, res) => {
  try {
    const result = await pool.query("SELECT * FROM demo_first.exports ORDER BY created_at DESC");
    res.json(result.rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get("/:id", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM demo_first.exports WHERE id=$1", [req.params.id]);
    if (!result.rows.length) return res.status(404).json({ error: "Export non trouvé" });
    res.json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post("/", async (req, res) => {
  try {
    const { type, format, chemin } = req.body;
    const result = await pool.query(
      `INSERT INTO demo_first.exports (type, format, chemin)
       VALUES ($1,$2,$3) RETURNING *`,
      [type, format, chemin]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.delete("/:id", async (req, res) => {
  try {
    const result = await pool.query("DELETE FROM demo_first.exports WHERE id=$1 RETURNING *", [req.params.id]);
    if (!result.rows.length) return res.status(404).json({ error: "Export non trouvé" });
    res.json({ message: "Export supprimé" });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

export default router;
