import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path, { dirname } from "path";
import { fileURLToPath } from "url";
import swaggerUi from "swagger-ui-express";
import swaggerJSDoc from "swagger-jsdoc";
import { createServer } from "http";        // ⚡ pour HTTP server
import { Server } from "socket.io";         // ⚡ pour socket.io
import { syncKeycloakUsers } from "./utils/keycloak.js";
import { authenticate, requireRole } from "./middleware/authenticate.js";

import messaging from "./messaging.js";     // ⚡ module de messagerie

// --- setup chemins / env
dotenv.config();
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
console.log("🔧 KEYCLOAK_URL =", process.env.KEYCLOAK_URL)
console.log("🔧 REALM =", process.env.REALM)
console.log("🔧 FRONT_CLIENT_ID =", process.env.FRONT_CLIENT_ID)

const app = express();
const PORT = process.env.PORT || 5001;
const origins = [process.env.VITE_URL, process.env.ADMIN_URL].filter(Boolean);
const backend = process.env.BACKEND_URL;

// ⚡ Créer un serveur HTTP basé sur Express
const server = createServer(app);

// ⚡ Brancher Socket.IO sur le serveur HTTP
const io = new Server(server, {
  cors: {
    origin: ["http://localhost:3002", "http://localhost:5173"], // ⚡ ton front React
    methods: ["GET", "POST"],
    credentials: true,
  },
})
// --- middlewares
app.use(cors({
  origin: origins,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
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
    servers: [{ url: `${backend}${PORT}` }],  // ex: http://localhost:5001
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
import messagesRouter from "./routes/messages.js"; // ⚡ ajout
import conversationsRouter from "./routes/conversations.js";
import keycloakUsersRouter from "./routes/keycloakUsers.js";
import contactsRoutes from "./routes/contacts.js";
import entreprisesRoutes from "./routes/entreprises.js";
import projetsRoutes from "./routes/projets.js";
import activitesRoutes from "./routes/activites.js";
import tagsRoutes from "./routes/tags.js";
import exportsRoutes from "./routes/exports.js";
import listesRoutes from "./routes/listes.js";
import notesRoutes from "./routes/notes.js";
import notificationsRoutes from "./routes/notifications.js";


app.use("/api", systemRouter);       // /api/realm → infos de config
app.use("/api/hello", helloRouter);  // test/ping
app.use("/api/theme", themeRouter);  // config UI
app.use("/api", configRouter);       // routes/forms → si c'est censé être public

app.use("/api/users", authenticate, requireRole("superadmin"), usersRouter);
app.use("/api/roles", authenticate, requireRole("superadmin"), rolesRouter);
app.use("/api/groupes", authenticate, requireRole("superadmin"), groupesRouter);
app.use("/api/documents", authenticate, documentsRouter);
app.use("/api/conges", authenticate, congesRouter);
app.use("/api/audit", authenticate, auditRouter);
app.use("/api/me", authenticate, meRouter);
app.use("/api/messages", authenticate, messagesRouter);
app.use("/api/conversations", authenticate, conversationsRouter);
app.use("/api/keycloak-users", authenticate, keycloakUsersRouter);
app.use("/api/contacts", authenticate, contactsRoutes);
app.use("/api/entreprises", authenticate, entreprisesRoutes);
app.use("/api/projets", authenticate, projetsRoutes);
app.use("/api/activites", authenticate, activitesRoutes);
app.use("/api/tags", authenticate, tagsRoutes);
app.use("/api/exports", authenticate, exportsRoutes);
app.use("/api/listes", authenticate, listesRoutes);
app.use("/api/notes", authenticate, notesRoutes);
app.use("/api/notifications", authenticate, notificationsRoutes);




// --- 404 & erreur générique
app.use((_req, res) => res.status(404).json({ error: "Route introuvable" }));
// eslint-disable-next-line no-unused-vars
app.use((err, _req, res, _next) => {
  console.error("Unhandled error:", err);
  res.status(500).json({ error: "Erreur serveur" });
});

// --- socket.io messaging
messaging(io);

(async () => {
  await syncKeycloakUsers(); // synchro au démarrage
})();

// ⚡ Lancement serveur HTTP + socket.io
server.listen(PORT, () => console.log(`✅ API ready on ${backend}${PORT}`));
