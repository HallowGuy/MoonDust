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

/// POST /conversations
router.post("/", authMiddleware, async (req, res) => {
  try {
    const me = String(req.user.sub)
    let participantIds = []
    let title = null

    if (Array.isArray(req.body.participant_ids)) {
      participantIds = req.body.participant_ids.map(String).filter(Boolean)
      if (!participantIds.includes(me)) participantIds.push(me)
      // uniq
      participantIds = [...new Set(participantIds)]
      title = req.body.title ?? null
    } else if (req.body.user1 && req.body.user2) {
      participantIds = [String(req.body.user1), String(req.body.user2)]
      if (!participantIds.includes(me)) participantIds.push(me)
    } else {
      return res.status(400).json({ error: "Participants manquants" })
    }

    const isGroup = participantIds.length > 2

    // Dédup 1-à-1 comme avant
    if (!isGroup) {
      const [u1, u2] = participantIds
      const existing = await pool.query(
        `
        SELECT c.id
        FROM demo_first.conversations c
        JOIN demo_first.conversation_participants cp1 ON c.id = cp1.conversation_id AND cp1.user_id = $1
        JOIN demo_first.conversation_participants cp2 ON c.id = cp2.conversation_id AND cp2.user_id = $2
        LIMIT 1
        `,
        [u1, u2]
      )
      if (existing.rows.length) return res.json(existing.rows[0])
    }

    // Crée la conversation
    const conv = await pool.query(
      `INSERT INTO demo_first.conversations (is_group, title)
       VALUES ($1, $2) RETURNING *`,
      [isGroup, title]
    )

    // Participants
    const values = participantIds.map((_, i) => `($1, $${i + 2})`).join(",")
    await pool.query(
      `INSERT INTO demo_first.conversation_participants (conversation_id, user_id)
       VALUES ${values}`,
      [conv.rows[0].id, ...participantIds]
    )

    res.json(conv.rows[0])
  } catch (err) {
    console.error("❌ Erreur create conversation:", err)
    res.status(500).json({ error: "Erreur création conversation" })
  }
})


// --- Liste des conversations de l’utilisateur connecté ---
router.get("/mine", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.sub

    const result = await pool.query(
      `
      SELECT 
        c.id,
        c.created_at,
        c.is_group,
        c.title,
        COALESCE(
          json_agg(json_build_object('id', ku.id, 'username', ku.username))
            FILTER (WHERE ku.id IS NOT NULL),
          '[]'
        ) AS participants,
        COALESCE((
          SELECT COUNT(*)
          FROM demo_first.messages m
          WHERE m.conversation_id = c.id
            AND m.sender_id != $1
            AND NOT EXISTS (
              SELECT 1 FROM demo_first.message_reads mr
              WHERE mr.message_id = m.id AND mr.user_id = $1::uuid
            )
        ), 0) AS unread_count,
        (
          SELECT row_to_json(m2)
          FROM (
            SELECT m.id, m.content, m.created_at, ku.username AS sender_username
            FROM demo_first.messages m
            JOIN demo_first.keycloak_users ku ON m.sender_id = ku.id
            WHERE m.conversation_id = c.id
            ORDER BY m.created_at DESC
            LIMIT 1
          ) m2
        ) AS last_message
      FROM demo_first.conversations c
      JOIN demo_first.conversation_participants cp ON c.id = cp.conversation_id
      JOIN demo_first.keycloak_users ku ON cp.user_id = ku.id
      WHERE c.id IN (
        SELECT conversation_id FROM demo_first.conversation_participants WHERE user_id = $1::uuid
      )
      GROUP BY c.id, c.created_at, c.is_group, c.title
      ORDER BY COALESCE(
        (SELECT m.created_at FROM demo_first.messages m WHERE m.conversation_id = c.id ORDER BY m.created_at DESC LIMIT 1),
        c.created_at
      ) DESC
      `,
      [userId]
    )

    res.json(result.rows)
  } catch (err) {
    console.error("❌ Erreur /mine:", err)
    res.status(500).json({ error: "Erreur serveur" })
  }
})



