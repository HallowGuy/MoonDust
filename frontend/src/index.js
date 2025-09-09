import 'core-js';
import React from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import App from './App';
import store from './store';
import keycloak from './keycloak.js';

// ✅ Initialiser Keycloak avant React
keycloak.init({ onLoad: "login-required" }).then((authenticated) => {
  if (!authenticated) {
    console.warn("❌ Authentification échouée → redirection login");
    keycloak.login();
  } else {
    console.log("✅ Connecté :", keycloak.tokenParsed?.preferred_username);

    createRoot(document.getElementById('root')).render(
      <Provider store={store}>
        <App />
      </Provider>,
    );
  }
});
