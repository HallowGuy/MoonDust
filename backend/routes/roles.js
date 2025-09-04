// backend/routes/roles.js
import express from "express";
import fetch from "node-fetch";
import { getAdminToken, KEYCLOAK_URL, REALM } from "../utils/keycloak.js";

const router = express.Router();

// GET /api/roles
router.get("/", async (_req, res) => {
  try {
    const token = await getAdminToken();
    const r = await fetch(`${KEYCLOAK_URL}/admin/realms/${REALM}/roles`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!r.ok) throw new Error(`Keycloak ${r.status}`);
    res.json(await r.json());
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// GET /api/roles/count
router.get("/count", async (_req, res) => {
  try {
    const token = await getAdminToken();
    const r = await fetch(`${KEYCLOAK_URL}/admin/realms/${REALM}/roles`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!r.ok) throw new Error(`Keycloak ${r.status}`);
    const roles = await r.json();
    res.json({ count: roles.length });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// POST /api/roles
router.post("/", async (req, res) => {
  try {
    const token = await getAdminToken();
    const r = await fetch(`${KEYCLOAK_URL}/admin/realms/${REALM}/roles`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({ name: req.body.name, description: req.body.description || "" }),
    });
    if (!r.ok) {
      const t = await r.text();
      throw new Error(`Keycloak ${r.status}: ${t}`);
    }
    res.status(201).json({ ok: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// PUT /api/roles/:name
router.put("/:name", async (req, res) => {
  try {
    const token = await getAdminToken();
    const r = await fetch(`${KEYCLOAK_URL}/admin/realms/${REALM}/roles/${encodeURIComponent(req.params.name)}`, {
      method: "PUT",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({ name: req.params.name, description: req.body.description || "" }),
    });
    if (!r.ok) {
      const t = await r.text();
      throw new Error(`Keycloak ${r.status}: ${t}`);
    }
    res.status(204).send();
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// DELETE /api/roles/:name
router.delete("/:name", async (req, res) => {
  try {
    const token = await getAdminToken();
    const r = await fetch(`${KEYCLOAK_URL}/admin/realms/${REALM}/roles/${encodeURIComponent(req.params.name)}`, {
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

// GET /api/roles/:roleName/users
router.get("/:roleName/users", async (req, res) => {
  try {
    const token = await getAdminToken();
    const r = await fetch(`${KEYCLOAK_URL}/admin/realms/${REALM}/roles/${encodeURIComponent(req.params.roleName)}/users`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!r.ok) throw new Error(`Keycloak ${r.status}`);
    res.json(await r.json());
  } catch (e) { res.status(500).json({ error: e.message }); }
});

export default router;
