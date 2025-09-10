import express from "express";
import pool from "../db.js";
import { authenticate } from "../middleware/authenticate.js";

const router = express.Router();

// GET /api/notifications/my
// GET /api/notifications/my
// GET /api/notifications/my
router.get("/my", authenticate, async (req, res) => {
  try {
    const userId = req.auth.sub; // UUID Keycloak
    console.log("🔑 Notifications pour user:", userId);

    const result = await pool.query(
      `SELECT n.id, n.note_id, n.status, n.created_at,
       no.contact_id,
       c.form_data->>'nom' AS contact_nom,
       c.form_data->>'prenom' AS contact_prenom,
       ku.username AS from_user
FROM demo_first.notifications n
JOIN demo_first.notes no ON no.id = n.note_id
JOIN demo_first.contacts c ON c.id = no.contact_id
JOIN demo_first.keycloak_users ku ON ku.id = no.utilisateur_id
WHERE n.user_id=$1 AND n.status != 'hidden'
ORDER BY n.created_at DESC
LIMIT 20
`,
      [userId]
    );

    console.log("📨 Notifs trouvées:", result.rows.length);
    res.json(result.rows);
  } catch (err) {
    console.error("❌ Erreur GET /notifications/my:", err);
    res.status(500).json({ error: err.message });
  }
});




// PATCH /api/notifications/:id/read
router.patch("/:id/read", authenticate, async (req, res) => {
  try {
    const userId = req.auth.sub;

    await pool.query(
      "UPDATE demo_first.notifications SET status='read' WHERE id=$1 AND user_id=$2",
      [req.params.id, userId]
    );

    res.json({ success: true });
  } catch (err) {
    console.error("❌ Erreur PATCH /notifications/:id/read:", err);
    res.status(500).json({ error: err.message });
  }
});



// PATCH /api/notifications/mark-all-read
// PATCH /api/notifications/mark-all-read
router.patch("/mark-all-read", authenticate, async (req, res) => {
  try {
    const userId = req.auth.sub; // ✅ corriger ici
    await pool.query(
      "UPDATE demo_first.notifications SET status='read' WHERE user_id=$1",
      [userId]
    );
    res.json({ success: true });
  } catch (err) {
    console.error("❌ Erreur PATCH /notifications/mark-all-read:", err);
    res.status(500).json({ error: err.message });
  }
});


// PATCH /api/notifications/:id/hide
// PATCH /api/notifications/:id/hide
router.patch("/:id/hide", authenticate, async (req, res) => {
  try {
    const userId = req.auth.sub; // ✅ UUID Keycloak

    await pool.query(
      "UPDATE demo_first.notifications SET status='hidden' WHERE id=$1 AND user_id=$2",
      [req.params.id, userId]
    );

    res.json({ success: true });
  } catch (err) {
    console.error("❌ Erreur PATCH /notifications/:id/hide:", err);
    res.status(500).json({ error: err.message });
  }
});



export default router
