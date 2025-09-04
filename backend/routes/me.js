// backend/routes/me.js
import express from "express";
import jwt from "jsonwebtoken";
import fetch from "node-fetch";
import { getAdminToken, KEYCLOAK_URL, REALM } from "../utils/keycloak.js";

const router = express.Router();

// GET /api/me/roles
router.get("/roles", (req, res) => {
  try {
    const auth = req.headers.authorization || "";
    const token = auth.startsWith("Bearer ") ? auth.slice(7) : null;

    if (!token) {
      // pas connecté → pas d’erreur console côté front
      return res.json({ roles: [] });
    }

    const payloadB64 = token.split(".")[1];
    const payload = JSON.parse(Buffer.from(payloadB64, "base64").toString("utf8"));

    const realm = Array.isArray(payload?.realm_access?.roles) ? payload.realm_access.roles : [];
    const clientId = process.env.FRONT_CLIENT_ID || "react-app";
    const client = Array.isArray(payload?.resource_access?.[clientId]?.roles)
      ? payload.resource_access[clientId].roles
      : [];

    const roles = Array.from(new Set([...realm, ...client]));
    return res.json({ roles });
  } catch (e) {
    // token mal formé → ne bruitons pas la console front
    return res.json({ roles: [] });
  }
});

export default router;