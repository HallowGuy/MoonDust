// backend/routes/config.js
import express from "express";
import path, { dirname } from "path";
import { fileURLToPath } from "url";
import fs from "fs/promises";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const router = express.Router();

// --- fichiers
const ROUTES_CONFIG = path.join(__dirname, "..", "config", "config-routes.json");
const ACTIONS_CONFIG = path.join(__dirname, "..", "config", "config-actions.json");
const FORMS_CONFIG = path.join(__dirname, "..", "forms-config.json");

// util génériques
async function readJson(file, fallback) {
  try { return JSON.parse(await fs.readFile(file, "utf8")); }
  catch { await fs.writeFile(file, JSON.stringify(fallback, null, 2), "utf8"); return fallback; }
}
async function writeJson(file, data) {
  await fs.writeFile(file, JSON.stringify(data, null, 2), "utf8");
}

// ===== routes-config =====
router.get("/routes-config", async (_req, res) => {
  try { res.json(await readJson(ROUTES_CONFIG, {})); }
  catch (e) { res.status(500).json({ error: e.message }); }
});
router.post("/routes-config", async (req, res) => {
  try { await writeJson(ROUTES_CONFIG, req.body || {}); res.json({ success: true }); }
  catch (e) { res.status(500).json({ error: e.message }); }
});

// ===== actions-config =====
router.get("/actions-config", async (_req, res) => {
  try { res.json(await readJson(ACTIONS_CONFIG, {})); }
  catch (e) { res.status(500).json({ error: e.message }); }
});
router.post("/actions-config", async (req, res) => {
  try {
    const cfg = req.body || {};
    Object.keys(cfg).forEach(k => {
      if (!cfg[k].roles) cfg[k].roles = [];
      if (!cfg[k].thematique) cfg[k].thematique = "Autre";
    });
    await writeJson(ACTIONS_CONFIG, cfg);
    res.json({ success: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ===== forms-config =====
router.get("/forms", async (_req, res) => {
  try { res.json(await readJson(FORMS_CONFIG, [])); }
  catch (e) { res.status(500).json({ error: e.message }); }
});

router.get("/forms/:id", async (req, res) => {
  try {
    const forms = await readJson(FORMS_CONFIG, []);
    const found = forms.find(f => f.id === req.params.id);
    if (!found) return res.status(404).json({ error: "Formulaire non trouvé" });
    res.json(found);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.post("/forms", async (req, res) => {
  try {
    const forms = await readJson(FORMS_CONFIG, []);
    const form = {
      id: req.body.id,
      name: req.body.name,
      schema: req.body.schema || { display: "form", components: [] },
    };
    forms.push(form);
    await writeJson(FORMS_CONFIG, forms);
    res.status(201).json(form);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.put("/forms/:id", async (req, res) => {
  try {
    const forms = await readJson(FORMS_CONFIG, []);
    const i = forms.findIndex(f => f.id === req.params.id);
    if (i === -1) return res.status(404).json({ error: "Formulaire non trouvé" });
    forms[i] = { ...forms[i], ...req.body };
    await writeJson(FORMS_CONFIG, forms);
    res.json(forms[i]);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.delete("/forms/:id", async (req, res) => {
  try {
    const forms = await readJson(FORMS_CONFIG, []);
    const filtered = forms.filter(f => f.id !== req.params.id);
    if (filtered.length === forms.length) return res.status(404).json({ error: "Formulaire non trouvé" });
    await writeJson(FORMS_CONFIG, filtered);
    res.json({ success: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

export default router;
