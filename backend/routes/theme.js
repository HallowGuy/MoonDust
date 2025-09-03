import express from "express"
import path from "path"
import fssync from "fs"
import { uploadLogo, upload } from "../middleware/multer.js"

const router = express.Router()

const themesPath = path.join(process.cwd(), "themes.json")
let themes = JSON.parse(fssync.readFileSync(themesPath, "utf8"))
let currentTheme = "default"

// 🔥 rendre le dossier logo accessible publiquement
router.use("/logo", express.static(path.join(process.cwd(), "uploads/logo")))

// ✅ Récupérer le logo
router.get("/logo", (req, res) => {
  const logoPath = path.join(process.cwd(), "uploads/logo/theme-logo.svg")

  if (!fssync.existsSync(logoPath)) {
    return res.status(404).json({ error: "Aucun logo défini" })
  }

  res.sendFile(logoPath)
})

// 🔥 upload logo
router.post("/logo", uploadLogo.single("file"), (req, res) => {
  try {
    res.json({
      ok: true,
      message: "Logo mis à jour",
      url: `/api/theme/logo?t=${Date.now()}`, // cache-busting
    })
  } catch (err) {
    console.error("❌ Erreur upload logo:", err)
    res.status(500).json({ error: "Échec upload logo" })
  }
})

// ✅ Liste des thèmes
router.get("/list", (req, res) => {
  res.json(Object.keys(themes))
})

// ✅ Thème courant
router.get("/current", (req, res) => {
  res.json({
    name: currentTheme,
    colors: themes[currentTheme],
  })
})

router.put("/current", (req, res) => {
  const { name } = req.body
  if (!themes[name]) {
    return res.status(400).json({ error: "Thème inconnu" })
  }
  currentTheme = name
  res.json({ ok: true, theme: themes[currentTheme] })
})

// ✅ Couleurs du thème
router.get("/colors", (req, res) => {
  res.json(themes[currentTheme])
})

router.put("/colors", (req, res) => {
  const newColors = req.body
  themes[currentTheme] = newColors
  fssync.writeFileSync(themesPath, JSON.stringify(themes, null, 2), "utf8")
  res.json({ ok: true, theme: newColors })
})

export default router
