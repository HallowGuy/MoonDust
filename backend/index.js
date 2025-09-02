import express from "express"
import cors from "cors"
import fetch from "node-fetch"
import dotenv from "dotenv"
import mime from "mime-types"
import nodemailer from "nodemailer"
import multer from "multer"
import { logAction } from "./utils/logger.js"
import pool from "./db.js"
import { fileURLToPath } from "url"
import path from "path"
import fs from "fs/promises"
import fssync from "fs"
import jwt from "jsonwebtoken"
import jwksClient from "jwks-rsa"
import swaggerUi from "swagger-ui-express";
import swaggerJSDoc from "swagger-jsdoc";  // ✅ import correct


const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// ---------------- CONFIG ROUTES ----------------
const CONFIG_FILE = path.join(__dirname, "routes-config.json")



const app = express()
//const PORT = process.env.PORT || 5001



// ---------- MIDDLEWARES ----------
app.use(
  cors({
    origin: [
      "http://localhost:3000", // CRA
      "http://localhost:5173", // Vite
      "http://localhost:3002", // ton port frontend
    ],
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"], // <-- ajoute Authorization ici
  })
)

app.use(express.json())

function getKey(header, callback) {
  client.getSigningKey(header.kid, (err, key) => {
    if (err) return callback(err)
    const signingKey = key.getPublicKey()
    callback(null, signingKey)
  })
}

// Configuration Swagger
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



// Healthcheck
app.get("/health", (_req, res) => {
  res.status(200).json({ status: "ok" })
})
// Lire la config depuis le fichier
// Lire la config depuis le fichier
async function getConfig() {
  try {
    const data = await fs.readFile(CONFIG_FILE, { encoding: "utf-8" })
    return JSON.parse(data)
  } catch (err) {
    console.error("⚠️ Aucun fichier routes-config.json trouvé, retour objet vide")
    return {}
  }
}

// Écrire la config dans le fichier
async function setConfig(config) {
  await fs.writeFile(CONFIG_FILE, JSON.stringify(config, null, 2), { encoding: "utf-8" })
  console.log("Config sauvegardée dans :", CONFIG_FILE)
}




