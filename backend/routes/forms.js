// routes/forms.js
import express from "express";
import pool from "../db.js";
import { authenticate } from "../middleware/authenticate.js";

const router = express.Router();

// === LISTE DES FORMS (avec version publiée) ===
router.get("/", async (_req, res) => {
  const { rows } = await pool.query(`
    SELECT
      f.id,
      f.name,
      pv.version AS current_version,
      pv.schema  AS current_schema
    FROM demo_first.forms f
    LEFT JOIN LATERAL (
      SELECT version, schema
      FROM demo_first.form_versions
      WHERE form_id = f.id AND status = 'publiée'
      ORDER BY version DESC
      LIMIT 1
    ) AS pv ON TRUE
    ORDER BY f.id
  `);
  res.json(rows);
});


// ➜ À ajouter avant les routes paramétrées (/:type, /:type/:parentId)
router.get('/count', async (req, res) => {
  try {
    const { type, active } = req.query

    const where = []
    const params = []

    if (type) {
      params.push(type)
      where.push(`type = $${params.length}`)
    }
    if (typeof active !== 'undefined') {
      // accepte active=true/false/1/0
      const val = active === 'true' || active === '1'
      params.push(val)
      where.push(`actif = $${params.length}`)
    }

    let sql = 'SELECT COUNT(*)::int AS count FROM demo_first.forms'
    if (where.length) sql += ' WHERE ' + where.join(' AND ')

    const result = await pool.query(sql, params)
    res.json({ count: result.rows[0].count })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})


// === DÉTAIL D’UN FORM (avec version publiée) ===
router.get("/:id", async (req, res) => {
  const { rows } = await pool.query(`
    SELECT
      f.id,
      f.name,
      pv.version AS current_version,
      pv.schema  AS current_schema
    FROM demo_first.forms f
    LEFT JOIN LATERAL (
      SELECT version, schema
      FROM demo_first.form_versions
      WHERE form_id = f.id AND status = 'publiée'
      ORDER BY version DESC
      LIMIT 1
    ) AS pv ON TRUE
    WHERE f.id = $1
  `, [req.params.id]);
  if (!rows.length) return res.status(404).json({ error: "Form not found" });
  res.json(rows[0]);
});

router.get("/:id/versions", async (req, res) => {
  const { rows } = await pool.query(`
    SELECT id, form_id, version, status, notes, author_id, created_at
    FROM demo_first.form_versions
    WHERE form_id = $1
    ORDER BY version DESC
  `, [req.params.id]);
  res.json(rows);
});

router.post("/:id/versions", authenticate, async (req, res) => {
  const { schema, notes } = req.body || {};
  const authorId = req.auth?.sub || null;

  await pool.query(`
    INSERT INTO demo_first.forms (id, name)
    VALUES ($1, $1) ON CONFLICT (id) DO NOTHING
  `, [req.params.id]);

  const { rows: last } = await pool.query(`
    SELECT COALESCE(MAX(version),0)+1 AS next
    FROM demo_first.form_versions WHERE form_id=$1
  `, [req.params.id]);

  const next = last[0].next;
  const { rows } = await pool.query(`
    INSERT INTO demo_first.form_versions (form_id, version, status, schema, notes, author_id)
    VALUES ($1,$2,'brouillon',$3,$4,$5)
    RETURNING *
  `, [req.params.id, next, JSON.stringify(schema||{}), notes||null, authorId]);

  res.status(201).json(rows[0]);
});

router.put("/:id/versions/:version/publish", authenticate, async (req, res) => {
  const { id, version } = req.params;
  await pool.query(`
    UPDATE demo_first.form_versions SET status='archivée'
    WHERE form_id=$1 AND status='publiée'
  `, [id]);
  const { rows } = await pool.query(`
    UPDATE demo_first.form_versions SET status='publiée'
    WHERE form_id=$1 AND version=$2
    RETURNING *
  `, [id, version]);
  if (!rows.length) return res.status(404).json({ error: "Version not found" });
  res.json(rows[0]);
});

router.put("/:id/versions/:version/archive", authenticate, async (req, res) => {
  const { id, version } = req.params;
  const { rows } = await pool.query(`
    UPDATE demo_first.form_versions SET status='archivée'
    WHERE form_id=$1 AND version=$2
    RETURNING *
  `, [id, version]);
  if (!rows.length) return res.status(404).json({ error: "Version not found" });
  res.json(rows[0]);
});

router.get("/:id/versions/:version", async (req, res) => {
  const { id, version } = req.params;
  const { rows } = await pool.query(`
    SELECT * FROM demo_first.form_versions
    WHERE form_id=$1 AND version=$2
  `, [id, version]);
  if (!rows.length) return res.status(404).json({ error: "Version not found" });
  res.json(rows[0]);
});

router.post("/:id/versions/:version/restore", authenticate, async (req, res) => {
  const { id, version } = req.params;
  const authorId = req.auth?.sub || null;

  const { rows: v } = await pool.query(`
    SELECT schema FROM demo_first.form_versions
    WHERE form_id=$1 AND version=$2
  `, [id, version]);
  if (!v.length) return res.status(404).json({ error: "Version not found" });

  const { rows: last } = await pool.query(`
    SELECT COALESCE(MAX(version),0)+1 AS next
    FROM demo_first.form_versions WHERE form_id=$1
  `, [id]);

  const next = last[0].next;
  const { rows } = await pool.query(`
    INSERT INTO demo_first.form_versions (form_id, version, status, schema, notes, author_id)
    VALUES ($1,$2,'brouillon',$3,$4,$5)
    RETURNING *
  `, [id, next, v[0].schema, `restore from v${version}`, authorId]);

  res.status(201).json(rows[0]);
});


router.delete("/:id", authenticate, async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query("BEGIN");

    // on supprime d’abord les versions
    await pool.query(
      "DELETE FROM demo_first.form_versions WHERE form_id = $1",
      [id]
    );

    // puis le formulaire
    const del = await pool.query(
      "DELETE FROM demo_first.forms WHERE id = $1 RETURNING id",
      [id]
    );

    await pool.query("COMMIT");

    if (!del.rowCount) return res.status(404).json({ error: "Form not found" });
    return res.status(204).send(); // No Content
  } catch (e) {
    await pool.query("ROLLBACK");
    console.error("❌ DELETE /forms/:id:", e);
    return res.status(500).json({ error: e.message });
  }
});

