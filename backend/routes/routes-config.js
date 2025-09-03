import express from "express"
import fs from "fs/promises"
import path from "path"
import { fileURLToPath } from "url"

const router = express.Router()
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const CONFIG_FILE = path.join(__dirname, "../config/config-routes.json")

// Lire la config
async function getConfig() {
  try {
    const data = await fs.readFile(CONFIG_FILE, { encoding: "utf-8" })
    return JSON.parse(data)
  } catch (err) {
    console.error("⚠️ Aucun fichier config-routes.json trouvé, retour objet vide")
    return {}
  }
}

// Sauvegarder la config
async function setConfig(config) {
  await fs.writeFile(CONFIG_FILE, JSON.stringify(config, null, 2), { encoding: "utf-8" })
  console.log("Config sauvegardée dans :", CONFIG_FILE)
}

// 🚀 GET config
router.get("/", async (req, res) => {
  try {
    const config = await getConfig()
    res.json(config)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// 🚀 POST config
router.post("/", async (req, res) => {
  try {
    const config = req.body
    console.log("📥 Nouvelle config reçue :", config)
    await setConfig(config)
    res.json({ success: true })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

export default router
