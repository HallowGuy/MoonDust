import express from "express";
import path from "path";
import fssync from "fs";
import multer from "multer";
import { fileURLToPath } from "url";

const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const themesPath = path.join(__dirname, "../themes.json");
let themes = JSON.parse(fssync.readFileSync(themesPath, "utf8"));
let currentTheme = "default";

const storageLogo = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join(__dirname, "../uploads/logo")),
  filename: (req, file, cb) => cb(null, "theme-logo.svg"),
});
const uploadLogo = multer({ storage: storageLogo });

/**
 * @swagger
 * tags:
 *   name: Theme
 *   description: Gestion du thème et personnalisation
 */

router.use("/uploads/logo", express.static(path.join(__dirname, "../uploads/logo")));

/**
 * @swagger
 * /api/theme/logo:
 *   get:
 *     summary: Récupérer le logo actuel
 *     tags: [Theme]
 *     responses:
 *       200:
 *         description: Logo en SVG
 *       404:
 *         description: Aucun logo défini
 */
router.get("/logo", (req, res) => {
  const logoPath = path.join(__dirname, "../uploads/logo/theme-logo.svg");
  if (!fssync.existsSync(logoPath)) return res.status(404).json({ error: "Pas de logo" });
  res.sendFile(logoPath);
});

/**
 * @swagger
 * /api/theme/logo:
 *   post:
 *     summary: Mettre à jour le logo
 *     tags: [Theme]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Logo mis à jour
 */
router.post("/logo", uploadLogo.single("file"), (req, res) => {
  res.json({ ok: true, message: "Logo mis à jour", url: `/api/theme/logo?t=${Date.now()}` });
});

/**
 * @swagger
 * /api/theme/list:
 *   get:
 *     summary: Lister tous les thèmes disponibles
 *     tags: [Theme]
 *     responses:
 *       200:
 *         description: Liste des thèmes
 */
router.get("/list", (req, res) => res.json(Object.keys(themes)));

/**
 * @swagger
 * /api/theme/current:
 *   get:
 *     summary: Récupérer le thème courant
 *     tags: [Theme]
 *     responses:
 *       200:
 *         description: Thème courant
 */
router.get("/current", (req, res) => res.json({ name: currentTheme, colors: themes[currentTheme] }));

/**
 * @swagger
 * /api/theme/current:
 *   put:
 *     summary: Changer le thème courant
 *     tags: [Theme]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name: { type: string }
 *     responses:
 *       200:
 *         description: Thème mis à jour
 *       400:
 *         description: Thème inconnu
 */
router.put("/current", (req, res) => {
  const { name } = req.body;
  if (!themes[name]) return res.status(400).json({ error: "Thème inconnu" });
  currentTheme = name;
  res.json({ ok: true, theme: themes[currentTheme] });
});

/**
 * @swagger
 * /api/theme/{name}:
 *   get:
 *     summary: Récupérer un thème par son nom
 *     tags: [Theme]
 *     parameters:
 *       - in: path
 *         name: name
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Thème trouvé
 *       404:
 *         description: Thème introuvable
 */
router.get("/:name", (req, res) => {
  if (!themes[req.params.name]) return res.status(404).json({ error: "Introuvable" });
  res.json(themes[req.params.name]);
});

/**
 * @swagger
 * /api/theme/colors:
 *   put:
 *     summary: Modifier les couleurs du thème courant
 *     tags: [Theme]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Couleurs mises à jour
 */
router.put("/colors", (req, res) => {
  themes[currentTheme] = req.body;
  fssync.writeFileSync(themesPath, JSON.stringify(themes, null, 2), "utf8");
  res.json({ ok: true, theme: req.body });
});

/**
 * @swagger
 * /api/theme/colors:
 *   get:
 *     summary: Récupérer les couleurs du thème courant
 *     tags: [Theme]
 *     responses:
 *       200:
 *         description: Couleurs actuelles
 */
router.get("/colors", (req, res) => res.json(themes[currentTheme]));

export default router;
