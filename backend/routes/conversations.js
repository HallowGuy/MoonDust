import express from "express";
import jwt from "jsonwebtoken";
import pool from "../db.js";

const router = express.Router();

// --- Middleware d’auth basique ---
function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: "No token" });

  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.decode(token);
    if (!decoded) return res.status(401).json({ error: "Invalid token" });
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: "Invalid token" });
  }
}

// --- Créer une conversation entre 2 users ---
router.post("/", async (req, res) => {
  try {
    const { user1, user2 } = req.body; // UUID Keycloak (sub)

    // Vérifier si une conv existe déjà
    const existing = await pool.query(
      `
      SELECT c.id
      FROM conversations c
      JOIN conversation_participants cp1 ON c.id = cp1.conversation_id AND cp1.user_id = $1
      JOIN conversation_participants cp2 ON c.id = cp2.conversation_id AND cp2.user_id = $2
      LIMIT 1
      `,
      [user1, user2]
    );

    if (existing.rows.length) {
      return res.json(existing.rows[0]); // ✅ Retourner la conv existante
    }

    // Sinon créer
    const conv = await pool.query(
      `INSERT INTO conversations DEFAULT VALUES RETURNING *`
    );

    await pool.query(
      `INSERT INTO conversation_participants (conversation_id, user_id) VALUES ($1, $2), ($1, $3)`,
      [conv.rows[0].id, user1, user2]
    );

    res.json(conv.rows[0]);
  } catch (err) {
    console.error("❌ Erreur create conversation:", err);
    res.status(500).json({ error: "Erreur création conversation" });
  }
});

// --- Liste des conversations de l’utilisateur connecté ---
router.get("/mine", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.sub;

    const result = await pool.query(
      `
      SELECT c.id, c.created_at,
             COALESCE(array_agg(ku.username), '{}') as participants,
             COALESCE((
  SELECT COUNT(*)
  FROM messages m
  WHERE m.conversation_id = c.id
    AND m.sender_id != $1 -- ✅ exclure mes propres messages
    AND NOT EXISTS (
      SELECT 1 FROM message_reads mr
      WHERE mr.message_id = m.id
        AND mr.user_id = $1::uuid
    )
), 0) as unread_count
      FROM conversations c
      JOIN conversation_participants cp ON c.id = cp.conversation_id
      JOIN keycloak_users ku ON cp.user_id = ku.id
      WHERE cp.user_id = $1::uuid
      GROUP BY c.id, c.created_at
      ORDER BY c.created_at DESC
      `,
      [userId]
    );

    res.json(result.rows);
  } catch (err) {
    console.error("❌ Erreur /mine:", err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});


// --- Messages d’une conversation ---
router.get("/:id/messages", authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `
      SELECT m.id, m.conversation_id, m.sender_id, m.content, m.created_at,
             ku.username as sender_username
      FROM messages m
      JOIN keycloak_users ku ON m.sender_id = ku.id
      WHERE m.conversation_id = $1
      ORDER BY m.created_at ASC
      `,
      [id]
    );

    res.json(result.rows);
  } catch (err) {
    console.error("❌ Erreur get messages:", err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});


// --- Marquer une conversation comme lue ---
router.post("/:id/read", authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.sub;

    await pool.query(
      `INSERT INTO message_reads (message_id, user_id, read_at)
SELECT m.id, $2, NOW()
FROM messages m
LEFT JOIN message_reads mr
  ON mr.message_id = m.id AND mr.user_id = $2
WHERE m.conversation_id = $1 AND mr.user_id IS NULL
`,
      [id, userId]
    );

    res.json({ success: true });
  } catch (err) {
    console.error("❌ Erreur mark as read:", err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

export default router;
