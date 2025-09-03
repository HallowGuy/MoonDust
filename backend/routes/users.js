import express from "express"
import fetch from "node-fetch"
import jwt from "jsonwebtoken"
import { getAdminToken, KEYCLOAK_URL, REALM } from "../utils/keycloak.js"

const router = express.Router()

// 🚀 Lister tous les utilisateurs
router.get("/", async (req, res) => {
  try {
    const token = await getAdminToken()
    const usersRes = await fetch(`${KEYCLOAK_URL}/admin/realms/${REALM}/users`, {
      headers: { Authorization: `Bearer ${token}` },
    })

    if (!usersRes.ok) throw new Error(`Erreur Keycloak: ${usersRes.status}`)
    const users = await usersRes.json()
    res.json(users)
  } catch (err) {
    console.error("❌ Erreur /api/users:", err.message)
    res.status(500).json({ error: err.message })
  }
})

// 🚀 Nombre total d’utilisateurs
router.get("/count", async (req, res) => {
  try {
    const token = await getAdminToken()
    const countRes = await fetch(`${KEYCLOAK_URL}/admin/realms/${REALM}/users/count`, {
      headers: { Authorization: `Bearer ${token}` },
    })

    if (!countRes.ok) throw new Error(`Erreur Keycloak: ${countRes.status}`)
    const total = await countRes.json()
    res.json({ count: total })
  } catch (err) {
    console.error("❌ Erreur /api/users/count:", err.message)
    res.status(500).json({ error: err.message })
  }
})

// 🚀 Nombre d’utilisateurs actifs
router.get("/active", async (req, res) => {
  try {
    const token = await getAdminToken()
    const usersRes = await fetch(`${KEYCLOAK_URL}/admin/realms/${REALM}/users`, {
      headers: { Authorization: `Bearer ${token}` },
    })

    if (!usersRes.ok) throw new Error(`Erreur Keycloak: ${usersRes.status}`)
    const users = await usersRes.json()
    const activeUsers = users.filter((u) => u.enabled)

    res.json({ userActive: activeUsers.length })
  } catch (err) {
    console.error("❌ Erreur /api/users/active:", err.message)
    res.status(500).json({ error: err.message })
  }
})

// 🚀 Créer un utilisateur
router.post("/", async (req, res) => {
  try {
    const token = await getAdminToken()

    const newUser = {
      username: req.body.username,
      email: req.body.email,
      firstName: req.body.firstName || "",
      lastName: req.body.lastName || "",
      enabled: true,
      emailVerified: true,
      credentials: [
        {
          type: "password",
          value: req.body.password || "TempPass123!",
          temporary: true,
        },
      ],
    }

    const createRes = await fetch(`${KEYCLOAK_URL}/admin/realms/${REALM}/users`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(newUser),
    })

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
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params
    const token = await getAdminToken()

    const updateRes = await fetch(`${KEYCLOAK_URL}/admin/realms/${REALM}/users/${id}`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(req.body),
    })

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
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params
    const token = await getAdminToken()

    const deleteRes = await fetch(`${KEYCLOAK_URL}/admin/realms/${REALM}/users/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    })

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

// 🚀 Récupérer les rôles du user connecté (via le token JWT)
router.get("/me/roles", (req, res) => {
  try {
    const authHeader = req.headers.authorization
    if (!authHeader) {
      return res.status(401).json({ error: "Token manquant" })
    }

    const tokenUser = authHeader.split(" ")[1]
    const decoded = jwt.decode(tokenUser)

    if (!decoded?.realm_access?.roles) {
      return res.json({ roles: [] })
    }

    res.json({ roles: decoded.realm_access.roles })
  } catch (err) {
    console.error("❌ Erreur /api/users/me/roles:", err.message)
    res.json({ roles: [] })
  }
})


// 🚀 Récupérer les rôles d’un utilisateur
router.get("/:id/roles", async (req, res) => {
  try {
    const { id } = req.params
    const token = await getAdminToken()

    const rolesRes = await fetch(
      `${KEYCLOAK_URL}/admin/realms/${REALM}/users/${id}/role-mappings/realm`,
      { headers: { Authorization: `Bearer ${token}` } }
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






// 🚀 Assigner des rôles à un utilisateur
router.post("/:id/roles", async (req, res) => {
  try {
    const { id } = req.params
    const { roles } = req.body
if (!Array.isArray(roles) || roles.length === 0) {
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

// 🚀 Supprimer des rôles d’un utilisateur
router.delete("/:id/roles", async (req, res) => {
  try {
    const { id } = req.params
    const { roles = [] } = req.body || {}   // 🔹 évite erreur si body vide

    if (!Array.isArray(roles)) {
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


export default router
