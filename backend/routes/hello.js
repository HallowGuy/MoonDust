import express from "express";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Demo
 *   description: Endpoints de test
 */

router.get("/hello", (req, res) => {
  res.json({ message: "Hello depuis l’API !" });
});

export default router; // <-- très important
