// Runtime-injectable config. Override values in production without rebuild.
// If you manage env via Vite at build time, you can ignore this file.
window.__ENV = Object.assign({}, window.__ENV, {
  // Keycloak
  VITE_KEYCLOAK_URL: 'http://localhost:8081',
  VITE_REALM: 'REALM_REUNION',
  VITE_FRONT_ID: 'react-app',
})

