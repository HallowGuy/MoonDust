// backend/utils/keycloak.js
import dotenv from "dotenv";
import pool from "../db.js";
import { fetchWithRetry } from "./retryFetch.js";

dotenv.config();

export const KEYCLOAK_URL = process.env.KEYCLOAK_INTERNAL_URL || process.env.KEYCLOAK_URL;
export const KEYCLOAK_FRONT_URL = process.env.KEYCLOAK_FRONT_URL;
export const REALM = process.env.REALM;
const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;

const form = (data) => new URLSearchParams(data);

// --- Token admin avec retry ---
export async function getAdminToken() {
  const url = `${KEYCLOAK_URL}/realms/${REALM}/protocol/openid-connect/token`;
  const res = await fetchWithRetry(
    url,
    {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: form({
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        grant_type: "client_credentials",
      }),
    },
    { retries: 8, initialDelay: 1000, maxDelay: 8000 }
  );

  const data = await res.json();
  if (!res.ok) throw new Error(`Keycloak token error ${res.status}: ${JSON.stringify(data)}`);
  return data.access_token;
}

// --- Sync utilisateurs avec retry ---
export async function syncKeycloakUsers() {
  try {
    const token = await getAdminToken();

    const res = await fetchWithRetry(
      `${KEYCLOAK_URL}/admin/realms/${REALM}/users`,
      { headers: { Authorization: `Bearer ${token}` } },
      { retries: 6, initialDelay: 1000, maxDelay: 8000 }
    );

    if (!res.ok) {
      const txt = await res.text();
      throw new Error(`Erreur Keycloak API ${res.status}: ${txt}`);
    }

    const users = await res.json();

    for (const u of users) {
      await pool.query(
        `INSERT INTO demo_first.keycloak_users (id, username, email)
         VALUES ($1,$2,$3)
         ON CONFLICT (id) DO UPDATE
           SET username = EXCLUDED.username,
               email    = EXCLUDED.email`,
        [u.id, u.username, u.email || null]
      );
    }
    console.log(`✅ Sync terminé : ${users.length} utilisateurs importés`);
  } catch (err) {
    console.error("❌ Erreur syncKeycloakUsers:", err);
    if (err?.code === "ECONNREFUSED") {
      // dernier essai après une courte attente
      await new Promise((r) => setTimeout(r, 5000));
      return syncKeycloakUsers();
    }
    throw err;
  }
}

// --- JWKS avec retry ---
export async function getPublicKey(kid) {
  const base = process.env.KEYCLOAK_INTERNAL_URL || KEYCLOAK_URL;
  const res = await fetchWithRetry(
    `${base}/realms/${REALM}/protocol/openid-connect/certs`,
    {},
    { retries: 5, initialDelay: 800, maxDelay: 6000 }
  );

  if (!res.ok) throw new Error(`Erreur récupération JWKS: ${res.status} ${await res.text()}`);
  const jwks = await res.json();

  const key = jwks.keys.find((k) => k.kid === kid);
  if (!key) throw new Error(`Aucune clé trouvée pour kid=${kid}`);

  const cert = key?.x5c?.[0];
  if (!cert) throw new Error("JWKS sans certificat x5c");
  return `-----BEGIN CERTIFICATE-----\n${cert.match(/.{1,64}/g).join("\n")}\n-----END CERTIFICATE-----\n`;
}