// 🚀 Endpoint GET : récupérer la config
app.get('/api/routes-config', async (req, res) => {
  try {
    const config = await getConfig()
    res.json(config)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// 🚀 Endpoint POST : sauvegarder la config
app.post('/api/routes-config', async (req, res) => {
  try {
    const config = req.body
    console.log("📥 Nouvelle config reçue :", config)
    await setConfig(config)
    res.json({ success: true })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})




dotenv.config({ path: path.resolve(__dirname, "../.env") })




// ---------------- KEYCLOAK CONFIG ----------------
// ---------------- KEYCLOAK CONFIG ----------------
const KEYCLOAK_URL = process.env.KEYCLOAK_URL
const REALM = process.env.REALM
const CLIENT_ID = process.env.CLIENT_ID
const CLIENT_SECRET = process.env.CLIENT_SECRET

console.log("🔧 KEYCLOAK_URL =", KEYCLOAK_URL)
console.log("🔧 REALM =", REALM)
console.log("🔧 CLIENT_ID =", CLIENT_ID)
console.log("🔧 CLIENT_SECRET =", CLIENT_SECRET ? "****" : "undefined")

// 🔑 Fonction pour récupérer un token admin
async function getAdminToken() {
  const res = await fetch(
    `${KEYCLOAK_URL}/realms/${REALM}/protocol/openid-connect/token`,
    {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        grant_type: "client_credentials",
      }),
    },
  )

  const data = await res.json()
  return data.access_token
}

const client = jwksClient({
  jwksUri: `${KEYCLOAK_URL}/realms/${REALM}/protocol/openid-connect/certs`,
})
// ------------------- KEYCLOAK USERS -------------------

// 🚀 Lister tous les utilisateurs
app.get("/api/users", async (req, res) => {
  try {
    const token = await getAdminToken()
    const usersRes = await fetch(
      `${KEYCLOAK_URL}/admin/realms/${REALM}/users`,
      { headers: { Authorization: `Bearer ${token}` } }
    )

    if (!usersRes.ok) {
      throw new Error(`Erreur Keycloak: ${usersRes.status}`)
    }

    const users = await usersRes.json()
    res.json(users)
  } catch (err) {
    console.error("❌ Erreur /api/users:", err.message)
    res.status(500).json({ error: err.message })
  }
})

// Nombre total d'utilisateurs
app.get("/api/users/count", async (req, res) => {
  try {
    const token = await getAdminToken()
    const countRes = await fetch(
      `${KEYCLOAK_URL}/admin/realms/${REALM}/users/count`,
      { headers: { Authorization: `Bearer ${token}` } }
    )

    if (!countRes.ok) {
      throw new Error(`Erreur Keycloak: ${countRes.status}`)
    }

    const total = await countRes.json()
    res.json({ count: total })
  } catch (err) {
    console.error("❌ Erreur /api/users/count:", err.message)
    res.status(500).json({ error: err.message })
  }
})


// Nombre d'utilisateurs actifs (enabled = true)
app.get("/api/users/active", async (req, res) => {
  try {
    const token = await getAdminToken()
    const usersRes = await fetch(
      `${KEYCLOAK_URL}/admin/realms/${REALM}/users`,
      { headers: { Authorization: `Bearer ${token}` } }
    )

    if (!usersRes.ok) {
      throw new Error(`Erreur Keycloak: ${usersRes.status}`)
    }

    const users = await usersRes.json()
    const activeUsers = users.filter(u => u.enabled)

    res.json({ userActive: activeUsers.length })
  } catch (err) {
    console.error("❌ Erreur /api/users/active:", err.message)
    res.status(500).json({ error: err.message })
  }
})


// Nombre total de rôles
app.get("/api/roles/count", async (req, res) => {
  try {
    const token = await getAdminToken()
    const rolesRes = await fetch(
      `${KEYCLOAK_URL}/admin/realms/${REALM}/roles`,
      { headers: { Authorization: `Bearer ${token}` } }
    )

    if (!rolesRes.ok) {
      throw new Error(`Erreur Keycloak: ${rolesRes.status}`)
    }

    const roles = await rolesRes.json()
    res.json({ count: roles.length })
  } catch (err) {
    console.error("❌ Erreur /api/roles/count:", err.message)
    res.status(500).json({ error: err.message })
  }
})

// Fonction récursive pour compter tous les sous-groupes
async function countSubGroups(groups, token) {
  let total = 0

  for (const g of groups) {
    // 🔎 Récupère les enfants de ce groupe
    const childrenRes = await fetch(
      `${KEYCLOAK_URL}/admin/realms/${REALM}/groups/${g.id}/children`,
      { headers: { Authorization: `Bearer ${token}` } }
    )

    if (childrenRes.ok) {
      const children = await childrenRes.json()
      total += children.length
      total += await countSubGroups(children, token) // récursif
    }
  }

  return total
}
// 🚀 Stats groupes + sous-groupes
app.get("/api/groupes/stats", async (req, res) => {
  try {
    const token = await getAdminToken()
    const groupsRes = await fetch(
      `${KEYCLOAK_URL}/admin/realms/${REALM}/groups`,
      { headers: { Authorization: `Bearer ${token}` } }
    )

    if (!groupsRes.ok) {
      throw new Error(`Erreur Keycloak: ${groupsRes.status}`)
    }

    const groups = await groupsRes.json()
    const totalGroups = groups.length
    const totalSubGroups = await countSubGroups(groups, token)

    res.json({
      groups: totalGroups,
      subGroups: totalSubGroups,
    })
  } catch (err) {
    console.error("❌ Erreur /api/groupes/stats:", err.message)
    res.status(500).json({ error: err.message })
  }
})

app.get("/api/realm", (req, res) => {
  res.json({ realm: process.env.REALM })
})


// 🚀 Créer un utilisateur
// 🚀 Lister tous les utilisateurs
// 🚀 Créer un utilisateur
app.post("/api/users", async (req, res) => {
  try {
    const token = await getAdminToken()

    const newUser = {
      username: req.body.username,
      email: req.body.email,
      firstName: req.body.firstName || "",
      lastName: req.body.lastName || "",
      enabled: true,          // ✅ activé
      emailVerified: true,    // ✅ marqué comme vérifié
      credentials: [
        {
          type: "password",
          value: req.body.password || "TempPass123!", // ⚡ mot de passe par défaut si rien n'est fourni
          temporary: true, // obligé de le changer à la 1ère connexion
        },
      ],
    }

    const createRes = await fetch(
      `${KEYCLOAK_URL}/admin/realms/${REALM}/users`,
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newUser),
      }
    )

    if (!createRes.ok) {
      const errorText = await createRes.text()
      throw new Error(`Erreur Keycloak: ${createRes.status} - ${errorText}`)
    }

    res.status(201).json({ message: "Utilisateur créé avec succès" })
  } catch (err) {
    console.error("❌ Erreur création user:", err.message)
    res.status(500).json({ error: err.message })
  }
})




