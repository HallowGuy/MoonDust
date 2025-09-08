// backend/utils/keycloak.js
import fetch from "node-fetch";
import dotenv from "dotenv";
import pool from "../db.js";

dotenv.config();

export const KEYCLOAK_URL = process.env.KEYCLOAK_URL;
export const REALM = process.env.REALM;
const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;

// --- Récupérer un token admin ---
export async function getAdminToken() {
  const res = await fetch(
    `${KEYCLOAK_URL}/realms/${REALM}/protocol/openid-connect/token`,
    {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        grant_type: "client_credentials",
      }),
    }
  );

  const data = await res.json();
  if (!res.ok) {
    throw new Error(
      `Keycloak token error ${res.status}: ${JSON.stringify(data)}`
    );
  }
  return data.access_token;
}

// --- Synchroniser les utilisateurs Keycloak vers PostgreSQL ---
export async function syncKeycloakUsers() {
  try {
    const token = await getAdminToken();

    const res = await fetch(
      `${KEYCLOAK_URL}/admin/realms/${REALM}/users`,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    if (!res.ok) {
      throw new Error(`Erreur Keycloak API ${res.status}`);
    }

    const users = await res.json();

    for (const u of users) {
      await pool.query(
        `
        INSERT INTO keycloak_users (id, username, email)
        VALUES ($1, $2, $3)
        ON CONFLICT (id) DO UPDATE
          SET username = EXCLUDED.username,
              email = EXCLUDED.email
        `,
        [u.id, u.username, u.email || null]
      );
    }

    console.log(`✅ Sync terminé : ${users.length} utilisateurs importés`);
  } catch (err) {
    console.error("❌ Erreur syncKeycloakUsers:", err);
  }
}
