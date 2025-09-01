import express from "express";
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const CONFIG_FILE = path.join(__dirname, "../routes-config.json");

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Config
 *   description: Gestion de la configuration des routes
 */

// --- GET config ---
/**
 * @swagger
 * /api/config:
 *   get:
 *     summary: Récupérer la configuration actuelle
 *     tags: [Config]
 *     responses:
 *       200:
 *         description: La configuration actuelle
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 */
router.get("/", async (req, res) => {
  try {
    const config = await getConfig();
    res.json(config);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- POST config ---
/**
 * @swagger
 * /api/config:
 *   post:
 *     summary: Sauvegarder une nouvelle configuration
 *     tags: [Config]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Confirmation de sauvegarde
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 */
router.post("/", async (req, res) => {
  try {
    await setConfig(req.body);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- Fonctions utilitaires ---
async function getConfig() {
  try {
    const data = await fs.readFile(CONFIG_FILE, "utf-8");
    return JSON.parse(data);
  } catch {
    return {};
  }
}

async function setConfig(config) {
  await fs.writeFile(CONFIG_FILE, JSON.stringify(config, null, 2), "utf-8");
}

export default router;
