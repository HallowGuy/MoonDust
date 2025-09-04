// src/index.js
import 'core-js';

// ✅ Pré-check auth AVANT de charger React
(() => {
  try {
    const PUBLIC = ['/login', '/callback', '/register', '/unauthorized', '/404', '/500'];
    const path = window.location.pathname;
    const token = localStorage.getItem('access_token');

    // Laisse /callback passer (retour Keycloak)
    if (path.startsWith('/callback')) return;

    // Pas de token → si on n'est pas déjà sur une page publique → /login
    if (!token && !PUBLIC.some(p => path.startsWith(p))) {
      window.location.replace('/login');
      throw new Error('redirecting-to-login'); // stoppe la suite
    }
  } catch (e) {
    if (!String(e.message).includes('redirecting-to-login')) {
      console.warn('[preAuth] warning:', e);
    }
  }
})();

// 👇 ensuite on charge React
import React from 'react'
import { createRoot } from 'react-dom/client'
import { Provider } from 'react-redux'
import App from './App'
import store from './store'

createRoot(document.getElementById('root')).render(
  <Provider store={store}>
    <App />
  </Provider>,
)
