import jwt from "jsonwebtoken";
import { getPublicKey } from "../utils/keycloak.js";

export async function authenticate(req, res, next) {
  const authHeader = req.headers["authorization"];
  if (!authHeader) return res.status(401).json({ error: "Missing Authorization header" });

  const token = authHeader.split(" ")[1];

  try {
    // ⚡ D'abord décoder sans vérifier pour récupérer le kid
    const decodedHeader = jwt.decode(token, { complete: true });
    if (!decodedHeader) throw new Error("Impossible de décoder le token");
    const kid = decodedHeader.header.kid;

    const pubKey = await getPublicKey(kid);

    const decoded = jwt.verify(token, pubKey, {
      algorithms: ["RS256"],
      issuer: `${process.env.KEYCLOAK_FRONT_URL}/realms/${process.env.REALM}`,
    });

    req.user = {
      id: decoded.sub,
      username: decoded.preferred_username,
      email: decoded.email,
      fullname: `${decoded.given_name || ""} ${decoded.family_name || ""}`.trim(),
    };

    next();
  } catch (err) {
    console.error("JWT Verify error:", err.message);
    return res.status(401).json({ error: "Invalid token" });
  }
}
