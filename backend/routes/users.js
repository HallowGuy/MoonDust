import express from "express";
import fetch from "node-fetch";
import jwt from "jsonwebtoken";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: Gestion des utilisateurs Keycloak
 */

/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: Lister tous les utilisateurs
 *     tags: [Users]
 *     responses:
 *       200:
 *         description: Liste des utilisateurs
 */
router.get("/", async (req, res) => {
  try {
    const token = await getAdminToken();
    const usersRes = await fetch(`${KEYCLOAK_URL}/admin/realms/${REALM}/users`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    res.json(await usersRes.json());
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * @swagger
 * /api/users:
 *   post:
 *     summary: Créer un utilisateur
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username: { type: string }
 *               email: { type: string }
 *               firstName: { type: string }
 *               lastName: { type: string }
 *               password: { type: string }
 *     responses:
 *       201:
 *         description: Utilisateur créé
 */
router.post("/", async (req, res) => {
  try {
    const token = await getAdminToken();
    const newUser = {
      username: req.body.username,
      email: req.body.email,
      firstName: req.body.firstName || "",
      lastName: req.body.lastName || "",
      enabled: true,
      emailVerified: true,
      credentials: [
        { type: "password", value: req.body.password || "TempPass123!", temporary: true },
      ],
    };
    const createRes = await fetch(`${KEYCLOAK_URL}/admin/realms/${REALM}/users`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify(newUser),
    });
    if (!createRes.ok) throw new Error(await createRes.text());
    res.status(201).json({ message: "Utilisateur créé" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * @swagger
 * /api/users/{id}:
 *   put:
 *     summary: Mettre à jour un utilisateur
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Utilisateur mis à jour
 */
router.put("/:id", async (req, res) => {
  try {
    const token = await getAdminToken();
    await fetch(`${KEYCLOAK_URL}/admin/realms/${REALM}/users/${req.params.id}`, {
      method: "PUT",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify(req.body),
    });
    res.json({ message: "Utilisateur mis à jour" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * @swagger
 * /api/users/{id}:
 *   delete:
 *     summary: Supprimer un utilisateur
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       204:
 *         description: Utilisateur supprimé
 */
router.delete("/:id", async (req, res) => {
  try {
    const token = await getAdminToken();
    await fetch(`${KEYCLOAK_URL}/admin/realms/${REALM}/users/${req.params.id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * @swagger
 * /api/users/{id}/roles:
 *   get:
 *     summary: Récupérer les rôles d’un utilisateur
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Liste des rôles
 */
router.get("/:id/roles", async (req, res) => {
  try {
    const token = await getAdminToken();
    const rolesRes = await fetch(
      `${KEYCLOAK_URL}/admin/realms/${REALM}/users/${req.params.id}/role-mappings/realm`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    res.json(await rolesRes.json());
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * @swagger
 * /api/users/me/roles:
 *   get:
 *     summary: Récupérer mes rôles (depuis le token)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Liste des rôles de l’utilisateur connecté
 *       401:
 *         description: Token manquant ou invalide
 */
router.get("/me/roles", async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ error: "Token manquant" });

    const tokenUser = authHeader.split(" ")[1];
    const decoded = jwt.decode(tokenUser);
    if (!decoded?.sub) return res.status(401).json({ error: "Token invalide" });

    const userId = decoded.sub;
    const tokenAdmin = await getAdminToken();
    const rolesRes = await fetch(
      `${KEYCLOAK_URL}/admin/realms/${REALM}/users/${userId}/role-mappings/realm`,
      { headers: { Authorization: `Bearer ${tokenAdmin}` } }
    );
    const roles = await rolesRes.json();
    res.json({ roles: roles.map((r) => r.name) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * @swagger
 * /api/users/{id}/roles:
 *   post:
 *     summary: Assigner des rôles à un utilisateur
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               roles:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     id: { type: string }
 *                     name: { type: string }
 *     responses:
 *       200:
 *         description: Rôles assignés
 */
router.post("/:id/roles", async (req, res) => {
  try {
    const token = await getAdminToken();
    await fetch(`${KEYCLOAK_URL}/admin/realms/${REALM}/users/${req.params.id}/role-mappings/realm`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify(req.body.roles),
    });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * @swagger
 * /api/users/{id}/roles:
 *   delete:
 *     summary: Supprimer des rôles d’un utilisateur
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               roles:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     id: { type: string }
 *                     name: { type: string }
 *     responses:
 *       204:
 *         description: Rôles supprimés
 */
router.delete("/:id/roles", async (req, res) => {
  try {
    const token = await getAdminToken();
    await fetch(`${KEYCLOAK_URL}/admin/realms/${REALM}/users/${req.params.id}/role-mappings/realm`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify(req.body.roles),
    });
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
