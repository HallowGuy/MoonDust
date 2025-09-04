// backend/utils/keycloak.js
import fetch from "node-fetch";
import dotenv from "dotenv";
dotenv.config();

export const KEYCLOAK_URL = process.env.KEYCLOAK_URL;
export const REALM = process.env.REALM;
const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;

export async function getAdminToken() {
  const res = await fetch(`${KEYCLOAK_URL}/realms/${REALM}/protocol/openid-connect/token`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
      grant_type: "client_credentials",
    }),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(`Keycloak token error ${res.status}: ${JSON.stringify(data)}`);
  }
  return data.access_token;
}
