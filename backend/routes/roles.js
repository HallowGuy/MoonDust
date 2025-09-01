import express from "express";
import fetch from "node-fetch";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Roles
 *   description: Gestion des rôles Keycloak
 */

/**
 * @swagger
 * /api/roles:
 *   get:
 *     summary: Lister tous les rôles
 *     tags: [Roles]
 *     responses:
 *       200:
 *         description: Liste des rôles
 */
router.get("/", async (req, res) => {
  try {
    const token = await getAdminToken();
    const rolesRes = await fetch(`${KEYCLOAK_URL}/admin/realms/${REALM}/roles`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    res.json(await rolesRes.json());
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * @swagger
 * /api/roles:
 *   post:
 *     summary: Créer un rôle
 *     tags: [Roles]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name: { type: string }
 *               description: { type: string }
 *     responses:
 *       201:
 *         description: Rôle créé
 */
router.post("/", async (req, res) => {
  try {
    const token = await getAdminToken();
    await fetch(`${KEYCLOAK_URL}/admin/realms/${REALM}/roles`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify(req.body),
    });
    res.status(201).json({ message: "Rôle créé" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * @swagger
 * /api/roles/{name}:
 *   put:
 *     summary: Mettre à jour un rôle
 *     tags: [Roles]
 *     parameters:
 *       - in: path
 *         name: name
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               description: { type: string }
 *     responses:
 *       200:
 *         description: Rôle mis à jour
 */
router.put("/:name", async (req, res) => {
  try {
    const token = await getAdminToken();
    await fetch(`${KEYCLOAK_URL}/admin/realms/${REALM}/roles/${req.params.name}`, {
      method: "PUT",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify(req.body),
    });
    res.json({ message: "Rôle mis à jour" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * @swagger
 * /api/roles/{name}:
 *   delete:
 *     summary: Supprimer un rôle
 *     tags: [Roles]
 *     parameters:
 *       - in: path
 *         name: name
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       204:
 *         description: Rôle supprimé
 */
router.delete("/:name", async (req, res) => {
  try {
    const token = await getAdminToken();
    await fetch(`${KEYCLOAK_URL}/admin/realms/${REALM}/roles/${req.params.name}`, {
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
 * /api/roles/{roleName}/users:
 *   get:
 *     summary: Récupérer les utilisateurs associés à un rôle
 *     tags: [Roles]
 *     parameters:
 *       - in: path
 *         name: roleName
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Liste des utilisateurs du rôle
 */
router.get("/:roleName/users", async (req, res) => {
  try {
    const token = await getAdminToken();
    const usersRes = await fetch(
      `${KEYCLOAK_URL}/admin/realms/${REALM}/roles/${req.params.roleName}/users`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    res.json(await usersRes.json());
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
