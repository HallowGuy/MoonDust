import express from "express"
import path from "path"
import fssync from "fs"
import mime from "mime-types"

const router = express.Router()

// 👉 servir les fichiers uploadés
router.get("/:file", (req, res) => {
  const filePath = path.join(process.cwd(), "uploads", req.params.file)

  if (!fssync.existsSync(filePath)) {
    return res.status(404).send("Fichier introuvable")
  }

  const type = mime.lookup(filePath) || "application/octet-stream"
  res.setHeader("Content-Type", type)
  res.setHeader("Content-Disposition", `inline; filename="${req.params.file}"`)

  fssync.createReadStream(filePath).pipe(res)
})

export default router
