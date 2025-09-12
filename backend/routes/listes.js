// backend/routes/listes.js
import express from "express";
import pool from "../db.js";
const router = express.Router();

// Récupérer toutes les valeurs
router.get("/", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM demo_first.listes ORDER BY type, ordre, valeur")
    res.json(result.rows)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})
// Renommer un type
router.put("/rename", async (req, res) => {
  const { oldType, newType } = req.body
  try {
    await pool.query("UPDATE demo_first.listes SET type=$1 WHERE type=$2", [newType, oldType])
    res.json({ message: "Type renommé" })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// ➜ À ajouter avant les routes paramétrées (/:type, /:type/:parentId)
router.get('/count', async (req, res) => {
  try {
    const { type, active, distinct } = req.query
    const where = []
    const params = []

    if (type) { params.push(type); where.push(`type = $${params.length}`) }
    if (typeof active !== 'undefined') {
      const val = active === 'true' || active === '1'
      params.push(val); where.push(`actif = $${params.length}`)
    }

    const whereSql = where.length ? ` WHERE ${where.join(' AND ')}` : ''

    let sql
    if (!type && (distinct === 'type')) {
      sql = `SELECT COUNT(DISTINCT type)::int AS count FROM demo_first.listes${whereSql}`
    } else {
      sql = `SELECT COUNT(*)::int AS count FROM demo_first.listes${whereSql}`
    }

    const result = await pool.query(sql, params)
    res.json({ count: result.rows[0].count })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// Supprimer tout un type
router.delete("/delete-type/:type", async (req, res) => {
  try {
    await pool.query("DELETE FROM demo_first.listes WHERE type=$1", [req.params.type])
    res.json({ message: "Type supprimé" })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})
// Récupérer la liste des types distincts
router.get("/types", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT DISTINCT type FROM demo_first.listes ORDER BY type"
    );
    res.json(result.rows.map(r => r.type));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Récupérer toutes les valeurs d’un type
router.get("/:type", async (req, res) => {
  try {
    const { type } = req.params;
        const { limit, skip, ignoreFormio } = req.query  

    const result = await pool.query(
      "SELECT * FROM demo_first.listes WHERE type=$1 ORDER BY ordre, valeur",
      [type]
    );
    res.json(result.rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Récupérer les sous-enfants d’une valeur
router.get("/:type/:parentId", async (req, res) => {
  try {
    const { type, parentId } = req.params;
    const result = await pool.query(
      "SELECT * FROM demo_first.listes WHERE type=$1 AND parent_id=$2 ORDER BY ordre, valeur",
      [type, parentId]
    );
    res.json(result.rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Créer une valeur
router.post("/", async (req, res) => {
  try {
    const { type, valeur, parent_id, ordre } = req.body;
    const result = await pool.query(
      `INSERT INTO demo_first.listes (type, valeur, parent_id, ordre)
       VALUES ($1,$2,$3,$4) RETURNING *`,
      [type, valeur, parent_id || null, ordre || 0]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Modifier une valeur
router.put("/:id", async (req, res) => {
  try {
    const { valeur, ordre, actif } = req.body;
    const result = await pool.query(
      `UPDATE demo_first.listes
       SET valeur=$1, ordre=$2, actif=$3
       WHERE id=$4 RETURNING *`,
      [valeur, ordre, actif, req.params.id]
    );
    if (!result.rows.length) return res.status(404).json({ error: "Valeur non trouvée" });
    res.json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Supprimer une valeur (et ses sous-enfants grâce à ON DELETE CASCADE)
router.delete("/:id", async (req, res) => {
  try {
    const result = await pool.query("DELETE FROM demo_first.listes WHERE id=$1 RETURNING *", [req.params.id]);
    if (!result.rows.length) return res.status(404).json({ error: "Valeur non trouvée" });
    res.json({ message: "Valeur supprimée" });
  } catch (err) { res.status(500).json({ error: err.message }); }
});






export default router;