// --- Messages d’une conversation ---
router.get("/:id/messages", authMiddleware, async (req, res) => {
  try {
    const { id } = req.params        // conversation_id
    const me = req.user.sub

    const result = await pool.query(
      `
      WITH parts AS (
        SELECT cp.user_id
        FROM demo_first.conversation_participants cp
        WHERE cp.conversation_id = $1
      ),
      recipients AS (
        SELECT user_id FROM parts WHERE user_id <> $2
      )
      SELECT
        m.id,
        m.conversation_id,
        m.sender_id,
        m.content,
        m.created_at,
        ku.username AS sender_username,

        -- moi j'ai lu ?
        EXISTS (
          SELECT 1 FROM demo_first.message_reads mr
          WHERE mr.message_id = m.id AND mr.user_id = $2::uuid
        ) AS read_by_me,

        -- qui a lu (hors expéditeur)
        COALESCE(
          ARRAY(
            SELECT mr.user_id
            FROM demo_first.message_reads mr
            WHERE mr.message_id = m.id
              AND mr.user_id <> m.sender_id
          ),
          '{}'::uuid[]
        ) AS seen_by_ids,

        -- compte combien ont lu (hors expéditeur)
        (
          SELECT COUNT(*)
          FROM demo_first.message_reads mr
          WHERE mr.message_id = m.id
            AND mr.user_id <> m.sender_id
        ) AS read_count,

        -- destinataires (participants hors expéditeur)
        (
          SELECT COUNT(*) FROM recipients
        ) AS recipient_count

      FROM demo_first.messages m
      JOIN demo_first.keycloak_users ku ON m.sender_id = ku.id
      WHERE m.conversation_id = $1
      ORDER BY m.created_at ASC
      `,
      [id, me]
    )

    res.json(result.rows)
  } catch (err) {
    console.error("❌ Erreur get messages:", err)
    res.status(500).json({ error: "Erreur serveur" })
  }
})



// --- Marquer une conversation comme lue ---
router.post("/:id/read", authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.sub;

    await pool.query(
      `INSERT INTO demo_first.message_reads (message_id, user_id, read_at)
SELECT m.id, $2, NOW()
FROM demo_first.messages m
LEFT JOIN demo_first.message_reads mr
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


// GET /conversations/:id/summary
router.get("/:id/summary", authMiddleware, async (req, res) => {
  try {
    const convId = req.params.id
    const me = req.user.sub

    // must be participant
    const chk = await pool.query(
      `SELECT 1 FROM demo_first.conversation_participants
       WHERE conversation_id = $1 AND user_id = $2 LIMIT 1`,
      [convId, me]
    )
    if (!chk.rows.length) return res.status(403).json({ error: "Forbidden" })

    const meta = await pool.query(
      `SELECT c.id, c.created_at, c.is_group, c.title
       FROM demo_first.conversations c
       WHERE c.id = $1`,
      [convId]
    )
    if (!meta.rows.length) return res.status(404).json({ error: "Not found" })

    const participants = await pool.query(
      `SELECT ku.id, ku.username
       FROM demo_first.conversation_participants cp
       JOIN demo_first.keycloak_users ku ON ku.id = cp.user_id
       WHERE cp.conversation_id = $1
       ORDER BY ku.username ASC`,
      [convId]
    )

    const counts = await pool.query(
      `SELECT
         (SELECT COUNT(*) FROM demo_first.messages m WHERE m.conversation_id = $1) AS messages_count,
         (SELECT COUNT(*) FROM demo_first.conversation_participants cp WHERE cp.conversation_id = $1) AS participants_count,
         (SELECT MAX(m.created_at) FROM demo_first.messages m WHERE m.conversation_id = $1) AS last_message_at`,
      [convId]
    )

    res.json({
      ...meta.rows[0],
      participants: participants.rows,
      ...counts.rows[0],
    })
  } catch (err) {
    console.error("❌ Erreur summary:", err)
    res.status(500).json({ error: "Erreur serveur" })
  }
})


// DELETE /conversations/:id
router.delete("/:id", authMiddleware, async (req, res) => {
  const client = await pool.connect()
  try {
    const convId = req.params.id
    const me = req.user.sub

    // Vérifier que je suis participant
    const chk = await client.query(
      `SELECT 1 FROM demo_first.conversation_participants
       WHERE conversation_id = $1 AND user_id = $2 LIMIT 1`,
      [convId, me]
    )
    if (!chk.rows.length) {
      return res.status(403).json({ error: "Forbidden" })
    }

    await client.query("BEGIN")

    // Si pas de FK ON DELETE CASCADE, on nettoie manuellement :
    await client.query(
      `DELETE FROM demo_first.message_reads
       WHERE message_id IN (SELECT id FROM demo_first.messages WHERE conversation_id = $1)`,
      [convId]
    )
    await client.query(`DELETE FROM demo_first.messages WHERE conversation_id = $1`, [convId])
    await client.query(`DELETE FROM demo_first.conversation_participants WHERE conversation_id = $1`, [convId])
    await client.query(`DELETE FROM demo_first.conversations WHERE id = $1`, [convId])

    await client.query("COMMIT")
    res.json({ success: true })
  } catch (err) {
    await client.query("ROLLBACK")
    console.error("❌ Erreur delete conversation:", err)
    res.status(500).json({ error: "Erreur serveur" })
  } finally {
    client.release()
  }
})




export default router;
