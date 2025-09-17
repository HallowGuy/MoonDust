import 'core-js';
import React from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import App from './App';
import store from './store';
import keycloak from './keycloak.js';

// ✅ Initialiser Keycloak sans forcer login
keycloak.init({ onLoad: "check-sso" }).then(() => {
    if (keycloak.authenticated) {
    console.log("✅ Connecté :", keycloak.tokenParsed?.preferred_username);
    localStorage.setItem("access_token", keycloak.token);

    // 🔄 Auto-refresh du token
    setInterval(() => {
      keycloak.updateToken(60).then((refreshed) => {
        if (refreshed) {
          console.log("🔄 Token rafraîchi");
          localStorage.setItem("access_token", keycloak.token);
        }
      }).catch(() => {
        console.error("❌ Impossible de rafraîchir le token → relogin");
        keycloak.login();
      });
    }, 30000);
  } else {
    console.log("ℹ️ Utilisateur non authentifié → affichage /login");
  }

  // 👉 Toujours rendre l'app, même si pas connecté
  createRoot(document.getElementById('root')).render(
    <Provider store={store}>
      <App />
    </Provider>,
  );
}).catch(err => {
  console.error("❌ Erreur init Keycloak :", err);
});
