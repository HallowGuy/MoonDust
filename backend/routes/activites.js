// backend/routes/activites.js
import express from "express";
import pool from "../db.js";
import { authenticate } from "../middleware/authenticate.js";

const router = express.Router();

// GET all
// GET all ou filtré par contact_id
router.get("/", async (req, res) => {
  try {
    const { contact_id } = req.query;
    let query = `
      SELECT a.*, 
             ku.username AS utilisateur_username,
             ku.email AS utilisateur_email
      FROM demo_first.activites a
      LEFT JOIN demo_first.keycloak_users ku 
        ON ku.id = a.utilisateur_id
    `;
    const params = [];

    if (contact_id) {
      query += " WHERE a.contact_id = $1";
      params.push(contact_id);
    }

    query += " ORDER BY a.date DESC";

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// GET one
router.get("/:id", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM demo_first.activites WHERE id=$1", [req.params.id]);
    if (!result.rows.length) return res.status(404).json({ error: "Activité non trouvée" });
    res.json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post("/", async (req, res) => {
  try {
    const { contact_id, type, description } = req.body;

    const result = await pool.query(
      `INSERT INTO demo_first.activites (contact_id, type, description, utilisateur_id)
       VALUES ($1,$2,$3,$4) RETURNING *`,
      [contact_id, type, description, req.user.id] // ⚡ utilisateur de la session
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});




// PUT
router.put("/:id", async (req, res) => {
  try {
    const { type, description } = req.body;
    const result = await pool.query(
      `UPDATE demo_first.activites SET type=$1, description=$2
       WHERE id=$3 RETURNING *`,
      [type, description, req.params.id]
    );
    if (!result.rows.length) return res.status(404).json({ error: "Activité non trouvée" });
    res.json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// DELETE
router.delete("/:id", async (req, res) => {
  try {
    const result = await pool.query("DELETE FROM demo_first.activites WHERE id=$1 RETURNING *", [req.params.id]);
    if (!result.rows.length) return res.status(404).json({ error: "Activité non trouvée" });
    res.json({ message: "Activité supprimée" });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

export default router;