/**
 * DELETE /api/forms/:id/versions/:version
 * Supprime une version précise.
 * (Optionnel: empêcher de supprimer une version 'publiée'.)
 */
router.delete("/:id/versions/:version", authenticate, async (req, res) => {
  const { id, version } = req.params;
  try {
    // exemple: bloque la suppression d'une version publiée
    const check = await pool.query(
      "SELECT status FROM demo_first.form_versions WHERE form_id = $1 AND version = $2",
      [id, version]
    );
    if (!check.rowCount) return res.status(404).json({ error: "Version not found" });
    if (check.rows[0].status === "publiée") {
      return res.status(400).json({ error: "Cannot delete a publiée version" });
    }

    const del = await pool.query(
      "DELETE FROM demo_first.form_versions WHERE form_id = $1 AND version = $2",
      [id, version]
    );
    if (!del.rowCount) return res.status(404).json({ error: "Version not found" });
    return res.status(204).send();
  } catch (e) {
    console.error("❌ DELETE /forms/:id/versions/:version:", e);
    return res.status(500).json({ error: e.message });
  }
});

/**
 * PATCH /api/forms/:id
 * Met à jour uniquement le nom du formulaire (pas l'id).
 * body: { name: "Nouveau nom" }
 */
router.patch("/:id", authenticate, async (req, res) => {
  const { id } = req.params;
  const { name } = req.body || {};
  try {
    const newName = (name || "").trim();
    if (!newName) return res.status(400).json({ error: "Name is required" });

    const up = await pool.query(
      "UPDATE demo_first.forms SET name = $2 WHERE id = $1 RETURNING id, name",
      [id, newName]
    );
    if (!up.rowCount) return res.status(404).json({ error: "Form not found" });

    // Optionnel: renvoyer la version publiée actuelle pour rafraîchir l’UI
    const meta = await pool.query(`
      SELECT
        f.id,
        f.name,
        pv.version AS current_version,
        pv.schema  AS current_schema
      FROM demo_first.forms f
      LEFT JOIN LATERAL (
        SELECT version, schema
        FROM demo_first.form_versions
        WHERE form_id = f.id AND status = 'publiée'
        ORDER BY version DESC
        LIMIT 1
      ) AS pv ON TRUE
      WHERE f.id = $1
    `, [id]);

    return res.json(meta.rows[0] || up.rows[0]);
  } catch (e) {
    console.error("❌ PATCH /forms/:id:", e);
    return res.status(500).json({ error: e.message });
  }
});

export default router;
