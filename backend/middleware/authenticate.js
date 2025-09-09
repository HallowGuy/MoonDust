// middleware/authenticate.js
import { expressjwt as jwt } from "express-jwt";
import jwksRsa from "jwks-rsa";

export const authenticate = jwt({
  // Utilise l’URL interne pour aller chercher les clés publiques
  secret: jwksRsa.expressJwtSecret({
    cache: true,
    rateLimit: true,
    jwksUri: `${process.env.KEYCLOAK_INTERNAL_URL}/realms/${process.env.REALM}/protocol/openid-connect/certs`,
  }),

  // Vérifie l’issuer attendu par le token (URL externe)
  issuer: `${process.env.KEYCLOAK_FRONT_URL}/realms/${process.env.REALM}`,

  // Vérifie l’audience
  audience: process.env.FRONT_CLIENT_ID,

  algorithms: ["RS256"],
});

export const requireRole = (role) => (req, res, next) => {
  if (req.auth?.realm_access?.roles?.includes(role)) {
    return next();
  }
  return res.status(403).json({ error: "Accès refusé" });
};

