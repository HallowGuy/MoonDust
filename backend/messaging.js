import pool, { DB_SCHEMA } from "./db.js"
import jwt from "jsonwebtoken"
import jwksClient from "jwks-rsa"

// Utiliser l’URL interne Docker pour récupérer les clés
const client = jwksClient({
  jwksUri: `${process.env.KEYCLOAK_INTERNAL_URL}/realms/${process.env.REALM}/protocol/openid-connect/certs`,
})

function getKey(header, callback) {
  client.getSigningKey(header.kid, (err, key) => {
    if (err) return callback(err)
    const signingKey = key.getPublicKey()
    callback(null, signingKey)
  })
}

export default function messaging(io) {
  io.use((socket, next) => {
    console.log("⚡ Tentative connexion socket...")

    const token = socket.handshake.auth?.token
    if (!token) {
      console.error("❌ Aucun token transmis par le client")
      return next(new Error("No token provided"))
    }
    console.log("🔑 Token reçu (début):", token.slice(0, 30) + "...")

    // Vérification JWT avec l’issuer du token (URL front exposée)
    jwt.verify(
      token,
      getKey,
      {
        algorithms: ["RS256"],
        issuer: `${process.env.KEYCLOAK_FRONT_URL}/realms/${process.env.REALM}`,
      },
      (err, decoded) => {
        if (err) {
          console.error("❌ Erreur vérification token:", err.message)
          return next(new Error("Invalid token"))
        }

        if (decoded.azp !== process.env.FRONT_CLIENT_ID) {
          console.error(`❌ azp mismatch: attendu ${process.env.FRONT_CLIENT_ID}, reçu ${decoded.azp}`)
          return next(new Error("Invalid azp"))
        }

        console.log("✅ Token décodé:", {
          username: decoded.preferred_username,
          sub: decoded.sub,
          azp: decoded.azp,
          iss: decoded.iss,
        })

        socket.user = decoded
        next()
      }
    )
  })

  io.on("connection", (socket) => {
    console.log("✅ Connected:", socket.user?.preferred_username)

    socket.on("joinConversation", (convId) => {
      console.log(`➡️ ${socket.user?.preferred_username} joined ${convId}`)
      socket.join(convId)
    })

    socket.on("sendMessage", async ({ convId, content }) => {
      console.log("📩 Reçu sendMessage:", { convId, content, user: socket.user })

      try {
        const result = await pool.query(
          `INSERT INTO ${DB_SCHEMA}.messages (conversation_id, sender_id, content)
           VALUES ($1, $2, $3) RETURNING *`,
          [convId, socket.user.sub, content]
        )

        const message = result.rows[0]
        console.log("✅ Message stocké:", message)

        io.to(convId).emit("newMessage", {
          ...message,
          sender_username: socket.user.preferred_username,
        })
      } catch (err) {
        console.error("❌ Erreur sendMessage (DB):", err)
      }
    })
  })
}
