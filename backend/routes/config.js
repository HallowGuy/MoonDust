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

// ===== forms (1 fichier par formulaire) =====
const FORMS_DIR = path.join(__dirname, "..", "forms");

// util dossier / nom de fichier
async function ensureDir(dir) { await fs.mkdir(dir, { recursive: true }); }
function slugifyId(id) {
  return String(id)
    .toLowerCase()
    .normalize("NFKD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9-_]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
function formFilePath(id) {
  return path.join(FORMS_DIR, `${slugifyId(id)}.json`);
}
async function readFormFile(id) {
  const file = formFilePath(id);
  const raw = await fs.readFile(file, "utf8");
  return JSON.parse(raw);
}
async function writeFormFile(form) {
  if (!form?.id) throw new Error("Form.id requis");
  const file = formFilePath(form.id);
  const tmp = file + ".tmp";
  await fs.writeFile(tmp, JSON.stringify(form, null, 2), "utf8");
  await fs.rename(tmp, file);
}

// migration depuis l'ancien forms-config.json (tableau) vers /forms/*.json
async function migrateFormsIfNeeded() {
  await ensureDir(FORMS_DIR);
  try {
    const stat = await fs.stat(FORMS_CONFIG).catch(() => null);
    if (!stat) return; // pas d'ancien fichier, rien à migrer

    const files = await fs.readdir(FORMS_DIR);
    if (files.some((f) => f.endsWith(".json"))) return; // déjà migré

    const legacy = await readJson(FORMS_CONFIG, []);
    if (Array.isArray(legacy) && legacy.length) {
      for (const f of legacy) {
        if (!f?.id) continue;
        const exists = await fs
          .stat(formFilePath(f.id))
          .then(() => true)
          .catch(() => false);
        if (!exists) {
          const now = new Date().toISOString();
          await writeFormFile({
            id: f.id,
            name: f.name || f.id,
            schema: f.schema || { display: "form", components: [] },
            createdAt: f.createdAt || now,
            updatedAt: f.updatedAt || now,
          });
        }
      }
    }
    // option : on garde l'ancien fichier comme backup
    await fs.rename(FORMS_CONFIG, FORMS_CONFIG.replace(".json", ".migrated.json")).catch(()=>{});
  } catch (e) {
    console.warn("Migration forms échouée (continuation sans bloquer):", e.message);
  }
}
// lancer la migration au chargement du routeur
await migrateFormsIfNeeded();

// LISTE
router.get("/forms", async (_req, res) => {
  try {
    await ensureDir(FORMS_DIR);
    const files = (await fs.readdir(FORMS_DIR)).filter((f) => f.endsWith(".json"));
    const forms = await Promise.all(
      files.map(async (f) => {
        try {
          const raw = await fs.readFile(path.join(FORMS_DIR, f), "utf8");
          return JSON.parse(raw);
        } catch {
          return null;
        }
      })
    );
    res.json(forms.filter(Boolean));
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// LIRE
router.get("/forms/:id", async (req, res) => {
  try {
    const form = await readFormFile(req.params.id);
    res.json(form);
  } catch (e) {
    if (e.code === "ENOENT") return res.status(404).json({ error: "Formulaire non trouvé" });
    res.status(500).json({ error: e.message });
  }
});

// CRÉER
router.post("/forms", async (req, res) => {
  try {
    const { id, name, schema } = req.body || {};
    if (!id) return res.status(400).json({ error: "Champ 'id' requis" });

    await ensureDir(FORMS_DIR);
    const file = formFilePath(id);
    const exists = await fs.stat(file).then(() => true).catch(() => false);
    if (exists) return res.status(409).json({ error: "Un formulaire avec cet id existe déjà" });

    const now = new Date().toISOString();
    const form = {
      id,
      name: name || id,
      schema: schema || { display: "form", components: [] },
      createdAt: now,
      updatedAt: now,
    };
    await writeFormFile(form);
    res.status(201).json(form);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// METTRE À JOUR (+ rename si l'id change)
router.put("/forms/:id", async (req, res) => {
  try {
    const current = await readFormFile(req.params.id); // 404 si absent
    const next = {
      ...current,
      ...req.body,
      id: (req.body?.id || current.id),
      updatedAt: new Date().toISOString(),
    };

    // si l'id change → renommer le fichier
    if (next.id !== current.id) {
      await writeFormFile(next);
      await fs.unlink(formFilePath(current.id)).catch(() => {});
    } else {
      await writeFormFile(next);
    }

    res.json(next);
  } catch (e) {
    if (e.code === "ENOENT") return res.status(404).json({ error: "Formulaire non trouvé" });
    res.status(500).json({ error: e.message });
  }
});

// SUPPRIMER
router.delete("/forms/:id", async (req, res) => {
  try {
    await fs.unlink(formFilePath(req.params.id));
    res.json({ success: true });
  } catch (e) {
    if (e.code === "ENOENT") return res.status(404).json({ error: "Formulaire non trouvé" });
    res.status(500).json({ error: e.message });
  }
});


export default router;