// 🚀 Mettre à jour un utilisateur
app.put("/api/users/:id", async (req, res) => {
  try {
    const { id } = req.params

    const token = await getAdminToken()
    const updateRes = await fetch(
      `${KEYCLOAK_URL}/admin/realms/${REALM}/users/${id}`,
      {
        method: "PUT",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(req.body),
      }
    )

    if (!updateRes.ok) {
      const errorText = await updateRes.text()
      throw new Error(`Erreur Keycloak: ${updateRes.status} - ${errorText}`)
    }

    res.json({ message: "Utilisateur mis à jour" })
  } catch (err) {
    console.error("❌ Erreur update user:", err.message)
    res.status(500).json({ error: err.message })
  }
})

// 🚀 Supprimer un utilisateur
app.delete("/api/users/:id", async (req, res) => {
  try {
    const { id } = req.params

    const token = await getAdminToken()
    const deleteRes = await fetch(
      `${KEYCLOAK_URL}/admin/realms/${REALM}/users/${id}`,
      {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` }
      }
    )

    if (!deleteRes.ok) {
      const errorText = await deleteRes.text()
      throw new Error(`Erreur Keycloak: ${deleteRes.status} - ${errorText}`)
    }

    res.status(204).send()
  } catch (err) {
    console.error("❌ Erreur delete user:", err.message)
    res.status(500).json({ error: err.message })
  }
})


// ------------------- KEYCLOAK ROLES -------------------

// 🚀 Lister les rôles
app.get("/api/roles", async (req, res) => {
  try {
    const token = await getAdminToken()
    const rolesRes = await fetch(
      `${KEYCLOAK_URL}/admin/realms/${REALM}/roles`,
      { headers: { Authorization: `Bearer ${token}` } }
    )

    if (!rolesRes.ok) {
      throw new Error(`Erreur Keycloak: ${rolesRes.status}`)
    }

    const roles = await rolesRes.json()
    res.json(roles)
  } catch (err) {
    console.error("❌ Erreur /api/roles:", err.message)
    res.status(500).json({ error: err.message })
  }
})


// 🚀 Récupérer les rôles d’un utilisateur (Keycloak)
app.get("/api/users/:id/roles", async (req, res) => {
  try {
    const { id } = req.params

    const token = await getAdminToken()
    const rolesRes = await fetch(
      `${KEYCLOAK_URL}/admin/realms/${REALM}/users/${id}/role-mappings/realm`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    )

    if (!rolesRes.ok) {
      const errorText = await rolesRes.text()
      throw new Error(`Erreur Keycloak: ${rolesRes.status} - ${errorText}`)
    }

    const roles = await rolesRes.json()
    res.json(roles)
  } catch (err) {
    console.error("❌ Erreur get user roles:", err.message)
    res.status(500).json({ error: err.message })
  }
})

app.get("/api/me/roles", async (req, res) => {
  try {
    const authHeader = req.headers.authorization
    if (!authHeader) {
      return res.status(401).json({ error: "Token manquant" })
    }

    const tokenUser = authHeader.split(" ")[1]
    const decoded = jwt.decode(tokenUser)

    if (!decoded || !decoded.sub) {
      return res.status(401).json({ error: "Token utilisateur invalide" })
    }

    const userId = decoded.sub // UUID du user dans Keycloak

    // 🔑 Récupérer un token admin
    const tokenAdmin = await getAdminToken()

    // 🔎 Appeler Keycloak pour récupérer les rôles du user
    const rolesRes = await fetch(
      `${KEYCLOAK_URL}/admin/realms/${REALM}/users/${userId}/role-mappings/realm`,
      {
        headers: { Authorization: `Bearer ${tokenAdmin}` },
      }
    )

    if (!rolesRes.ok) {
      const errorText = await rolesRes.text()
      throw new Error(`Erreur Keycloak: ${rolesRes.status} - ${errorText}`)
    }

    const roles = await rolesRes.json()

    // 👉 Retourne juste la liste des noms de rôles
    res.json({ roles: roles.map(r => r.name) })
  } catch (err) {
    console.error("❌ Erreur /api/me/roles:", err.message)
    res.status(500).json({ error: err.message })
  }
})

// 🚀 Assigner des rôles à un utilisateur (remplace l’existant)
app.post("/api/users/:id/roles", async (req, res) => {
  try {
    const { id } = req.params
    const { roles } = req.body  // tableau d’objets { id, name }

    if (!Array.isArray(roles)) {
      return res.status(400).json({ error: "roles (array) requis" })
    }

    const token = await getAdminToken()
    const assignRes = await fetch(
      `${KEYCLOAK_URL}/admin/realms/${REALM}/users/${id}/role-mappings/realm`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(roles),
      }
    )

    if (!assignRes.ok) {
      const errorText = await assignRes.text()
      throw new Error(`Erreur Keycloak: ${assignRes.status} - ${errorText}`)
    }

    res.json({ success: true })
  } catch (err) {
    console.error("❌ Erreur assign roles:", err.message)
    res.status(500).json({ error: err.message })
  }
})

// 🚀 Supprimer un rôle spécifique d’un utilisateur (Keycloak)
// 🚀 Supprimer plusieurs rôles d’un utilisateur
app.delete("/api/users/:id/roles", async (req, res) => {
  try {
    const { id } = req.params
    const { roles } = req.body // tableau [{id, name}, ...]

    if (!Array.isArray(roles) || roles.length === 0) {
      return res.status(400).json({ error: "roles (array) requis" })
    }

    const token = await getAdminToken()

    const removeRes = await fetch(
      `${KEYCLOAK_URL}/admin/realms/${REALM}/users/${id}/role-mappings/realm`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(roles),
      }
    )

    if (!removeRes.ok) {
      const errorText = await removeRes.text()
      throw new Error(`Erreur Keycloak: ${removeRes.status} - ${errorText}`)
    }

    res.status(204).send()
  } catch (err) {
    console.error("❌ Erreur delete roles:", err.message)
    res.status(500).json({ error: err.message })
  }
})


// 🚀 Créer un rôle
app.post("/api/roles", async (req, res) => {
  try {
    const token = await getAdminToken()
    const createRes = await fetch(
      `${KEYCLOAK_URL}/admin/realms/${REALM}/roles`,
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(req.body), // { name, description }
      }
    )

    if (!createRes.ok) {
      const errorText = await createRes.text()
      throw new Error(`Erreur Keycloak: ${createRes.status} - ${errorText}`)
    }

    res.status(201).json({ message: "Rôle créé avec succès" })
  } catch (err) {
    console.error("❌ Erreur création rôle:", err.message)
    res.status(500).json({ error: err.message })
  }
})

// 🚀 Modifier un rôle
app.put("/api/roles/:name", async (req, res) => {
  try {
    const { name } = req.params
    const token = await getAdminToken()

    const updateRes = await fetch(
      `${KEYCLOAK_URL}/admin/realms/${REALM}/roles/${name}`,
      {
        method: "PUT",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(req.body), // { name, description }
      }
    )

    if (!updateRes.ok) {
      const errorText = await updateRes.text()
      throw new Error(`Erreur Keycloak: ${updateRes.status} - ${errorText}`)
    }

    res.json({ message: "Rôle mis à jour avec succès" })
  } catch (err) {
    console.error("❌ Erreur update rôle:", err.message)
    res.status(500).json({ error: err.message })
  }
})

// 🚀 Supprimer un rôle
app.delete("/api/roles/:name", async (req, res) => {
  try {
    const { name } = req.params
    const token = await getAdminToken()

    const deleteRes = await fetch(
      `${KEYCLOAK_URL}/admin/realms/${REALM}/roles/${name}`,
      {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` }
      }
    )

    if (!deleteRes.ok) {
      const errorText = await deleteRes.text()
      throw new Error(`Erreur Keycloak: ${deleteRes.status} - ${errorText}`)
    }

    res.status(204).send()
  } catch (err) {
    console.error("❌ Erreur suppression rôle:", err.message)
    res.status(500).json({ error: err.message })
  }
})

