import express from "express";
import path from "path";
import fssync from "fs";
import pool from "../db.js";
import multer from "multer";
import { fileURLToPath } from "url";

const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join(__dirname, "../uploads")),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, Date.now() + ext);
  },
});
const upload = multer({ storage });

/**
 * @swagger
 * tags:
 *   name: Documents
 *   description: Gestion des documents et versions
 */

/**
 * @swagger
 * /api/documents:
 *   post:
 *     summary: Créer un nouveau document
 *     tags: [Documents]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               owner_user_id: { type: integer }
 *               name: { type: string }
 *     responses:
 *       201:
 *         description: Document créé
 */
router.post("/", async (req, res) => {
  try {
    const { owner_user_id, name } = req.body;
    const { rows } = await pool.query(
      `INSERT INTO demo_first.documents (owner_user_id, name) VALUES ($1,$2) RETURNING *`,
      [owner_user_id, name]
    );
    res.status(201).json(rows[0]);
  } catch {
    res.status(500).json({ error: "Erreur création" });
  }
});

/**
 * @swagger
 * /api/documents/{id}/upload:
 *   post:
 *     summary: Uploader une nouvelle version du document
 *     tags: [Documents]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: Nouvelle version ajoutée
 */
router.post("/:id/upload", upload.single("file"), async (req, res) => {
  try {
    const { id } = req.params;
    const { filename, mimetype, size } = req.file;

    const version = await pool.query(
      `SELECT COALESCE(MAX(version_no),0)+1 AS next FROM demo_first.document_versions WHERE document_id=$1`,
      [id]
    );
    const version_no = version.rows[0].next;

    await pool.query(
      `UPDATE demo_first.documents SET extension=$1, size_bytes=$2, mime_type=$3, updated_at=NOW() WHERE id=$4`,
      [path.extname(filename), size, mimetype, id]
    );

    const { rows } = await pool.query(
      `INSERT INTO demo_first.document_versions (document_id, version_no, storage_uri, created_at)
       VALUES ($1,$2,$3,NOW()) RETURNING *`,
      [id, version_no, filename]
    );

    res.status(201).json(rows[0]);
  } catch {
    res.status(500).json({ error: "Erreur upload" });
  }
});

/**
 * @swagger
 * /api/documents:
 *   get:
 *     summary: Lister tous les documents
 *     tags: [Documents]
 *     responses:
 *       200:
 *         description: Liste des documents
 */
router.get("/", async (req, res) => {
  const { rows } = await pool.query("SELECT * FROM demo_first.documents ORDER BY id DESC");
  res.json(rows);
});

/**
 * @swagger
 * /api/documents/{id}:
 *   get:
 *     summary: Récupérer un document avec ses versions
 *     tags: [Documents]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Document et ses versions
 *       404:
 *         description: Document introuvable
 */
router.get("/:id", async (req, res) => {
  const { id } = req.params;
  const doc = await pool.query("SELECT * FROM demo_first.documents WHERE id=$1", [id]);
  const versions = await pool.query(
    "SELECT * FROM demo_first.document_versions WHERE document_id=$1 ORDER BY version_no DESC",
    [id]
  );
  res.json({ document: doc.rows[0], versions: versions.rows });
});

/**
 * @swagger
 * /api/documents/{id}:
 *   delete:
 *     summary: Supprimer un document (et toutes ses versions)
 *     tags: [Documents]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       204:
 *         description: Document supprimé
 *       404:
 *         description: Document introuvable
 */
router.delete("/:id", async (req, res) => {
  const { id } = req.params;
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const versions = await client.query(
      "SELECT storage_uri FROM demo_first.document_versions WHERE document_id=$1",
      [id]
    );
    versions.rows.forEach((v) => {
      const filePath = path.join(__dirname, "../uploads", v.storage_uri);
      if (fssync.existsSync(filePath)) fssync.unlinkSync(filePath);
    });
    await client.query("DELETE FROM demo_first.document_versions WHERE document_id=$1", [id]);
    const { rowCount } = await client.query("DELETE FROM demo_first.documents WHERE id=$1", [id]);
    await client.query("COMMIT");
    if (rowCount === 0) return res.status(404).json({ error: "Introuvable" });
    res.status(204).send();
  } catch (e) {
    await client.query("ROLLBACK");
    res.status(500).json({ error: "Erreur suppression" });
  } finally {
    client.release();
  }
});

/**
 * @swagger
 * /api/documents/{id}:
 *   put:
 *     summary: Mettre à jour un document
 *     tags: [Documents]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name: { type: string }
 *               owner_user_id: { type: integer }
 *               status: { type: string }
 *     responses:
 *       200:
 *         description: Document mis à jour
 *       404:
 *         description: Document introuvable
 */
router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const { name, owner_user_id, status } = req.body;
  const { rows } = await pool.query(
    `UPDATE demo_first.documents SET name=$1, owner_user_id=$2, status=$3, updated_at=NOW() WHERE id=$4 RETURNING *`,
    [name, owner_user_id, status, id]
  );
  if (rows.length === 0) return res.status(404).json({ error: "Introuvable" });
  res.json(rows[0]);
});

export default router;
