import keycloak from "../keycloak.js";

export async function fetchWithAuth(url, options = {}) {
  try {
    await keycloak.updateToken(60);

    const response = await fetch(url, {
      ...options,
      headers: {
        ...options.headers,
        Authorization: `Bearer ${keycloak.token}`,
      },
    });

    if (response.status === 401) {
      console.error("❌ Unauthorized, token invalide");
      keycloak.logout();
    }

    return response;
  } catch (err) {
    console.error("❌ Erreur fetchWithAuth:", err);
    keycloak.logout();
  }
}