// 🚀 Lister les utilisateurs associés à un rôle
app.get("/api/roles/:roleName/users", async (req, res) => {
  try {
    const { roleName } = req.params
    const token = await getAdminToken()

    const usersRes = await fetch(
      `${KEYCLOAK_URL}/admin/realms/${REALM}/roles/${roleName}/users`,
      { headers: { Authorization: `Bearer ${token}` } }
    )

    if (!usersRes.ok) {
      const errorText = await usersRes.text()
      throw new Error(`Erreur Keycloak: ${usersRes.status} - ${errorText}`)
    }

    const users = await usersRes.json()
    res.json(users)
  } catch (err) {
    console.error("❌ Erreur get users by role:", err.message)
    res.status(500).json({ error: err.message })
  }
})

//
// 🔹 CRUD GROUPES
//

// ✅ Lister tous les groupes
// Liste des groupes + sous-groupes

app.post("/api/groupes", async (req, res) => {
  try {
    const token = await getAdminToken()

    // 🔹 Récupère le nom et sous-groupes envoyés depuis le frontend
    const { name, subGroups = [] } = req.body

    if (!name) {
      return res.status(400).json({ error: "Le nom du groupe est requis" })
    }

    // --- 1. Créer le groupe ---
    const kcRes = await fetch(
      `${KEYCLOAK_URL}/admin/realms/${REALM}/groups`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name }),
      }
    )

    if (!kcRes.ok) {
      const err = await kcRes.text()
      return res.status(kcRes.status).json({ error: err })
    }

    // --- 2. Récupérer l’ID du groupe créé depuis le header Location ---
    const location = kcRes.headers.get("Location")
    const groupId = location?.split("/").pop()

    // --- 3. Créer les sous-groupes ---
    for (const sg of subGroups) {
      await fetch(
        `${KEYCLOAK_URL}/admin/realms/${REALM}/groups/${groupId}/children`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ name: sg }),
        }
      )
    }

    res.status(201).json({ success: true, id: groupId })
  } catch (err) {
    console.error("❌ Erreur création groupe:", err)
    res.status(500).json({ error: err.message })
  }
})




