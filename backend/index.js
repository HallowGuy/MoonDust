// backend/index.js
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path, { dirname } from "path";
import { fileURLToPath } from "url";
import swaggerUi from "swagger-ui-express";
import swaggerJSDoc from "swagger-jsdoc";

// --- setup chemins / env
dotenv.config();
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5001;
const origins = [process.env.VITE_URL, process.env.ADMIN_URL].filter(Boolean);
const backend = process.env.BACKEND_URL

// --- middlewares
app.use(cors({
  origin: origins,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));
app.use(express.json({ limit: "10mb" }));

// --- statiques uploads
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.get("/uploads/:file", (req, res) => {
  const filePath = path.join(__dirname, "uploads", req.params.file);
  res.sendFile(filePath, (err) => {
    if (err) res.status(err.statusCode || 404).json({ error: "Fichier introuvable" });
  });
});

// --- swagger
const swaggerSpec = swaggerJSDoc({
  definition: {
    openapi: "3.0.0",
    info: { title: "API MoonDust", version: "1.0.0", description: "Docs Swagger" },
    servers: [{ url: `${backend}${PORT}` }],
  },
  apis: ["./routes/*.js"],
});
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.get("/api-docs-json", (_req, res) => res.json(swaggerSpec));

// --- health
app.get("/health", (_req, res) => res.status(200).json({ status: "ok" }));

// --- routes
import systemRouter from "./routes/system.js";
import helloRouter from "./routes/hello.js";
import usersRouter from "./routes/users.js";
import rolesRouter from "./routes/roles.js";
import groupesRouter from "./routes/groupes.js";
import documentsRouter from "./routes/documents.js";
import congesRouter from "./routes/conges.js";
import themeRouter from "./routes/theme.js";
import configRouter from "./routes/config.js";
import auditRouter from "./routes/audit.js";
 import meRouter from "./routes/me.js";

app.use("/api", systemRouter);            // /api/realm
app.use("/api/hello", helloRouter);       // /api/hello
app.use("/api/users", usersRouter);       // /api/users...
app.use("/api/roles", rolesRouter);       // /api/roles...
app.use("/api/groupes", groupesRouter);   // /api/groupes...
app.use("/api/documents", documentsRouter);
app.use("/api/conges", congesRouter);
app.use("/api/theme", themeRouter);
app.use("/api", configRouter);            // /api/routes-config, /api/actions-config, /api/forms
app.use("/api/audit", auditRouter);
app.use("/api/me", meRouter);

// 404 & erreur générique
app.use((_req, res) => res.status(404).json({ error: "Route introuvable" }));
// eslint-disable-next-line no-unused-vars
app.use((err, _req, res, _next) => {
  console.error("Unhandled error:", err);
  res.status(500).json({ error: "Erreur serveur" });
});

app.listen(PORT, () => console.log(`✅ API ready on ${backend}${PORT}`));
