import express from "express";
import pool from "../db.js";
import { authenticate } from "../middleware/authenticate.js";

const router = express.Router();

// Ajouter une note
// POST /api/notes
router.post("/", authenticate, async (req, res) => {
  try {
    const { contact_id, contenu, mentions = [] } = req.body

    // 1. Trouver l'id local de l'utilisateur connecté via son username
    const userRes = await pool.query(
      "SELECT id FROM demo_first.keycloak_users WHERE username=$1",
      [req.auth.preferred_username || req.auth.username]
    )

    if (userRes.rows.length === 0) {
      return res.status(400).json({ error: "Utilisateur non trouvé en base" })
    }

    const localUserId = userRes.rows[0].id

    // 2. Insérer la note
    const noteRes = await pool.query(
      `INSERT INTO demo_first.notes (contact_id, contenu, utilisateur_id)
       VALUES ($1,$2,$3) RETURNING id`,
      [contact_id, contenu, localUserId]
    )

    const noteId = noteRes.rows[0].id

    // 3. Pour chaque mention → créer notification
    for (const username of mentions) {
      const mentionedUserRes = await pool.query(
        "SELECT id FROM demo_first.keycloak_users WHERE username=$1",
        [username]
      )

      if (mentionedUserRes.rows.length) {
        const mentionedUserId = mentionedUserRes.rows[0].id
        await pool.query(
          `INSERT INTO demo_first.notifications (user_id, note_id, status, created_at)
           VALUES ($1,$2,'unread', NOW())`,
          [mentionedUserId, noteId]
        )
      }
    }

    // 4. Recharger la note avec le username pour la réponse
    const enrichedRes = await pool.query(
      `SELECT n.*, ku.username
       FROM demo_first.notes n
       LEFT JOIN demo_first.keycloak_users ku ON ku.id = n.utilisateur_id
       WHERE n.id = $1`,
      [noteId]
    )

    res.status(201).json(enrichedRes.rows[0])
  } catch (err) {
    console.error("❌ Erreur POST /notes:", err)
    res.status(500).json({ error: err.message })
  }
})