// ✅ Modifier un groupe
app.put("/api/groupes/:id", async (req, res) => {
  try {
    const token = await getAdminToken()
    const kcRes = await fetch(`${KEYCLOAK_URL}/admin/realms/${REALM}/groups/${req.params.id}`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(req.body),
    })
    if (!kcRes.ok) throw new Error(await kcRes.text())
    res.json({ success: true })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// ✅ Supprimer un groupe
app.delete("/api/groupes/:id", async (req, res) => {
  try {
    const token = await getAdminToken()
    const kcRes = await fetch(`${KEYCLOAK_URL}/admin/realms/${REALM}/groups/${req.params.id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    })
    if (!(kcRes.ok || kcRes.status === 204)) throw new Error(await kcRes.text())
    res.json({ success: true })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

//
// 🔹 Utilisateurs d’un groupe
//
// Récupère les utilisateurs d’un groupe (par nom, y compris sous-groupes)
// GET /api/groupes/:id/users
app.get("/api/groupes/:id/users", async (req, res) => {
  try {
    const { id } = req.params
    const token = await getAdminToken()

    const usersRes = await fetch(
      `${KEYCLOAK_URL}/admin/realms/${REALM}/groups/${id}/members`,
      { headers: { Authorization: `Bearer ${token}` } }
    )

    if (!usersRes.ok) {
      const errorText = await usersRes.text()
      throw new Error(`Erreur Keycloak: ${usersRes.status} - ${errorText}`)
    }

    const users = await usersRes.json()
    res.json(users)
  } catch (err) {
    console.error("❌ Erreur get group users:", err.message)
    res.status(500).json({ error: err.message })
  }
})

app.get("/api/groupes", async (req, res) => {
  try {
    const token = await getAdminToken()
    const kcRes = await fetch(`${KEYCLOAK_URL}/admin/realms/${REALM}/groups`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    if (!kcRes.ok) throw new Error(await kcRes.text())
    res.json(await kcRes.json())
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// ✅ Récupérer les sous-groupes d’un groupe par son ID
app.get("/api/groupes/:id/subgroups", async (req, res) => {
  try {
    const token = await getAdminToken()

    const { id } = req.params
    const subgroupsRes = await fetch(
      `${KEYCLOAK_URL}/admin/realms/${REALM}/groups/${id}/children`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    )

    if (!subgroupsRes.ok) {
      const err = await subgroupsRes.text()
      return res.status(subgroupsRes.status).json({ error: err })
    }

    const subgroups = await subgroupsRes.json()
    res.json(subgroups)
  } catch (err) {
    console.error("❌ Erreur récupération sous-groupes :", err)
    res.status(500).json({ error: "Erreur serveur" })
  }
})


app.post("/api/groupes/:id/subgroups", async (req, res) => {
  try {
    const token = await getAdminToken()
    const { id } = req.params
    const { name } = req.body

    const createRes = await fetch(
      `${KEYCLOAK_URL}/admin/realms/${REALM}/groups/${id}/children`,
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name }),
      }
    )

    if (!createRes.ok) {
      const err = await createRes.text()
      return res.status(createRes.status).json({ error: err })
    }

    res.json({ success: true })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: "Erreur création sous-groupe" })
  }
})

app.put("/api/groupes/:id", async (req, res) => {
  try {
    const token = await getAdminToken()
    const { id } = req.params
    const { name, path, attributes } = req.body

    const updateRes = await fetch(
      `${KEYCLOAK_URL}/admin/realms/${REALM}/groups/${id}`,
      {
        method: "PUT",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, path, attributes }),
      }
    )

    if (!updateRes.ok) {
      const err = await updateRes.text()
      return res.status(updateRes.status).json({ error: err })
    }

    res.json({ success: true })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: "Erreur update groupe" })
  }
})

app.delete("/api/groupes/:id", async (req, res) => {
  try {
    const token = await getAdminToken()
    const { id } = req.params

    const deleteRes = await fetch(
      `${KEYCLOAK_URL}/admin/realms/${REALM}/groups/${id}`,
      {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      }
    )

    if (!deleteRes.ok) {
      const err = await deleteRes.text()
      return res.status(deleteRes.status).json({ error: err })
    }

    res.json({ success: true })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: "Erreur suppression groupe" })
  }
})


// 👉 servir les fichiers uploadés
app.get("/uploads/:file", (req, res) => {
  const __dirname = path.resolve()
  const filePath = path.join(__dirname, "uploads", req.params.file)

  if (!fssync.existsSync(filePath)) {
    return res.status(404).send("Fichier introuvable")
  }

  const type = mime.lookup(filePath) || "application/octet-stream"
  res.setHeader("Content-Type", type)
  res.setHeader("Content-Disposition", `inline; filename="${req.params.file}"`)

  fssync.createReadStream(filePath).pipe(res)
})


// ---------- EMAIL (Nodemailer) ----------
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT || 587),
  secure: process.env.SMTP_SECURE === "true",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
})


transporter.verify()
  .catch(err => console.error('⚠️ SMTP non dispo :', err.message))

// ---------- MULTER CONFIG ----------
const storageLogo = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join(__dirname, 'uploads/logo')),
  filename: (req, file, cb) => cb(null, 'theme-logo.svg'), // ✅ écrase toujours
})
const uploadLogo = multer({ storage: storageLogo })

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join(__dirname, 'uploads')),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname)
    cb(null, Date.now() + ext)
  }
})
const upload = multer({ storage })


// ----------------------------------------------------
// ---------------------- AUDIT -----------------------
// ----------------------------------------------------
app.get('/api/audit', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT a.id, a.actor_user_id, a.entity_type, a.entity_id, a.action, a.meta, a.occurred_at,
             u.username AS actor_username
      FROM demo_first.audit_log a
      LEFT JOIN demo_first.users u ON a.actor_user_id = u.id
      ORDER BY a.occurred_at DESC
      LIMIT 100
    `)
    res.json(result.rows)
  } catch (err) {
    console.error('❌ Erreur SQL audit:', err)
    res.status(500).json({ error: 'Erreur serveur audit' })
  }
})



// ----------------------------------------------------
// --------------------- DOCUMENTS -------------------
// ----------------------------------------------------
app.post('/api/documents', async (req, res) => {
  try {
    const { owner_user_id, name } = req.body
    const { rows } = await pool.query(
      `INSERT INTO demo_first.documents (owner_user_id, name) VALUES ($1, $2) RETURNING *`,
      [owner_user_id, name]
    )
    res.status(201).json(rows[0])
  } catch (e) {
    console.error(e)
    res.status(500).json({ error: 'Erreur création document' })
  }
})

app.post('/api/documents/:id/upload', upload.single('file'), async (req, res) => {
  try {
    const { id } = req.params
    const version = await pool.query(
      `SELECT COALESCE(MAX(version_no),0)+1 AS next FROM demo_first.document_versions WHERE document_id=$1`,
      [id]
    )
    const version_no = version.rows[0].next

    const { filename, mimetype, size } = req.file

    await pool.query(
      `UPDATE demo_first.documents 
       SET extension=$1, size_bytes=$2, mime_type=$3, updated_at=NOW()
       WHERE id=$4`,
      [path.extname(filename), size, mimetype, id]
    )

    const { rows } = await pool.query(
      `INSERT INTO demo_first.document_versions (document_id, version_no, storage_uri, checksum_sha256, created_at)
       VALUES ($1,$2,$3,$4,NOW()) RETURNING *`,
      [id, version_no, filename, null]
    )

    res.status(201).json(rows[0])
  } catch (e) {
    console.error(e)
    res.status(500).json({ error: 'Erreur upload version' })
  }
})

app.get('/api/documents', async (req, res) => {
  const { rows } = await pool.query('SELECT * FROM demo_first.documents ORDER BY id DESC')
  res.json(rows)
})

app.get('/api/documents/:id', async (req, res) => {
  const { id } = req.params
  const doc = await pool.query('SELECT * FROM demo_first.documents WHERE id=$1', [id])
  const versions = await pool.query('SELECT * FROM demo_first.document_versions WHERE document_id=$1 ORDER BY version_no DESC', [id])
  res.json({ document: doc.rows[0], versions: versions.rows })
})

app.delete('/api/documents/:id', async (req, res) => {
  const client = await pool.connect()
  try {
    const { id } = req.params
    await client.query('BEGIN')

    const versions = await client.query(
      'SELECT storage_uri FROM demo_first.document_versions WHERE document_id=$1',
      [id]
    )

    versions.rows.forEach(v => {
      const filePath = path.join(__dirname, 'uploads', v.storage_uri)
      if (fssync.existsSync(filePath)) fssync.unlinkSync(filePath)
    })

    await client.query('DELETE FROM demo_first.document_versions WHERE document_id=$1', [id])
    const { rowCount } = await client.query('DELETE FROM demo_first.documents WHERE id=$1', [id])

    await client.query('COMMIT')
    if (rowCount === 0) return res.status(404).json({ error: 'Document introuvable' })
    res.status(204).send()
  } catch (e) {
    await client.query('ROLLBACK')
    console.error('❌ Erreur delete doc:', e)
    res.status(500).json({ error: 'Erreur suppression document' })
  } finally {
    client.release()
  }
})

// PUT : mettre à jour un document
app.put('/api/documents/:id', async (req, res) => {
  try {
    const { id } = req.params
    const { name, owner_user_id, status } = req.body

    const { rows } = await pool.query(
      `UPDATE demo_first.documents 
       SET name=$1, owner_user_id=$2, status=$3, updated_at=NOW()
       WHERE id=$4 RETURNING *`,
      [name, owner_user_id, status, id]
    )

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Document introuvable' })
    }

    res.json(rows[0])
  } catch (e) {
    console.error('❌ Erreur SQL (update document):', e)
    res.status(500).json({ error: 'Erreur serveur' })
  }
})



// ----------------------------------------------------
// ---------------------- THEME ----------------------
// ----------------------------------------------------
const themesPath = path.join(__dirname, 'themes.json')
let themes = JSON.parse(fssync.readFileSync(themesPath, 'utf8'))
let currentTheme = 'default'

// 🔥 Rendre le dossier logo accessible publiquement
app.use('/uploads/logo', express.static(path.join(__dirname, 'uploads/logo')))

// ---------- LOGO THEME ----------
app.get('/api/theme/logo', (req, res) => {
  const logoPath = path.join(__dirname, 'uploads/logo/theme-logo.svg')

  if (!fssync.existsSync(logoPath)) {
    return res.status(404).json({ error: 'Aucun logo défini' })
  }

  // ✅ Utilisation de res.sendFile avec chemin absolu
  res.sendFile(logoPath)
})

app.post('/api/theme/logo', uploadLogo.single('file'), (req, res) => {
  try {
    res.json({
      ok: true,
      message: 'Logo mis à jour',
      url: `/api/theme/logo?t=${Date.now()}`, // cache-busting
    })
  } catch (err) {
    console.error('❌ Erreur upload logo:', err)
    res.status(500).json({ error: 'Échec upload logo' })
  }
})



// ----------------------------------------------------
// ---------------------- CONGES ----------------------
// ----------------------------------------------------
console.log("➡️ Route /api/conges enregistrée")

app.get('/api/conges', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM demo_first.leave_requests ORDER BY created_at DESC;'
    )
    res.json(result.rows)
  } catch (e) {
    console.error('❌ Erreur SQL leave_requests:', e)
    res.status(500).json({ error: 'Erreur serveur' })
  }
})

