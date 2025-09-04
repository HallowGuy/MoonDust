// backend/routes/groupes.js
import express from "express";
import fetch from "node-fetch";
import { getAdminToken, KEYCLOAK_URL, REALM } from "../utils/keycloak.js";

const router = express.Router();

async function countSubGroups(groups, token) {
  let total = 0;
  for (const g of groups) {
    const r = await fetch(`${KEYCLOAK_URL}/admin/realms/${REALM}/groups/${g.id}/children`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (r.ok) {
      const children = await r.json();
      total += children.length;
      total += await countSubGroups(children, token);
    }
  }
  return total;
}

// GET /api/groupes/stats
router.get("/stats", async (_req, res) => {
  try {
    const token = await getAdminToken();
    const r = await fetch(`${KEYCLOAK_URL}/admin/realms/${REALM}/groups`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!r.ok) throw new Error(`Keycloak ${r.status}`);
    const groups = await r.json();
    const subGroups = await countSubGroups(groups, token);
    res.json({ groups: groups.length, subGroups });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// GET /api/groupes
router.get("/", async (_req, res) => {
  try {
    const token = await getAdminToken();
    const r = await fetch(`${KEYCLOAK_URL}/admin/realms/${REALM}/groups`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!r.ok) throw new Error(`Keycloak ${r.status}`);
    res.json(await r.json());
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// POST /api/groupes   { name, subGroups?: string[] }
router.post("/", async (req, res) => {
  try {
    const token = await getAdminToken();
    const { name, subGroups = [] } = req.body;
    if (!name) return res.status(400).json({ error: "Le nom du groupe est requis" });

    // 1) créer le groupe
    const create = await fetch(`${KEYCLOAK_URL}/admin/realms/${REALM}/groups`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });
    if (!create.ok) throw new Error(`Keycloak create group ${create.status}: ${await create.text()}`);

    // 2) retrouver le groupe créé pour pousser les enfants
    const list = await fetch(`${KEYCLOAK_URL}/admin/realms/${REALM}/groups?search=${encodeURIComponent(name)}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const arr = await list.json();
    const parent = arr.find(g => g.name === name);
    if (parent && Array.isArray(subGroups) && subGroups.length) {
      for (const childName of subGroups) {
        await fetch(`${KEYCLOAK_URL}/admin/realms/${REALM}/groups/${parent.id}/children`, {
          method: "POST",
          headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
          body: JSON.stringify({ name: childName }),
        });
      }
    }
    res.status(201).json({ ok: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// PUT /api/groupes/:id
router.put("/:id", async (req, res) => {
  try {
    const token = await getAdminToken();
    const r = await fetch(`${KEYCLOAK_URL}/admin/realms/${REALM}/groups/${req.params.id}`, {
      method: "PUT",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({ name: req.body.name }),
    });
    if (!r.ok) throw new Error(`Keycloak ${r.status}: ${await r.text()}`);
    res.status(204).send();
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// DELETE /api/groupes/:id
router.delete("/:id", async (req, res) => {
  try {
    const token = await getAdminToken();
    const r = await fetch(`${KEYCLOAK_URL}/admin/realms/${REALM}/groups/${req.params.id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!r.ok) throw new Error(`Keycloak ${r.status}: ${await r.text()}`);
    res.status(204).send();
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// GET /api/groupes/:id/users
router.get("/:id/users", async (req, res) => {
  try {
    const token = await getAdminToken();
    const r = await fetch(`${KEYCLOAK_URL}/admin/realms/${REALM}/groups/${req.params.id}/members`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!r.ok) throw new Error(`Keycloak ${r.status}`);
    res.json(await r.json());
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// GET /api/groupes/:id/subgroups
router.get("/:id/subgroups", async (req, res) => {
  try {
    const token = await getAdminToken();
    const r = await fetch(`${KEYCLOAK_URL}/admin/realms/${REALM}/groups/${req.params.id}/children`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!r.ok) throw new Error(`Keycloak ${r.status}`);
    res.json(await r.json());
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// POST /api/groupes/:id/subgroups  { name }
router.post("/:id/subgroups", async (req, res) => {
  try {
    const token = await getAdminToken();
    const r = await fetch(`${KEYCLOAK_URL}/admin/realms/${REALM}/groups/${req.params.id}/children`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({ name: req.body.name }),
    });
    if (!r.ok) throw new Error(`Keycloak ${r.status}: ${await r.text()}`);
    res.status(201).json({ ok: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

export default router;
