// src/components/MessengerContent.js
import React, { useEffect, useRef, useState } from "react"
import {
  CCard, CCardBody, CButton, CFormInput, CListGroup
} from "@coreui/react"
import CIcon from "@coreui/icons-react"
import { cilPlus, cilX } from "@coreui/icons"
import { io } from "socket.io-client"
import { jwtDecode } from "jwt-decode"
import Select from "react-select"
import { API_BASE, API_CONVERSATIONS, API_CONVERSATION_MESSAGES, API_BACKEND, API_CONVERSATION_READ } from "src/api"

const MessengerContent = ({ isWidget = false, startMode = "list" }) => {
  const [view, setView] = useState(startMode)
  const [conversations, setConversations] = useState([])
  const [messages, setMessages] = useState([])
  const [activeConv, setActiveConv] = useState(null)
  const [newMessage, setNewMessage] = useState("")
  const [users, setUsers] = useState([])
  const [selectedUser, setSelectedUser] = useState(null)
  const [firstMessage, setFirstMessage] = useState("")
  const messagesEndRef = useRef(null)
  const widgetRef = useRef(null)

  // --- Auth & socket
  const token = localStorage.getItem("access_token")
  let decoded = null
  try {
    decoded = token ? jwtDecode(token) : null
  } catch {
    decoded = null
  }
  const currentUserId = decoded?.sub || null
  const [socket, setSocket] = useState(null)


// Fermer en cliquant à l’extérieur
 

  useEffect(() => {
    if (token) {
      const s = io(API_BACKEND, { auth: { token } })
      setSocket(s)
      s.on("newMessage", (msg) => {
        if (msg?.conversation_id === activeConv?.id) {
          setMessages((prev) => [...prev, msg])
        }
        fetchConversations()
      })
      return () => s.disconnect()
    }
  }, [token, activeConv])

  const getAuthHeaders = () => ({
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  })

  // --- Fetch conversations
  const fetchConversations = async () => {
    try {
      const res = await fetch(`${API_CONVERSATIONS}/mine`, {
        headers: getAuthHeaders(),
      })
      const data = await res.json()
      setConversations(Array.isArray(data) ? data : [])
    } catch (err) {
      console.error("❌ Erreur fetch conversations:", err)
    }
  }

  useEffect(() => {
    fetchConversations()
  }, [])

  // --- Fetch users
  useEffect(() => {
    fetch(`${API_BASE}/keycloak-users`, {
      headers: getAuthHeaders(),
    })
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setUsers(data.filter((u) => u?.id !== currentUserId))
        }
      })
      .catch((err) => console.error("❌ Erreur fetch users:", err))
  }, [])

  // --- Ouvrir conversation
  const openConversation = async (conv) => {
    setActiveConv(conv)
    setView("conversation")
    try {
      await fetch(API_CONVERSATION_READ(conv.id), {
        method: "POST",
        headers: getAuthHeaders(),
      })
      const res = await fetch(API_CONVERSATION_MESSAGES(conv.id), {
        headers: getAuthHeaders(),
      })
      const data = await res.json()
      setMessages(Array.isArray(data) ? data : [])
      socket?.emit("joinConversation", conv.id)
      fetchConversations()
    } catch (err) {
      console.error("❌ Erreur openConversation:", err)
    }
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    if (view === "conversation") {
      scrollToBottom()
    }
  }, [messages, view])

  // --- Envoyer message
  const handleSendMessage = () => {
    if (!newMessage.trim() || !activeConv) return
    const tempMsg = {
      id: Date.now(),
      conversation_id: activeConv.id,
      sender_id: currentUserId,
      content: newMessage,
      created_at: new Date().toISOString(),
      sender_username: "Moi"
    }
    setMessages((prev) => [...prev, tempMsg])
    socket?.emit("sendMessage", { convId: activeConv.id, content: newMessage })
    setNewMessage("")
    fetchConversations()
  }

  // --- Créer nouvelle conversation
  const handleCreateConversation = async () => {
    if (!selectedUser) return
    try {
      const res = await fetch(API_CONVERSATIONS, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({ user1: currentUserId, user2: selectedUser.value }),
      })
      const conv = await res.json()
      setSelectedUser(null)
      setFirstMessage("")
      await fetchConversations()
      setActiveConv(conv)
      setView("conversation")

      if (firstMessage.trim()) {
        socket?.emit("sendMessage", { convId: conv?.id, content: firstMessage })
      }
    } catch (err) {
      console.error("❌ Erreur création conversation:", err)
    }
  }

  // --- UI
  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column" }}>
      {view === "list" && (
        <>
          
          <div style={{ overflowY: "auto", flex: 1, padding: "10px", }}>
            {conversations.length ? (
              conversations.map((conv) => {
                  console.log("participants:", conv.participants, "currentUserId:", currentUserId)

                const otherUser = conv.participants?.find((p) => p.id !== currentUserId)
                return (
                  <CCard key={conv.id} className="mb-2" style={{ cursor: "pointer" }} onClick={() => openConversation(conv)}>
                    <CCardBody className="d-flex justify-content-between align-items-center">
                      <div>
                        <h6 className="mb-0">{otherUser?.username || "Inconnu"}</h6>
                        <small className="text-muted">
  {conv.last_message
    ? `${conv.last_message.sender_username}: ${conv.last_message.content}`
    : "aucun message"}
</small>

                      </div>
                      {conv.unread_count > 0 && (
                        <span className="badge bg-danger">{conv.unread_count}</span>
                      )}
                    </CCardBody>
                  </CCard>
                )
              })
            ) : (
              <p className="text-muted">Aucune conversation</p>
            )}
            <CButton
        color="primary"
        className="rounded-circle shadow"
        style={{
          position: "absolute",
          bottom: "20px",
          right: "20px",
          width: "50px",
          height: "50px",
          borderRadius: "50%",
        }}
        onClick={() => setView("new")}
      >
        <CIcon icon={cilPlus} size="lg" />
      </CButton>

          </div>
        </>
      )}

      {view === "conversation" && (
        <>
          <div className="d-flex justify-content-between align-items-center mb-2">
            <CButton size="sm" onClick={() => { setView("list"); setActiveConv(null) }}>
              ← Retour
            </CButton>
            <h6>Conversation</h6>
          </div>
          <CListGroup className="mb-3" style={{ flex: 1, overflowY: "auto",padding: "10px"}}>
            {messages.length ? (
              messages.map((msg) => {
                const isMe = msg.sender_id === currentUserId
                return (
                  <div
                    key={msg.id}
                    className={`d-flex mb-2 ${isMe ? "justify-content-end" : "justify-content-start"}`}
                  >
                    <div
                      className="p-2 rounded-3"
                      style={{
                        maxWidth: "80%",
                        backgroundColor: isMe ? "#0d6efd" : "#e9ecef",
                        color: isMe ? "white" : "black",
                      }}
                    >
                      <div className="fw-bold small mb-1">{isMe ? "Moi" : msg.sender_username}</div>
                      <div>{msg.content}</div>
                      <div className="text-end small text-muted">
                        {new Date(msg.created_at).toLocaleTimeString()}
                      </div>
                    </div>
                  </div>
                )
              })
            ) : (
              <p className="text-muted">Aucun message</p>
            )}
            <div ref={messagesEndRef} />
          </CListGroup>
          <div className="d-flex gap-2">
            <CFormInput
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Écrire un message..."
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault()
                  handleSendMessage()
                }
              }}
            />
            <CButton color="primary" onClick={handleSendMessage}>Envoyer</CButton>
            
          </div>
        </>
      )}

      {view === "new" && (
        <>
          <div className="mb-3">
            <label color='' className="form-label text-muted">Sélectionner un utilisateur</label>
            <Select
              options={users.map((u) => ({ value: u.id, label: u.username }))}
              value={selectedUser}
              onChange={setSelectedUser}
            />
          </div>
          <div className="d-flex gap-2">
            <CFormInput
              value={firstMessage}
              onChange={(e) => setFirstMessage(e.target.value)}
              placeholder="Écrire un message…"
              onKeyDown={(e) => e.key === "Enter" && handleCreateConversation()}
            />
            <CButton color="primary" onClick={handleCreateConversation}>Envoyer</CButton>
            <CButton
        color="primary"
        className="rounded-circle shadow"
        style={{
          position: "absolute",
          bottom: "20px",
          right: "20px",
          width: "50px",
          height: "50px",
          borderRadius: "50%",
        }}
        onClick={() => setView("list")}
      >  <CIcon icon={cilX} size="lg" />

      </CButton>
          </div>
        </>
      )}
    </div>
  )
}

export default MessengerContent