app.post('/api/conges', async (req, res) => {
  try {
    const { name, email, start_date, end_date, reason } = req.body

    // 👉 1. Insertion DB
    const { rows } = await pool.query(
      `INSERT INTO demo_first.leave_requests 
       (name, email, start_date, end_date, reason, status, created_at, updated_at) 
       VALUES ($1, $2, $3, $4, $5, 'EN ATTENTE', NOW(), NOW()) RETURNING *`,
      [name, email, start_date, end_date, reason]
    )
    const demande = rows[0]

    // 👉 2. Déclenchement workflow Activepieces
    try {
      await fetch('http://activepieces/api/v1/webhooks/gNnUPovuxR1ichOa9zdHQ', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: demande.id,          // utile pour suivi
          name: demande.name,
          email: demande.email,
          start_date: demande.start_date,
          end_date: demande.end_date,
          reason: demande.reason,
        }),
      })
      console.log("✅ Workflow Activepieces déclenché")
    } catch (err) {
      console.error("⚠️ Erreur déclenchement workflow:", err.message)
    }

    // 👉 3. Retour au frontend
    res.status(201).json(demande)
  } catch (e) {
    console.error('❌ Erreur SQL leave_requests insert:', e)
    res.status(500).json({ error: 'Erreur serveur' })
  }
})



