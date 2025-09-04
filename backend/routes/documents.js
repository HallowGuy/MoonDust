// backend/routes/documents.js
import express from "express";
import multer from "multer";
import path, { dirname } from "path";
import { fileURLToPath } from "url";
import fs from "fs";
import fsp from "fs/promises";
import pool from "../db.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// dossiers
const uploadsDir = path.join(__dirname, "..", "uploads");
await fsp.mkdir(uploadsDir, { recursive: true });

// multer pour versions de documents
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadsDir),
  filename: (_req, file, cb) => cb(null, `${Date.now()}${path.extname(file.originalname)}`),
});
const upload = multer({ storage });

const router = express.Router();

// POST /api/documents  { owner_user_id, name }
router.post("/", async (req, res) => {
  try {
    const { owner_user_id, name } = req.body;
    const { rows } = await pool.query(
      `INSERT INTO demo_first.documents (owner_user_id, name) VALUES ($1, $2) RETURNING *`,
      [owner_user_id, name]
    );
    res.status(201).json(rows[0]);
  } catch (e) { res.status(500).json({ error: "Erreur serveur" }); }
});

// POST /api/documents/:id/upload  (file)
router.post("/:id/upload", upload.single("file"), async (req, res) => {
  try {
    const { id } = req.params;
    const vres = await pool.query(
      `SELECT COALESCE(MAX(version_no),0)+1 AS next FROM demo_first.document_versions WHERE document_id=$1`,
      [id]
    );
    const version_no = vres.rows[0].next;
    const { filename, mimetype, size } = req.file;

    await pool.query(
      `UPDATE demo_first.documents 
       SET extension=$1, size_bytes=$2, mime_type=$3, updated_at=NOW()
       WHERE id=$4`,
      [path.extname(filename), size, mimetype, id]
    );

    const { rows } = await pool.query(
      `INSERT INTO demo_first.document_versions (document_id, version_no, storage_uri, checksum_sha256, created_at)
       VALUES ($1,$2,$3,$4,NOW()) RETURNING *`,
      [id, version_no, filename, null]
    );
    res.status(201).json(rows[0]);
  } catch (e) { res.status(500).json({ error: "Erreur upload" }); }
});

// GET /api/documents
router.get("/", async (_req, res) => {
  try {
    const { rows } = await pool.query(`SELECT * FROM demo_first.documents ORDER BY updated_at DESC`);
    res.json(rows);
  } catch (e) { res.status(500).json({ error: "Erreur serveur" }); }
});

// GET /api/documents/:id
router.get("/:id", async (req, res) => {
  const { id } = req.params;
  const doc = await pool.query(`SELECT * FROM demo_first.documents WHERE id=$1`, [id]);
  const versions = await pool.query(
    `SELECT * FROM demo_first.document_versions WHERE document_id=$1 ORDER BY version_no DESC`,
    [id]
  );
  res.json({ document: doc.rows[0], versions: versions.rows });
});

// DELETE /api/documents/:id (supprime fichiers + lignes)
router.delete("/:id", async (req, res) => {
  const client = await pool.connect();
  try {
    const { id } = req.params;
    await client.query("BEGIN");

    const versions = await client.query(
      `SELECT storage_uri FROM demo_first.document_versions WHERE document_id=$1`,
      [id]
    );
    for (const v of versions.rows) {
      const filePath = path.join(uploadsDir, v.storage_uri);
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    }

    await client.query(`DELETE FROM demo_first.document_versions WHERE document_id=$1`, [id]);
    const { rowCount } = await client.query(`DELETE FROM demo_first.documents WHERE id=$1`, [id]);

    await client.query("COMMIT");
    if (rowCount === 0) return res.status(404).json({ error: "Document introuvable" });
    res.status(204).send();
  } catch (e) {
    await client.query("ROLLBACK");
    res.status(500).json({ error: "Erreur suppression document" });
  } finally {
    client.release();
  }
});

// PUT /api/documents/:id  { name, owner_user_id, status }
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { name, owner_user_id, status } = req.body;
    const { rows } = await pool.query(
      `UPDATE demo_first.documents 
       SET name=$1, owner_user_id=$2, status=$3, updated_at=NOW()
       WHERE id=$4 RETURNING *`,
      [name, owner_user_id, status, id]
    );
    if (!rows.length) return res.status(404).json({ error: "Document introuvable" });
    res.json(rows[0]);
  } catch (_e) { res.status(500).json({ error: "Erreur serveur" }); }
});

export default router;
