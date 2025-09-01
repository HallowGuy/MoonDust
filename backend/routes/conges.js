import express from "express";
import pool from "../db.js";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Conges
 *   description: Gestion des demandes de congés
 */

/**
 * @swagger
 * /api/conges:
 *   get:
 *     summary: Liste toutes les demandes de congés
 *     tags: [Conges]
 *     responses:
 *       200:
 *         description: Liste des congés
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 */
router.get("/", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM demo_first.leave_requests ORDER BY created_at DESC;"
    );
    res.json(result.rows);
  } catch (e) {
    res.status(500).json({ error: "Erreur serveur" });
  }
});

/**
 * @swagger
 * /api/conges:
 *   post:
 *     summary: Créer une nouvelle demande de congé
 *     tags: [Conges]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name: { type: string }
 *               email: { type: string }
 *               start_date: { type: string, format: date }
 *               end_date: { type: string, format: date }
 *               reason: { type: string }
 *     responses:
 *       201:
 *         description: Congé créé
 */
router.post("/", async (req, res) => {
  try {
    const { name, email, start_date, end_date, reason } = req.body;
    const { rows } = await pool.query(
      `INSERT INTO demo_first.leave_requests 
       (name, email, start_date, end_date, reason, status, created_at, updated_at) 
       VALUES ($1,$2,$3,$4,$5,'EN ATTENTE',NOW(),NOW()) RETURNING *`,
      [name, email, start_date, end_date, reason]
    );
    res.status(201).json(rows[0]);
  } catch {
    res.status(500).json({ error: "Erreur serveur" });
  }
});

/**
 * @swagger
 * /api/conges/{id}/status:
 *   put:
 *     summary: Mettre à jour le statut d'une demande de congé
 *     tags: [Conges]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status: { type: string, enum: [APPROUVÉ, REJETÉ, EN ATTENTE] }
 *     responses:
 *       200:
 *         description: Statut mis à jour
 *       404:
 *         description: Congé introuvable
 */
router.put("/:id/status", async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const { rows } = await pool.query(
      `UPDATE demo_first.leave_requests SET status=$1, updated_at=NOW() WHERE id=$2 RETURNING *`,
      [status, id]
    );
    if (rows.length === 0) return res.status(404).json({ error: "Introuvable" });
    res.json(rows[0]);
  } catch {
    res.status(500).json({ error: "Erreur serveur" });
  }
});

/**
 * @swagger
 * /api/conges/{id}:
 *   get:
 *     summary: Récupérer une demande de congé par ID
 *     tags: [Conges]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Détails du congé
 *       404:
 *         description: Introuvable
 */
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { rows } = await pool.query(
      "SELECT * FROM demo_first.leave_requests WHERE id=$1",
      [id]
    );
    if (rows.length === 0) return res.status(404).json({ error: "Introuvable" });
    res.json(rows[0]);
  } catch {
    res.status(500).json({ error: "Erreur serveur" });
  }
});

export default router;