// --- PUT pour mettre à jour le statut (approuver/refuser)
// ✅ Mettre à jour le statut d'une demande
app.put('/api/conges/:id/status', async (req, res) => {
  try {
    const { id } = req.params
    const { status } = req.body // "APPROUVÉ" ou "REJETÉ"

    const { rows } = await pool.query(
      `UPDATE demo_first.leave_requests
       SET status = $1, updated_at = NOW()
       WHERE id = $2
       RETURNING *`,
      [status, id]
    )

    if (rows.length === 0) return res.status(404).json({ error: 'Demande non trouvée' })

    res.json(rows[0])
  } catch (e) {
    console.error('❌ Erreur maj statut:', e)
    res.status(500).json({ error: 'Erreur serveur' })
  }
})


app.get('/api/conges/:id', async (req, res) => {
  try {
    const { id } = req.params
    const { rows } = await pool.query(
      'SELECT * FROM demo_first.leave_requests WHERE id = $1',
      [id]
    )
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Demande introuvable' })
    }
    res.json(rows[0])
  } catch (e) {
    console.error('❌ Erreur SQL leave_requests get by id:', e)
    res.status(500).json({ error: 'Erreur serveur' })
  }
})



// ---------- THEMES ----------
app.get('/api/theme/list', (req, res) => {
  res.json(Object.keys(themes))
})

