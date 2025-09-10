// backend/routes/users.js
import express from "express";
import fetch from "node-fetch";
import jwt from "jsonwebtoken";
import { getAdminToken, KEYCLOAK_URL, REALM } from "../utils/keycloak.js";


const router = express.Router();

// GET /api/users
router.get("/", async (_req, res) => {
  try {
    const token = await getAdminToken();
    const r = await fetch(`${KEYCLOAK_URL}/admin/realms/${REALM}/users`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!r.ok) throw new Error(`Keycloak ${r.status}`);
    res.json(await r.json());
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// GET /api/users/count
router.get("/count", async (_req, res) => {
  try {
    const token = await getAdminToken();
    const r = await fetch(`${KEYCLOAK_URL}/admin/realms/${REALM}/users/count`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!r.ok) throw new Error(`Keycloak ${r.status}`);
    res.json({ count: await r.json() });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// GET /api/users/active (approx: compte les enabled)
router.get("/active", async (_req, res) => {
  try {
    const token = await getAdminToken();
    const r = await fetch(`${KEYCLOAK_URL}/admin/realms/${REALM}/users?max=2000`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!r.ok) throw new Error(`Keycloak ${r.status}`);
    const users = await r.json();
    res.json({ active: users.filter(u => u.enabled).length });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// POST /api/users
router.post("/", async (req, res) => {
  try {
    const token = await getAdminToken();
    const payload = {
      username: req.body.username,
      email: req.body.email,
      firstName: req.body.firstName || "",
      lastName: req.body.lastName || "",
      enabled: true,
      emailVerified: true,
      credentials: [{
        type: "password",
        value: req.body.password || "TempPass123!",
        temporary: true,
      }],
    };
    const r = await fetch(`${KEYCLOAK_URL}/admin/realms/${REALM}/users`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!r.ok) {
      const t = await r.text();
      throw new Error(`Keycloak ${r.status}: ${t}`);
    }
    res.status(201).json({ ok: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// PUT /api/users/:id
router.put("/:id", async (req, res) => {
  try {
    const token = await getAdminToken();
    const r = await fetch(`${KEYCLOAK_URL}/admin/realms/${REALM}/users/${req.params.id}`, {
      method: "PUT",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify(req.body),
    });
    if (!r.ok) {
      const t = await r.text();
      throw new Error(`Keycloak ${r.status}: ${t}`);
    }
    res.status(204).send();
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// DELETE /api/users/:id
router.delete("/:id", async (req, res) => {
  try {
    const token = await getAdminToken();
    const r = await fetch(`${KEYCLOAK_URL}/admin/realms/${REALM}/users/${req.params.id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!r.ok) {
      const t = await r.text();
      throw new Error(`Keycloak ${r.status}: ${t}`);
    }
    res.status(204).send();
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// GET /api/users/:id/roles
router.get("/:id/roles", async (req, res) => {
  try {
    const token = await getAdminToken();
    const r = await fetch(`${KEYCLOAK_URL}/admin/realms/${REALM}/users/${req.params.id}/role-mappings/realm`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!r.ok) throw new Error(`Keycloak ${r.status}`);
    res.json(await r.json());
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// GET /api/me/roles  (depuis le token utilisateur)
router.get("/me/roles", async (req, res) => {
  try {
    const auth = req.headers.authorization;
    if (!auth) return res.status(401).json({ error: "Token manquant" });
    const tokenUser = auth.split(" ")[1];
    const decoded = jwt.decode(tokenUser);
    if (!decoded?.sub) return res.status(401).json({ error: "Token invalide" });

    const admin = await getAdminToken();
    const r = await fetch(`${KEYCLOAK_URL}/admin/realms/${REALM}/users/${decoded.sub}/role-mappings/realm`, {
      headers: { Authorization: `Bearer ${admin}` },
    });
    if (!r.ok) throw new Error(`Keycloak ${r.status}`);
    const roles = await r.json();
    res.json({ roles: roles.map(r => r.name) });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// POST /api/users/:id/roles (assigne/remplace)
router.post("/:id/roles", async (req, res) => {
  try {
    const roles = req.body;
    if (!Array.isArray(roles)) return res.status(400).json({ error: "roles (array) requis" });
    const token = await getAdminToken();
    const r = await fetch(`${KEYCLOAK_URL}/admin/realms/${REALM}/users/${req.params.id}/role-mappings/realm`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify(roles),
    });
    if (!r.ok) {
      const t = await r.text();
      throw new Error(`Keycloak ${r.status}: ${t}`);
    }
    res.json({ success: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// DELETE /api/users/:id/roles (retire plusieurs)
router.delete("/:id/roles", async (req, res) => {
  try {
    const roles = req.body;
    if (!Array.isArray(roles) || roles.length === 0) {
      return res.status(400).json({ error: "roles (array) requis" });
    }
    const token = await getAdminToken();
    const r = await fetch(`${KEYCLOAK_URL}/admin/realms/${REALM}/users/${req.params.id}/role-mappings/realm`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify(roles),
    });
    if (!r.ok) {
      const t = await r.text();
      throw new Error(`Keycloak ${r.status}: ${t}`);
    }
    res.status(204).send();
  } catch (e) { res.status(500).json({ error: e.message }); }
});


// POST /api/users/:id/send-initial-email
router.post("/:id/send-initial-email", async (req, res) => {
  try {
    const userId = req.params.id;
    const token = await getAdminToken();

    // Appel API Keycloak pour envoyer l’email
    const r = await fetch(
      `${KEYCLOAK_URL}/admin/realms/${REALM}/users/${userId}/execute-actions-email`,
      {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        // Keycloak va envoyer un mail avec ce type d’action
        body: JSON.stringify(["UPDATE_PASSWORD"]),
      }
    );

    if (!r.ok) {
      const t = await r.text();
      throw new Error(`Keycloak ${r.status}: ${t}`);
    }

    res.json({ message: "Email d’initialisation envoyé par Keycloak" });
  } catch (err) {
    console.error("❌ Erreur envoi email init:", err);
    res.status(500).json({ error: "Impossible d’envoyer l’email d’initialisation" });
  }
});


export default router;
