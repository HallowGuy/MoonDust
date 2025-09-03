import express from "express"
import cors from "cors"
import dotenv from "dotenv"
import path from "path"
import { fileURLToPath } from "url"
import swaggerUi from "swagger-ui-express"
import swaggerJSDoc from "swagger-jsdoc"

// ⚡ utils & DB
import pool from "./db.js"
import { getKey, getAdminToken, client } from "./utils/keycloak.js"
//import "./utils/keycloak.js" // contient KEYCLOAK_URL, REALM, client, getAdminToken

// 📂 routes
import usersRoutes from "./routes/users.js"
import groupesRoutes from "./routes/groupes.js"
import rolesRoutes from "./routes/roles.js"
import congesRoutes from "./routes/conges.js"
import auditRoutes from "./routes/audit.js"
import documentsRoutes from "./routes/documents.js"
import themeRoutes from "./routes/theme.js"
import uploadsRoutes from "./routes/uploads.js"
import formsRoutes from "./routes/forms.js"
import actionsConfigRoutes from "./routes/actions-config.js"
import routesConfigRoutes from "./routes/routes-config.js"
import systemRoutes from "./routes/system.js"
import configRoutes from "./routes/config.js"
import debugRoutes from "./routes/debug.js"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
dotenv.config({ path: path.resolve(__dirname, "../.env") })

const app = express()
const PORT = process.env.PORT || 5001


// ---------- MIDDLEWARES ----------

app.use(
  cors({
    origin: [
      "http://localhost:3000", // CRA
      "http://localhost:5173", // Vite
      "http://localhost:3002", // ton port frontend
    ],
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
)

app.use(express.json())

// ---------- SWAGGER ----------
const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "API MoonDust",
      version: "1.0.0",
      description: "Documentation MoonDust avec Swagger",
    },
    servers: [{ url: "http://localhost:5001" }],
  },
  apis: ["./routes/*.js"], // chemin vers tes fichiers de routes annotés
};

const swaggerSpec = swaggerJSDoc(swaggerOptions);

// --- Swagger ---
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.get("/api-docs-json", (req, res) => res.json(swaggerSpec));

(async () => {
  try {
    const token = await getAdminToken();
    console.log("🔑 Admin token généré:", token.substring(0, 30) + "...");

    // Test direct sur Keycloak : lister les utilisateurs
    const testRes = await fetch(`${process.env.KEYCLOAK_URL}/admin/realms/${process.env.REALM}/users`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (!testRes.ok) {
      const errorText = await testRes.text();
      throw new Error(`Keycloak refuse le token (${testRes.status}): ${errorText}`);
    }

    console.log("✅ Admin token VALIDE → accès confirmé à Keycloak");
  } catch (err) {
    console.error("❌ Impossible de valider l'admin token:", err.message);
  }
})();

// ---------- HEALTHCHECK ----------
app.get("/health", (_req, res) => {
  res.status(200).json({ status: "ok" })
})



// --- ROUTES API ---
app.use("/api/users", usersRoutes)
app.use("/api/groupes", groupesRoutes)
app.use("/api/roles", rolesRoutes)
app.use("/api/conges", congesRoutes)
app.use("/api/audit", auditRoutes)
app.use("/api/documents", documentsRoutes)
app.use("/api/theme", themeRoutes)
app.use("/api/uploads", uploadsRoutes)
app.use("/api/forms", formsRoutes)
app.use("/api/actions-config", actionsConfigRoutes)
app.use("/api/routes-config", routesConfigRoutes)
app.use("/api/system", systemRoutes)
app.use("/api/config", configRoutes)
app.use("/api/debug", debugRoutes)


// ---------- START ----------
app.listen(PORT, () => {
  console.log(`✅ Backend API running on http://localhost:${PORT}`)
})


