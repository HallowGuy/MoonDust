import React, { useEffect, useState, useRef } from "react"
import {
  CCard, CCardHeader, CCardBody, CButton,
  CFormInput,
  COffcanvas, COffcanvasHeader, COffcanvasBody,
  CListGroup, CListGroupItem
} from "@coreui/react"
import { io } from "socket.io-client"
import { jwtDecode } from "jwt-decode"
import Select from "react-select"



const Messenger = () => {
  const [conversations, setConversations] = useState([])
  const [messages, setMessages] = useState([])
  const [activeConv, setActiveConv] = useState(null)
  const [newMessage, setNewMessage] = useState([])
  const [users, setUsers] = useState([])
  const [selectedUser, setSelectedUser] = useState(null)
  const [firstMessage, setFirstMessage] = useState("")
  const [visibleNew, setVisibleNew] = useState(false)
  const [visibleConv, setVisibleConv] = useState(false)
const messagesEndRef = useRef(null)

  const token = localStorage.getItem("access_token")
  let decoded = null
  try {
    decoded = token ? jwtDecode(token) : null
  } catch (err) {
    console.error("❌ Erreur décodage JWT:", err)
    decoded = null
  }
  const currentUserId = decoded?.sub || null

  // --- socket.io
  const [socket, setSocket] = useState(null)
  useEffect(() => {
    if (token) {
      const s = io("http://localhost:5001", { auth: { token } })
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

  // --- Charger mes conversations
  const fetchConversations = async () => {
    try {
      const res = await fetch("http://localhost:5001/api/conversations/mine", {
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

  // --- Charger utilisateurs
  useEffect(() => {
    fetch("http://localhost:5001/api/keycloak-users", {
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
    setVisibleConv(true)
    try {
      await fetch(`http://localhost:5001/api/conversations/${conv.id}/read`, {
        method: "POST",
        headers: getAuthHeaders(),
      })

      const res = await fetch(`http://localhost:5001/api/conversations/${conv.id}/messages`, {
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
  if (visibleConv) {
    scrollToBottom()
  }
}, [messages, visibleConv])
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
  }

  // --- Créer nouvelle conversation
  const handleCreateConversation = async () => {
    if (!selectedUser) return
    try {
      const res = await fetch("http://localhost:5001/api/conversations", {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({ user1: currentUserId, user2: selectedUser.value }),
      })
      const conv = await res.json()
      setVisibleNew(false)
      setSelectedUser(null)
      setFirstMessage("")

      await fetchConversations()

      if (firstMessage.trim()) {
        socket?.emit("sendMessage", { convId: conv?.id, content: firstMessage })
      }
    } catch (err) {
      console.error("❌ Erreur création conversation:", err)
    }
  }

  return (
    <div className="container py-4">
      <CCard className="mb-4">
        <CCardHeader className="d-flex justify-content-between align-items-center">
          <span>Mes conversations</span>
          <CButton color="primary" onClick={() => setVisibleNew(true)}>
            Nouvelle conversation
          </CButton>
        </CCardHeader>

        <CCardBody>
          <div>
            {conversations.length ? (
              conversations.map((conv) => {
                const otherUser = conv.participants?.find((p) => p !== currentUserId)
    const lastMessage = conv.last_message || conv.messages?.slice(-1)[0]

                return (
                  <CCard
                    key={conv.id}
                    className="mb-2"
                    style={{ cursor: "pointer" }}
                    onClick={() => openConversation(conv)}
                  >
                    <CCardBody className="d-flex justify-content-between align-items-center">
                      <div>
                        <h6 className="mb-0">{otherUser || "Inconnu"}</h6>
                        <small className="text-muted">
                         {lastMessage?.created_at
                ? new Date(lastMessage.created_at).toLocaleString()
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
          </div>
        </CCardBody>
      </CCard>

      {/* --- OFFCANVAS Conversation --- */}
      <COffcanvas
        placement="end"
        visible={visibleConv}
        onHide={() => setVisibleConv(false)}
        style={{ width: "25%" }}
      >
        <COffcanvasHeader>
          <h5>
            Conversation avec{" "}
            {activeConv?.participants?.find((p) => p !== currentUserId) || "inconnu"}
          </h5>
        </COffcanvasHeader>
        <COffcanvasBody>
          <CListGroup className="mb-3" style={{ maxHeight: "60vh", overflowY: "auto" }}>
  {messages.length ? (
    messages.map((msg) => {
      const isMe = msg.sender_id === currentUserId
      return (
        <div
          key={msg.id}
          className={`d-flex mb-2 ${isMe ? "justify-content-end" : "justify-content-start"}`}
        >
          <div
            className={`p-2 rounded-3`}
            style={{
              maxWidth: "100%",
              backgroundColor: isMe ? "#0d6efd" : "#e9ecef",
              color: isMe ? "white" : "black",
              borderRadius: "1rem",
            }}
          >
            <div className="fw-bold" style={{ fontSize: "0.85rem" }}>
              {isMe ? "Moi" : msg.sender_username}
            </div>
            <div>{msg.content}</div>
            <div className="text-end" style={{ fontSize: "0.7rem", opacity: 0.7 }}>
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
      e.preventDefault() // évite le saut de ligne
      handleSendMessage()
    }
  }}
/>

            <CButton color="primary" onClick={handleSendMessage}>
              Envoyer
            </CButton>
          </div>
        </COffcanvasBody>
      </COffcanvas>

      {/* --- OFFCANVAS Nouvelle conversation --- */}
      <COffcanvas
  placement="end"
  visible={visibleNew}
  onHide={() => {
    setVisibleNew(false)
    setSelectedUser(null)
    setFirstMessage("")
    setMessages([])
    setActiveConv(null)
  }}
  style={{ width: "30%" }}
>
  <COffcanvasHeader className="border-bottom">
    <h5 className="mb-0">Nouvelle conversation</h5>
  </COffcanvasHeader>
  <COffcanvasBody className="d-flex flex-column" style={{ height: "100%" }}>
    {/* Choix utilisateur */}
    {!activeConv && (
      <div className="mb-3">
        <label className="form-label">Sélectionner un utilisateur</label>
        <Select
          options={users.map((u) => ({ value: u.id, label: u.username }))}
          value={selectedUser}
          onChange={setSelectedUser}
        />
      </div>
    )}

    {/* Fil de discussion (après création conv) */}
    {activeConv && (
      <div className="flex-grow-1 mb-3" style={{ overflowY: "auto", maxHeight: "60vh" }}>
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
                  <div className="text-end small text-muted">{new Date(msg.created_at).toLocaleTimeString()}</div>
                </div>
              </div>
            )
          })
        ) : (
          <p className="text-muted">Aucun message pour l’instant…</p>
        )}
      </div>
    )}

    {/* Zone de saisie */}
    <div className="d-flex gap-2">
      <CFormInput
        value={firstMessage}
        onChange={(e) => setFirstMessage(e.target.value)}
        placeholder="Écrire un message…"
        onKeyDown={(e) => e.key === "Enter" && handleCreateConversation()}
      />
      <CButton color="primary" onClick={handleCreateConversation}>
        Envoyer
      </CButton>
    </div>
  </COffcanvasBody>
</COffcanvas>

    </div>
  )
}

export default Messenger
