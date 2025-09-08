import React, { useEffect, useState } from "react"
import { useParams } from "react-router-dom"
import { io } from "socket.io-client"
import axios from "axios"

export default function Chat() {
  const { conversationId } = useParams()
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState("")
  const [socket, setSocket] = useState(null)

  useEffect(() => {
    const token = localStorage.getItem("access_token")
    if (!conversationId || !token) return

    console.log("🔑 Token trouvé, connexion à Socket.IO")

    const newSocket = io("http://localhost:5001", {
      auth: { token },
      transports: ["websocket"],
    })
    setSocket(newSocket)

    // rejoindre la conversation
    newSocket.emit("joinConversation", conversationId)

    // récupérer l’historique
    axios
      .get(`http://localhost:5001/api/messages/${conversationId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setMessages(res.data))
      .catch((err) => console.error("❌ Erreur chargement messages:", err))

    // écouter les nouveaux messages
    newSocket.on("newMessage", (msg) => {
      if (msg.conversation_id === conversationId) {
        setMessages((prev) => [...prev, msg])
      }
    })

    return () => newSocket.disconnect()
  }, [conversationId])

  const sendMessage = () => {
    if (input.trim() && socket) {
      console.log("📤 Envoi message:", input)
      socket.emit("sendMessage", {
        convId: conversationId,
        content: input,
      })
      setInput("")
    }
  }

  return (
    <div style={{ maxWidth: 600, margin: "1rem auto" }}>
      <h3>Conversation {conversationId}</h3>

      <div
        style={{
          border: "1px solid #ccc",
          padding: 10,
          height: 300,
          overflowY: "auto",
        }}
      >
        {messages.length === 0 && <p>Aucun message pour l’instant</p>}
        {messages.map((m) => (
          <div key={m.id}>
            <b>{m.sender_username || m.sender_id}</b>: {m.content}
          </div>
        ))}
      </div>

      <div style={{ display: "flex", marginTop: "0.5rem" }}>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          style={{ flex: 1, padding: "0.5rem" }}
          placeholder="Écrire un message..."
        />
        <button
          onClick={sendMessage}
          style={{ marginLeft: "0.5rem", padding: "0.5rem 1rem" }}
        >
          Envoyer
        </button>
      </div>
    </div>
  )
}
