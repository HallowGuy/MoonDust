// backend/routes/theme.js
import express from "express";
import multer from "multer";
import path, { dirname } from "path";
import { fileURLToPath } from "url";
import fs from "fs";
import fsp from "fs/promises";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const router = express.Router();

const themesPath = path.join(__dirname, "..", "themes.json");
if (!fs.existsSync(themesPath)) {
  await fsp.writeFile(themesPath, JSON.stringify({ default: {} }, null, 2), "utf8");
}
let themes = JSON.parse(fs.readFileSync(themesPath, "utf8"));
let currentTheme = "default";

// --- logo upload (always theme-logo.svg)
const logosDir = path.join(__dirname, "..", "uploads", "logo");
await fsp.mkdir(logosDir, { recursive: true });
const storageLogo = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, logosDir),
  filename: (_req, _file, cb) => cb(null, "theme-logo.svg"),
});
const uploadLogo = multer({ storage: storageLogo });

// GET /api/theme/logo
router.get("/logo", (req, res) => {
  const logoPath = path.join(logosDir, "theme-logo.svg");
  if (!fs.existsSync(logoPath)) return res.status(404).send("Logo introuvable");
  res.sendFile(logoPath);
});

// POST /api/theme/logo
router.post("/logo", uploadLogo.single("file"), (_req, res) => {
  res.json({ ok: true, url: `/api/theme/logo?t=${Date.now()}` });
});

// GET /api/theme/list
router.get("/list", (_req, res) => res.json(Object.keys(themes)));

// GET /api/theme/current
router.get("/current", (_req, res) => res.json({ current: currentTheme }));

// PUT /api/theme/current  { name }
router.put("/current", (req, res) => {
  const { name } = req.body;
  if (!themes[name]) return res.status(404).json({ error: "Thème inconnu" });
  currentTheme = name;
  res.json({ current: currentTheme });
});

// GET /api/theme/:name
router.get("/:name", (req, res) => {
  const t = themes[req.params.name];
  if (!t) return res.status(404).json({ error: "Thème introuvable" });
  res.json(t);
});

// PUT /api/theme/colors
router.put("/colors", (req, res) => {
  themes[currentTheme] = req.body || {};
  fs.writeFileSync(themesPath, JSON.stringify(themes, null, 2), "utf8");
  res.json({ ok: true, theme: themes[currentTheme] });
});

// GET /api/theme/colors
router.get("/colors", (_req, res) => res.json(themes[currentTheme]));

export default router;
