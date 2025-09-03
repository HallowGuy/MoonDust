import express from "express"
import pool from "../db.js"
import multer from "multer"
import path from "path"
import fssync from "fs"

const router = express.Router()

// ---------- MULTER CONFIG ----------
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join(process.cwd(), "uploads")),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname)
    cb(null, Date.now() + ext)
  },
})
const upload = multer({ storage })

// ----------------------------------------------------
// --------------------- DOCUMENTS -------------------
// ----------------------------------------------------
router.post("/", async (req, res) => {
  try {
    const { owner_user_id, name } = req.body
    const { rows } = await pool.query(
      `INSERT INTO demo_first.documents (owner_user_id, name) VALUES ($1, $2) RETURNING *`,
      [owner_user_id, name]
    )
    res.status(201).json(rows[0])
  } catch (e) {
    console.error(e)
    res.status(500).json({ error: "Erreur création document" })
  }
})

router.post("/:id/upload", upload.single("file"), async (req, res) => {
  try {
    const { id } = req.params
    const version = await pool.query(
      `SELECT COALESCE(MAX(version_no),0)+1 AS next FROM demo_first.document_versions WHERE document_id=$1`,
      [id]
    )
    const version_no = version.rows[0].next

    const { filename, mimetype, size } = req.file

    await pool.query(
      `UPDATE demo_first.documents 
       SET extension=$1, size_bytes=$2, mime_type=$3, updated_at=NOW()
       WHERE id=$4`,
      [path.extname(filename), size, mimetype, id]
    )

    const { rows } = await pool.query(
      `INSERT INTO demo_first.document_versions (document_id, version_no, storage_uri, checksum_sha256, created_at)
       VALUES ($1,$2,$3,$4,NOW()) RETURNING *`,
      [id, version_no, filename, null]
    )

    res.status(201).json(rows[0])
  } catch (e) {
    console.error(e)
    res.status(500).json({ error: "Erreur upload version" })
  }
})

router.get("/", async (req, res) => {
  const { rows } = await pool.query("SELECT * FROM demo_first.documents ORDER BY id DESC")
  res.json(rows)
})

router.get("/:id", async (req, res) => {
  const { id } = req.params
  const doc = await pool.query("SELECT * FROM demo_first.documents WHERE id=$1", [id])
  const versions = await pool.query(
    "SELECT * FROM demo_first.document_versions WHERE document_id=$1 ORDER BY version_no DESC",
    [id]
  )
  res.json({ document: doc.rows[0], versions: versions.rows })
})

router.delete("/:id", async (req, res) => {
  const client = await pool.connect()
  try {
    const { id } = req.params
    await client.query("BEGIN")

    const versions = await client.query(
      "SELECT storage_uri FROM demo_first.document_versions WHERE document_id=$1",
      [id]
    )

    versions.rows.forEach((v) => {
      const filePath = path.join(process.cwd(), "uploads", v.storage_uri)
      if (fssync.existsSync(filePath)) fssync.unlinkSync(filePath)
    })

    await client.query("DELETE FROM demo_first.document_versions WHERE document_id=$1", [id])
    const { rowCount } = await client.query("DELETE FROM demo_first.documents WHERE id=$1", [id])

    await client.query("COMMIT")
    if (rowCount === 0) return res.status(404).json({ error: "Document introuvable" })
    res.status(204).send()
  } catch (e) {
    await client.query("ROLLBACK")
    console.error("❌ Erreur delete doc:", e)
    res.status(500).json({ error: "Erreur suppression document" })
  } finally {
    client.release()
  }
})

router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params
    const { name, owner_user_id, status } = req.body

    const { rows } = await pool.query(
      `UPDATE demo_first.documents 
       SET name=$1, owner_user_id=$2, status=$3, updated_at=NOW()
       WHERE id=$4 RETURNING *`,
      [name, owner_user_id, status, id]
    )

    if (rows.length === 0) {
      return res.status(404).json({ error: "Document introuvable" })
    }

    res.json(rows[0])
  } catch (e) {
    console.error("❌ Erreur SQL (update document):", e)
    res.status(500).json({ error: "Erreur serveur" })
  }
})

export default router
