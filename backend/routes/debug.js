// routes/debug.js
import express from "express"
import jwt from "jsonwebtoken"
import { getAdminToken, KEYCLOAK_URL, REALM } from "../utils/keycloak.js"
import fetch from "node-fetch"

const router = express.Router()

router.get("/token", async (req, res) => {
  try {
    const authHeader = req.headers.authorization
    if (!authHeader) return res.status(401).json({ error: "Token manquant" })

    const tokenUser = authHeader.split(" ")[1]
    const decoded = jwt.decode(tokenUser)

    res.json({
      rawToken: tokenUser.substring(0, 50) + "...",
      decoded,
    })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

export default router
