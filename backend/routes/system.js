import express from "express";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: System
 *   description: Système et santé de l’API
 */

/**
 * @swagger
 * /api/system/health:
 *   get:
 *     summary: Vérifier la santé de l’API
 *     tags: [System]
 *     responses:
 *       200:
 *         description: API opérationnelle
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: ok
 */
router.get("/health", (_req, res) => {
  res.status(200).json({ status: "ok" });
});

export default router;
