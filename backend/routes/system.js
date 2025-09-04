// backend/routes/system.js
import express from "express";
import dotenv from "dotenv";
dotenv.config();

const router = express.Router();

// GET /api/realm
router.get("/realm", (_req, res) => {
  res.json({ realm: process.env.REALM });
});

export default router;
