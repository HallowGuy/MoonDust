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

// --- COUNT (routes) ---
// GET /routes-config/count
// Params optionnels :
// - pattern=...  -> filtre sur le path (contains, insensible à la casse)
// - role=...     -> ne compte que les routes contenant ce rôle (format map)
// - exclude=...  -> liste de paths à exclure (ex: "*,/health"), PAR DÉFAUT: rien
// - uniqueBy=... -> utilisé seulement pour le format imbriqué (path|name|id)
// - enabled=true -> utilisé seulement pour le format imbriqué (ignore enabled === false)
router.get('/routes-config/count', async (req, res) => {
  try {
    const cfg = await readJson(ROUTES_CONFIG, {})

    const pattern = (req.query.pattern || '').toString().toLowerCase().trim()
    const roleQ   = (req.query.role || '').toString().toLowerCase().trim()
    const excludeList = (req.query.exclude || '')  // 👈 plus de '*' par défaut
      .toString()
      .split(',')
      .map(s => s.trim())
      .filter(Boolean)

    // --- CAS 1 : map { "/path": ["role", ...] } ou { "/path": { roles: [...] } }
    const isMap = cfg && typeof cfg === 'object' && !Array.isArray(cfg) &&
      Object.values(cfg).every(v => Array.isArray(v) || (v && typeof v === 'object'))

    if (isMap) {
      let entries = Object.entries(cfg).map(([path, v]) => {
        const roles = Array.isArray(v) ? v : (Array.isArray(v?.roles) ? v.roles : [])
        return { path, roles }
      })

      if (excludeList.length) {
        const ex = new Set(excludeList)
        entries = entries.filter(e => !ex.has(e.path))
      }

      if (pattern) {
        entries = entries.filter(e => e.path.toLowerCase().includes(pattern))
      }

      if (roleQ) {
        entries = entries.filter(e =>
          (e.roles || [])
            .map(r => String(r).toLowerCase())
            .includes(roleQ)
        )
      }

      return res.json({ count: entries.length }) // 👈 compte brut des clés, "*" inclus si non exclu
    }

    // --- CAS 2 : config imbriquée [{ path, name, children, ... }]
    const uniqueBy = (req.query.uniqueBy || 'path').toString()
    const mustBeEnabled = req.query.enabled === 'true'
    const seen = new Set()
    let count = 0
    const ex = new Set(excludeList)

    const pushIfRoute = (node) => {
      if (!node || typeof node !== 'object') return
      const path = typeof node.path === 'string' ? node.path : ''
      const name = typeof node.name === 'string' ? node.name : ''
      const id   = node.id != null ? String(node.id) : ''
      if (!path && !name) return
      if (ex.has(path)) return
      if (mustBeEnabled && node.enabled === false) return

      const key = uniqueBy === 'name' ? name : uniqueBy === 'id' ? id : (path || name)
      if (!key || seen.has(key)) return

      if (pattern) {
        const hay = `${path} ${name}`.toLowerCase()
        if (!hay.includes(pattern)) return
      }
      seen.add(key)
      count++
    }

    const walk = (n) => {
      if (!n) return
      if (Array.isArray(n)) return n.forEach(walk)
      if (typeof n === 'object') {
        pushIfRoute(n)
        if (Array.isArray(n.children)) walk(n.children)
        if (Array.isArray(n.routes)) walk(n.routes)
        Object.values(n).forEach((v) => { if (v && typeof v === 'object') walk(v) })
      }
    }
    walk(cfg)

    res.json({ count })
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})



router.post("/routes-config", async (req, res) => {
  try { await writeJson(ROUTES_CONFIG, req.body || {}); res.json({ success: true }); }
  catch (e) { res.status(500).json({ error: e.message }); }
});

// ===== actions-config =====
router.get("/actions-config", async (_req, res) => {
  try { res.json(await readJson(ACTIONS_CONFIG, {})); }
  catch (e) { res.status(500).json({ error: e.message }); }
});

// --- COUNT (actions) ---
router.get('/actions-config/count', async (req, res) => {
  try {
    const cfg = await readJson(ACTIONS_CONFIG, {})
    // normalise en tableau [{id, ...props}]
    const entries = Array.isArray(cfg)
      ? cfg
      : Object.entries(cfg || {}).map(([id, v]) => ({ id, ...(v || {}) }))

    const thematique = (req.query.thematique || '').toString().toLowerCase().trim()
    const role = (req.query.role || '').toString().toLowerCase().trim()

    let items = entries

    if (thematique) {
      items = items.filter((it) => String(it.thematique || 'Autre').toLowerCase() === thematique)
    }
    if (role) {
      const roles = (Array.isArray(items?.roles) ? items.roles : items?.roles) // sécurité
      items = items.filter(
        (it) =>
          Array.isArray(it.roles) &&
          it.roles.map((r) => String(r).toLowerCase()).includes(role)
      )
    }

    res.json({ count: items.length })
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})


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



export default router;
