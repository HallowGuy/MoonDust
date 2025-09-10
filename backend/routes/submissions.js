import express from "express";
import pool from "../db.js";
import { authenticate } from "../middleware/authenticate.js"

const router = express.Router();

// GET toutes les soumissions d’un formulaire
router.get("/:formId", authenticate,async (req, res) => {
  const { formId } = req.params;
  try {
    
    const cleanData = { ...submission.data }
delete cleanData.submit

const { rows } = await pool.query(
  "INSERT INTO demo_first.submissions (form_id, submission_data) VALUES ($1, $2) RETURNING *",
  [formId, cleanData]
)
    res.json(rows);
  } catch (err) {
    console.error("❌ Erreur SELECT:", err);
    res.status(500).json({ error: "Erreur lors de la récupération des soumissions" });
  }
});

// POST une nouvelle soumission
// POST une nouvelle soumission
// POST une nouvelle soumission
router.post("/:formId", async (req, res) => {
  const { formId } = req.params;
  const submission = req.body;

  try {
    // ✅ Nettoyer les données
    const cleanData = { ...submission.data }
    delete cleanData.submit

    const { rows } = await pool.query(
      "INSERT INTO demo_first.submissions (form_id, submission_data) VALUES ($1, $2) RETURNING *",
      [formId, cleanData]
    );

    res.status(201).json(rows[0]);
  } catch (err) {
    console.error("❌ Erreur INSERT:", err);
    res.status(500).json({ error: "Erreur lors de l’enregistrement de la soumission" });
  }
});


export default router;
