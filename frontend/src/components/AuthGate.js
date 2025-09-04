// src/components/AuthGate.jsx
import { isTokenExpired } from "@/lib/http";

const PUBLIC = ["/login", "/callback", "/register", "/unauthorized", "/404", "/500"];

export default function AuthGate({ children }) {
  const path = typeof window !== "undefined" ? window.location.pathname : "/";
  const token = typeof window !== "undefined" ? localStorage.getItem("access_token") : null;

  // Laisse /callback tranquille (retour Keycloak)
  if (path.startsWith("/callback")) return children;

  const expired = !token || isTokenExpired(token);

  // Pas connecté → forcer /login (si pas déjà sur une page publique)
  if (expired && !PUBLIC.some((p) => path.startsWith(p))) {
    window.location.replace("/login");
    return null; // stoppe le rendu
  }

  // Déjà connecté → si on est sur /login|/register, renvoyer vers /
  if (!expired && (path.startsWith("/login") || path.startsWith("/register"))) {
    window.location.replace("/");
    return null;
  }

  return children;
}
