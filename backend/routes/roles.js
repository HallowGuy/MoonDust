import express from "express"
import fetch from "node-fetch"
import { getAdminToken, KEYCLOAK_URL, REALM } from "../utils/keycloak.js"

const router = express.Router()

// 🚀 Nombre total de rôles
router.get("/count", async (req, res) => {
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

// 🚀 Lister tous les rôles
router.get("/", async (req, res) => {
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

// 🚀 Créer un rôle
router.post("/", async (req, res) => {
  try {
    const token = await getAdminToken()
    const createRes = await fetch(
      `${KEYCLOAK_URL}/admin/realms/${REALM}/roles`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(req.body),
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
router.put("/:name", async (req, res) => {
  try {
    const { name } = req.params
    const token = await getAdminToken()

    const updateRes = await fetch(
      `${KEYCLOAK_URL}/admin/realms/${REALM}/roles/${name}`,
      {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(req.body),
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
router.delete("/:name", async (req, res) => {
  try {
    const { name } = req.params
    const token = await getAdminToken()

    const deleteRes = await fetch(
      `${KEYCLOAK_URL}/admin/realms/${REALM}/roles/${name}`,
      {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
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
router.get("/:roleName/users", async (req, res) => {
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

export default router