// Récupérer les notes d’un contact
router.get("/:contact_id", authenticate, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT n.id, n.contenu, n.created_at, n.utilisateur_id,
              ku.username,
              COALESCE(
                json_agg(
                  json_build_object(
                    'id', r.id,
                    'contenu', r.contenu,
                    'created_at', r.created_at,
                    'utilisateur_id', r.utilisateur_id,
                    'username', ru.username
                  )
                ) FILTER (WHERE r.id IS NOT NULL), '[]'
              ) AS replies
       FROM demo_first.notes n
       LEFT JOIN demo_first.keycloak_users ku ON ku.id = n.utilisateur_id
       LEFT JOIN demo_first.notes_replies r ON r.note_id = n.id
       LEFT JOIN demo_first.keycloak_users ru ON ru.id = r.utilisateur_id
       WHERE n.contact_id = $1
       GROUP BY n.id, ku.username
       ORDER BY n.created_at DESC`,
      [req.params.contact_id]
    );

    res.json(result.rows);
  } catch (err) {
    console.error("❌ Erreur GET /notes/:contact_id:", err);
    res.status(500).json({ error: err.message });
  }
});


// Mettre à jour une note
// PUT /api/notes/:id
router.put("/:id", authenticate, async (req, res) => {
  try {
    const noteId = req.params.id;
    const { contenu } = req.body;

    // Vérifier que la note existe
    const check = await pool.query(
      "SELECT * FROM demo_first.notes WHERE id=$1",
      [noteId]
    );
    if (check.rows.length === 0) {
      return res.status(404).json({ error: "Note introuvable" });
    }

    // Vérifier que l’utilisateur courant est bien le propriétaire
    if (check.rows[0].utilisateur_id !== req.auth.id) {
      return res.status(403).json({ error: "Accès interdit" });
    }

    // Mise à jour
    const updateRes = await pool.query(
      `UPDATE demo_first.notes
       SET contenu=$1
       WHERE id=$2
       RETURNING id, contact_id, contenu, utilisateur_id, created_at`,
      [contenu, noteId]
    );

    // Renvoyer enrichi avec username
    const enriched = await pool.query(
      `SELECT n.*, ku.username
       FROM demo_first.notes n
       LEFT JOIN demo_first.keycloak_users ku ON ku.id = n.utilisateur_id
       WHERE n.id=$1`,
      [noteId]
    );

    res.json(enriched.rows[0]);
  } catch (err) {
    console.error("❌ Erreur PUT /notes/:id:", err);
    res.status(500).json({ error: err.message });
  }
});


// Récupérer mes notifications
router.get("/notifications/me", authenticate, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT n.id, n.note_id, n.status, n.created_at,
       c.nom AS contact_nom, c.prenom AS contact_prenom,
       ku.username AS from_user
FROM demo_first.notifications n
JOIN demo_first.notes no ON no.id = n.note_id
JOIN demo_first.contacts c ON c.id = no.contact_id
JOIN demo_first.keycloak_users ku ON ku.id = no.utilisateur_id
WHERE n.user_id = $1
ORDER BY n.created_at DESC
LIMIT 20
`,
      [req.auth.id]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/notes/:id
// DELETE /api/notes/:id
router.delete("/:id", authenticate, async (req, res) => {
  try {
    const noteId = req.params.id;

    // Vérifier que la note existe
    const check = await pool.query(
      "SELECT * FROM demo_first.notes WHERE id=$1",
      [noteId]
    );

    if (check.rows.length === 0) {
      return res.status(404).json({ error: "Note introuvable" });
    }

    // Récupérer l'id local de l'utilisateur connecté
    const userRes = await pool.query(
      "SELECT id FROM demo_first.keycloak_users WHERE username=$1",
      [req.auth.preferred_username || req.auth.username]
    );

    if (userRes.rows.length === 0) {
      return res.status(400).json({ error: "Utilisateur non trouvé en base" });
    }

    const localUserId = userRes.rows[0].id;

    // Vérifier que la note appartient bien à l'utilisateur courant
    if (check.rows[0].utilisateur_id !== localUserId) {
      return res.status(403).json({ error: "Accès interdit" });
    }

    // Supprimer la note
    await pool.query("DELETE FROM demo_first.notes WHERE id=$1", [noteId]);

    res.status(204).send();
  } catch (err) {
    console.error("❌ Erreur DELETE /notes/:id:", err);
    res.status(500).json({ error: err.message });
  }
});


// POST /api/notes/:noteId/replies
router.post("/:noteId/replies", authenticate, async (req, res) => {
  try {
    const { contenu } = req.body;
    const noteId = req.params.noteId;

    // Récupérer utilisateur local
    const userRes = await pool.query(
      "SELECT id FROM demo_first.keycloak_users WHERE username=$1",
      [req.auth.preferred_username || req.auth.username]
    );

    if (userRes.rows.length === 0) {
      return res.status(400).json({ error: "Utilisateur non trouvé" });
    }

    const localUserId = userRes.rows[0].id;

    // Insérer la réponse
    const replyRes = await pool.query(
      `INSERT INTO demo_first.notes_replies (note_id, contenu, utilisateur_id)
       VALUES ($1,$2,$3) RETURNING id, note_id, contenu, utilisateur_id, created_at`,
      [noteId, contenu, localUserId]
    );

    // Joindre avec username
    const enriched = await pool.query(
      `SELECT r.*, ku.username 
       FROM demo_first.notes_replies r
       LEFT JOIN demo_first.keycloak_users ku ON ku.id = r.utilisateur_id
       WHERE r.id=$1`,
      [replyRes.rows[0].id]
    );

    res.status(201).json(enriched.rows[0]);
  } catch (err) {
    console.error("❌ Erreur POST /notes/:noteId/replies:", err);
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/notes/replies/:id
router.delete("/replies/:id", authenticate, async (req, res) => {
  try {
    const replyId = req.params.id;

    const check = await pool.query(
      "SELECT * FROM demo_first.notes_replies WHERE id=$1",
      [replyId]
    );

    if (check.rows.length === 0) {
      return res.status(404).json({ error: "Réponse introuvable" });
    }

    // Vérifier l'appartenance
    if (check.rows[0].utilisateur_id !== req.auth.id) {
      return res.status(403).json({ error: "Accès interdit" });
    }

    await pool.query("DELETE FROM demo_first.notes_replies WHERE id=$1", [
      replyId,
    ]);

    res.status(204).send();
  } catch (err) {
    console.error("❌ Erreur DELETE /notes/replies/:id:", err);
    res.status(500).json({ error: err.message });
  }
});


export default router;