app.get('/api/theme/current', (req, res) => {
  res.json({
    name: currentTheme,
    colors: themes[currentTheme]
  })
})


app.put('/api/theme/current', (req, res) => {
  const { name } = req.body
  if (!themes[name]) {
    return res.status(400).json({ error: 'Thème inconnu' })
  }
  currentTheme = name
  res.json({ ok: true, theme: themes[currentTheme] })
})

app.get('/api/theme/:name', (req, res) => {
  const { name } = req.params
  if (!themes[name]) {
    return res.status(404).json({ error: 'Thème non trouvé' })
  }
  res.json(themes[name])
})

app.put('/api/theme/colors', (req, res) => {
  const newColors = req.body
  themes[currentTheme] = newColors
  fssync.writeFileSync(themesPath, JSON.stringify(themes, null, 2), 'utf8')
  res.json({ ok: true, theme: newColors })
})

app.get('/api/theme/colors', (req, res) => {
  res.json(themes[currentTheme])
})

// ---------------- ACTIONS CONFIG ----------------
const ACTIONS_CONFIG_FILE = path.join(__dirname, "actions-config.json")


// Lire la config
// Lire la config (et créer un fichier vide si besoin)
async function getActionsConfig() {
  try {
    const data = await fs.readFile(ACTIONS_CONFIG_FILE, "utf-8")
    return JSON.parse(data)
  } catch (err) {
    console.warn("⚠️ Aucun fichier actions-config.json trouvé → création vide")

    // on crée un fichier vide pour initialiser
    await fs.writeFile(ACTIONS_CONFIG_FILE, JSON.stringify({}, null, 2), "utf-8")
    return {}
  }
}


// Écrire la config
async function setActionsConfig(config) {
  await fs.writeFile(ACTIONS_CONFIG_FILE, JSON.stringify(config, null, 2), { encoding: "utf-8" })
  console.log("💾 Actions config sauvegardée dans :", ACTIONS_CONFIG_FILE)
}

// 🚀 Endpoint GET : récupérer la config
app.get('/api/actions-config', async (req, res) => {
  try {
    const config = await getActionsConfig()
    res.json(config)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// 🚀 Endpoint POST : sauvegarder la config
app.post('/api/actions-config', async (req, res) => {
  try {
    const config = req.body
    console.log("📥 Nouvelle actions-config reçue :", config)
    await setActionsConfig(config)
    res.json({ success: true })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})



// ----------------------------------------------------
// ---------------------- SERVER ---------------------
// ----------------------------------------------------
const PORT = process.env.PORT || 5001

app.listen(PORT, () => {
  console.log(`✅ Backend API running on http://localhost:${PORT}`)
})
