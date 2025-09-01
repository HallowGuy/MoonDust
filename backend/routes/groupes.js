import express from "express";
import fetch from "node-fetch";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Groupes
 *   description: Gestion des groupes Keycloak
 */

/**
 * @swagger
 * /api/groupes:
 *   post:
 *     summary: Créer un groupe avec ses sous-groupes
 *     tags: [Groupes]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name: { type: string }
 *               subGroups:
 *                 type: array
 *                 items: { type: string }
 *     responses:
 *       201:
 *         description: Groupe créé
 */
router.post("/", async (req, res) => {
  try {
    const token = await getAdminToken();
    const { name, subGroups = [] } = req.body;
    if (!name) return res.status(400).json({ error: "Nom requis" });

    const kcRes = await fetch(`${KEYCLOAK_URL}/admin/realms/${REALM}/groups`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });
    if (!kcRes.ok) return res.status(kcRes.status).json({ error: await kcRes.text() });

    const location = kcRes.headers.get("Location");
    const groupId = location?.split("/").pop();

    for (const sg of subGroups) {
      await fetch(`${KEYCLOAK_URL}/admin/realms/${REALM}/groups/${groupId}/children`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ name: sg }),
      });
    }

    res.status(201).json({ success: true, id: groupId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * @swagger
 * /api/groupes/{id}:
 *   put:
 *     summary: Modifier un groupe
 *     tags: [Groupes]
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
 *         description: Groupe mis à jour
 */
router.put("/:id", async (req, res) => {
  try {
    const token = await getAdminToken();
    const kcRes = await fetch(`${KEYCLOAK_URL}/admin/realms/${REALM}/groups/${req.params.id}`, {
      method: "PUT",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify(req.body),
    });
    if (!kcRes.ok) throw new Error(await kcRes.text());
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * @swagger
 * /api/groupes/{id}:
 *   delete:
 *     summary: Supprimer un groupe
 *     tags: [Groupes]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Groupe supprimé
 */
router.delete("/:id", async (req, res) => {
  try {
    const token = await getAdminToken();
    const kcRes = await fetch(`${KEYCLOAK_URL}/admin/realms/${REALM}/groups/${req.params.id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!(kcRes.ok || kcRes.status === 204)) throw new Error(await kcRes.text());
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * @swagger
 * /api/groupes/{id}/users:
 *   get:
 *     summary: Récupérer les utilisateurs d’un groupe
 *     tags: [Groupes]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Liste des utilisateurs
 */
router.get("/:id/users", async (req, res) => {
  try {
    const token = await getAdminToken();
    const usersRes = await fetch(
      `${KEYCLOAK_URL}/admin/realms/${REALM}/groups/${req.params.id}/members`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    res.json(await usersRes.json());
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * @swagger
 * /api/groupes:
 *   get:
 *     summary: Lister tous les groupes
 *     tags: [Groupes]
 *     responses:
 *       200:
 *         description: Liste des groupes
 */
router.get("/", async (req, res) => {
  try {
    const token = await getAdminToken();
    const kcRes = await fetch(`${KEYCLOAK_URL}/admin/realms/${REALM}/groups`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    res.json(await kcRes.json());
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * @swagger
 * /api/groupes/{id}/subgroups:
 *   get:
 *     summary: Récupérer les sous-groupes d’un groupe
 *     tags: [Groupes]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Liste des sous-groupes
 */
router.get("/:id/subgroups", async (req, res) => {
  try {
    const token = await getAdminToken();
    const subgroupsRes = await fetch(
      `${KEYCLOAK_URL}/admin/realms/${REALM}/groups/${req.params.id}/children`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    res.json(await subgroupsRes.json());
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * @swagger
 * /api/groupes/{id}/subgroups:
 *   post:
 *     summary: Créer un sous-groupe
 *     tags: [Groupes]
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
 *               name: { type: string }
 *     responses:
 *       200:
 *         description: Sous-groupe créé
 */
router.post("/:id/subgroups", async (req, res) => {
  try {
    const token = await getAdminToken();
    const { name } = req.body;
    await fetch(`${KEYCLOAK_URL}/admin/realms/${REALM}/groups/${req.params.id}/children`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
