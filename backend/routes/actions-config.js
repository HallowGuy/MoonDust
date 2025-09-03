import express from "express"
import fs from "fs/promises"
import path from "path"
import { fileURLToPath } from "url"

const router = express.Router()
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const ACTIONS_CONFIG_FILE = path.join(__dirname, "../config/config-actions.json")


// Lire la config
async function getActionsConfig() {
  try {
    const data = await fs.readFile(ACTIONS_CONFIG_FILE, "utf-8")
    return JSON.parse(data)
  } catch (err) {
    console.warn("⚠️ Aucun fichier actions-config.json trouvé → création vide")
    await fs.writeFile(ACTIONS_CONFIG_FILE, JSON.stringify({}, null, 2), "utf-8")
    return {}
  }
}

// Sauvegarder la config
async function setActionsConfig(config) {
  await fs.writeFile(ACTIONS_CONFIG_FILE, JSON.stringify(config, null, 2), { encoding: "utf-8" })
  console.log("💾 Actions config sauvegardée dans :", ACTIONS_CONFIG_FILE)
}

// 🚀 GET config
router.get("/", async (req, res) => {
  try {
    const config = await getActionsConfig()
    res.json(config)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// 🚀 POST config
router.post("/", async (req, res) => {
  try {
    const config = req.body

    // validation légère
    Object.keys(config).forEach((key) => {
      if (!config[key].roles) config[key].roles = []
      if (!config[key].thematique) config[key].thematique = "Autre"
    })

    console.log("📥 Nouvelle actions-config reçue :", config)
    await setActionsConfig(config)
    res.json({ success: true })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

export default router
