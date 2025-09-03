import express from "express"
import fetch from "node-fetch"
import { getAdminToken, KEYCLOAK_URL, REALM } from "../utils/keycloak.js"

const router = express.Router()

// Fonction récursive pour compter tous les sous-groupes
async function countSubGroups(groups, token) {
  let total = 0
  for (const g of groups) {
    const childrenRes = await fetch(
      `${KEYCLOAK_URL}/admin/realms/${REALM}/groups/${g.id}/children`,
      { headers: { Authorization: `Bearer ${token}` } }
    )
    if (childrenRes.ok) {
      const children = await childrenRes.json()
      total += children.length
      total += await countSubGroups(children, token)
    }
  }
  return total
}

// 🚀 Stats groupes + sous-groupes
router.get("/stats", async (req, res) => {
  try {
    const token = await getAdminToken()
    const groupsRes = await fetch(`${KEYCLOAK_URL}/admin/realms/${REALM}/groups`, {
      headers: { Authorization: `Bearer ${token}` },
    })

    if (!groupsRes.ok) throw new Error(`Erreur Keycloak: ${groupsRes.status}`)
    const groups = await groupsRes.json()

    const totalGroups = groups.length
    const totalSubGroups = await countSubGroups(groups, token)

    res.json({ groups: totalGroups, subGroups: totalSubGroups })
  } catch (err) {
    console.error("❌ Erreur /api/groupes/stats:", err.message)
    res.status(500).json({ error: err.message })
  }
})

// ✅ Lister tous les groupes
router.get("/", async (req, res) => {
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

// 🚀 Créer un groupe
router.post("/", async (req, res) => {
  try {
    const token = await getAdminToken()
    const { name, subGroups = [] } = req.body
    if (!name) return res.status(400).json({ error: "Le nom du groupe est requis" })

    const kcRes = await fetch(`${KEYCLOAK_URL}/admin/realms/${REALM}/groups`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name }),
    })

    if (!kcRes.ok) {
      const err = await kcRes.text()
      return res.status(kcRes.status).json({ error: err })
    }

    const location = kcRes.headers.get("Location")
    const groupId = location?.split("/").pop()

    for (const sg of subGroups) {
      await fetch(`${KEYCLOAK_URL}/admin/realms/${REALM}/groups/${groupId}/children`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name: sg }),
      })
    }

    res.status(201).json({ success: true, id: groupId })
  } catch (err) {
    console.error("❌ Erreur création groupe:", err)
    res.status(500).json({ error: err.message })
  }
})

// ✅ Modifier un groupe
router.put("/:id", async (req, res) => {
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
router.delete("/:id", async (req, res) => {
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

// 🚀 Récupérer les utilisateurs d’un groupe
router.get("/:id/users", async (req, res) => {
  try {
    const { id } = req.params
    const token = await getAdminToken()

    const usersRes = await fetch(`${KEYCLOAK_URL}/admin/realms/${REALM}/groups/${id}/members`, {
      headers: { Authorization: `Bearer ${token}` },
    })

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

// ✅ Récupérer les sous-groupes d’un groupe
router.get("/:id/subgroups", async (req, res) => {
  try {
    const token = await getAdminToken()
    const { id } = req.params

    const subgroupsRes = await fetch(`${KEYCLOAK_URL}/admin/realms/${REALM}/groups/${id}/children`, {
      headers: { Authorization: `Bearer ${token}` },
    })

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

// 🚀 Créer un sous-groupe
router.post("/:id/subgroups", async (req, res) => {
  try {
    const token = await getAdminToken()
    const { id } = req.params
    const { name } = req.body

    const createRes = await fetch(`${KEYCLOAK_URL}/admin/realms/${REALM}/groups/${id}/children`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name }),
    })

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

export default router
