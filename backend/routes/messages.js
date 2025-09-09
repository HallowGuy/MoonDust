import express from "express";
import jwt from "jsonwebtoken";
import fetch from "node-fetch";
import { getAdminToken, KEYCLOAK_URL, REALM } from "../utils/keycloak.js";

const router = express.Router();
import pool from "../db.js";


// Récupérer les messages d’une conversation
router.get("/:conversationId", async (req, res) => {
  try {
    const { conversationId } = req.params;
    const result = await pool.query(
      `SELECT * FROM demo_first.messages WHERE conversation_id = $1 ORDER BY created_at ASC LIMIT 50`,
      [conversationId]
    );
    res.json(result.rows);
  } catch (err) {
    console.error("❌ Erreur get messages:", err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// Créer un message (fallback si pas de socket)
router.post("/", async (req, res) => {
  try {
    const { conversationId, senderId, content } = req.body;
    const result = await pool.query(
      `INSERT INTO demo_first.messages (conversation_id, sender_id, content) 
       VALUES ($1, $2, $3) RETURNING *`,
      [conversationId, senderId, content]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error("❌ Erreur insert message:", err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

export default router;
