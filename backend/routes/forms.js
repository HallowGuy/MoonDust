import express from "express"
import fs from "fs/promises"
import path from "path"
import { fileURLToPath } from "url"

const router = express.Router()
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const FORMS_CONFIG_FILE = path.join(__dirname, "../forms-config.json")

// Lire les formulaires
async function getFormsConfig() {
  try {
    const data = await fs.readFile(FORMS_CONFIG_FILE, "utf-8")
    return JSON.parse(data)
  } catch (err) {
    console.warn("⚠️ Aucun fichier forms-config.json trouvé → création vide")
    await fs.writeFile(FORMS_CONFIG_FILE, JSON.stringify([], null, 2), "utf-8")
    return []
  }
}

// Sauvegarder
async function setFormsConfig(config) {
  await fs.writeFile(FORMS_CONFIG_FILE, JSON.stringify(config, null, 2), { encoding: "utf-8" })
  console.log("💾 Forms config sauvegardée dans :", FORMS_CONFIG_FILE)
}

// 🚀 GET tous les formulaires
router.get("/", async (req, res) => {
  try {
    const config = await getFormsConfig()
    res.json(config)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// 🚀 GET formulaire par ID
router.get("/:id", async (req, res) => {
  try {
    const forms = await getFormsConfig()
    const form = forms.find((f) => f.id === req.params.id)
    if (!form) return res.status(404).json({ error: "Formulaire non trouvé" })
    res.json(form)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// 🚀 POST créer un formulaire
router.post("/", async (req, res) => {
  try {
    const forms = await getFormsConfig()
    const newForm = {
      id: req.body.id,
      name: req.body.name,
      schema: req.body.schema || { display: "form", components: [] },
    }
    forms.push(newForm)
    await setFormsConfig(forms)
    res.status(201).json(newForm)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// 🚀 PUT mettre à jour un formulaire
router.put("/:id", async (req, res) => {
  try {
    let forms = await getFormsConfig()
    const index = forms.findIndex((f) => f.id === req.params.id)
    if (index === -1) return res.status(404).json({ error: "Formulaire non trouvé" })

    forms[index] = { ...forms[index], ...req.body }
    await setFormsConfig(forms)
    res.json(forms[index])
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// 🚀 DELETE supprimer un formulaire
router.delete("/:id", async (req, res) => {
  try {
    let forms = await getFormsConfig()
    const filtered = forms.filter((f) => f.id !== req.params.id)
    if (filtered.length === forms.length) {
      return res.status(404).json({ error: "Formulaire non trouvé" })
    }
    await setFormsConfig(filtered)
    res.json({ success: true })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

export default router
