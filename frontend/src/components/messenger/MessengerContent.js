// src/components/MessengerContent.js
import React, { useEffect, useRef, useState, useCallback } from "react"
import {
  CCard, CCardBody, CButton, CFormInput, CListGroup, CFormTextarea,CModal, CModalHeader, CModalTitle, CModalBody, CModalFooter
} from "@coreui/react"
import CIcon from "@coreui/icons-react"
import { cilPlus, cilArrowCircleLeft,cilInfo, cilTrash } from "@coreui/icons"
import { io } from "socket.io-client"
import { jwtDecode } from "jwt-decode"
import Select from "react-select"
import {
  API_BASE,
  API_CONVERSATIONS,
  API_CONVERSATION_MESSAGES,
  API_BACKEND,
  API_CONVERSATION_READ
} from "src/api"
import { fetchWithAuth } from "../../utils/auth"
import EmojiPicker from "emoji-picker-react"

const TZ = "Indian/Reunion"
const LOCALE = "fr-FR"

const parseAPITimestamp = (raw) => {
  if (raw == null) return null
  if (typeof raw === "number") return new Date(raw < 1e12 ? raw * 1000 : raw)
  if (typeof raw === "string") {
    const s = raw.trim()
    if (/[zZ]$|[+-]\d{2}:\d{2}$/.test(s)) return new Date(s)
    const m = s.match(/^(\d{4})-(\d{2})-(\d{2})[T\s](\d{2}):(\d{2})(?::(\d{2})(?:\.(\d{1,6}))?)?$/)
    if (m) return new Date(s.replace(" ", "T") + "Z")
    return new Date(s)
  }
  return new Date(raw)
}
const formatHM = (d) =>
  d.toLocaleTimeString(LOCALE, { hour: "2-digit", minute: "2-digit", timeZone: TZ })
const isToday = (d) => {
  const ymd = (x) => x.toLocaleDateString("en-CA", { timeZone: TZ })
  return ymd(d) === ymd(new Date())
}
const formatConvDate = (d) =>
  isToday(d) ? formatHM(d) : d.toLocaleDateString(LOCALE, { timeZone: TZ })
const formatMsgTime = (iso) => formatHM(parseAPITimestamp(iso))

const customStyles = {
  control: (base) => ({
    ...base,
    backgroundColor: "#2b2f3a",
    borderColor: "#444",
    color: "#f1f1f1",
  }),
  menu: (base) => ({
    ...base,
    backgroundColor: "#2b2f3a",
    color: "#f1f1f1",
  }),
  option: (base, state) => ({
    ...base,
    backgroundColor: state.isFocused ? "#3b3f4a" : "#2b2f3a",
    color: "#f1f1f1",
  }),
  multiValue: (base) => ({ ...base, backgroundColor: "#3b3f4a" }),
  multiValueLabel: (base) => ({ ...base, color: "#f1f1f1" }),
  input: (base) => ({ ...base, color: "#f1f1f1" }),
  singleValue: (base) => ({ ...base, color: "#f1f1f1" }),
}

const MessengerContent = ({ isWidget = false, startMode = "list" }) => {
  const [view, setView] = useState(startMode)
  const [conversations, setConversations] = useState([])
  const [messages, setMessages] = useState([])
  const [loadingMessages, setLoadingMessages] = useState(false)
  const [activeConv, setActiveConv] = useState(null)

  const [newMessage, setNewMessage] = useState("")
  const messagesEndRef = useRef(null)

  // New conversation (multi)
  const [users, setUsers] = useState([])
  const [selectedUsers, setSelectedUsers] = useState([]) // [{value, label}]
  const [groupTitle, setGroupTitle] = useState("")
  const [firstMessage, setFirstMessage] = useState("")

  // Emoji pickers
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const newMsgInputRef = useRef(null)
  const emojiBtnRef = useRef(null)
  const emojiPickerRef = useRef(null)

  const [showEmojiPickerNew, setShowEmojiPickerNew] = useState(false)
  const firstMsgInputRef = useRef(null)
  const emojiBtnNewRef = useRef(null)
  const emojiPickerNewRef = useRef(null)
  
const [showDetails, setShowDetails] = useState(false)
const [convSummary, setConvSummary] = useState(null)
const [deletingId, setDeletingId] = useState(null)

  const token = localStorage.getItem("access_token")
  let decoded = null
  try { decoded = token ? jwtDecode(token) : null } catch { decoded = null }
  const currentUserId = decoded?.sub || null
  const [socket, setSocket] = useState(null)

  const getAuthHeaders = () => ({
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  })

  const fetchConvSummary = useCallback(async (convId) => {
  const res = await fetchWithAuth(`${API_CONVERSATIONS}/${convId}/summary`, { headers: getAuthHeaders() })
  const data = await res.json()
  setConvSummary(data)
}, [])

  const getConvDisplayName = (conv) => {
    if (conv?.is_group) return conv?.title ||
      (conv?.participants || [])
        .filter(p => String(p.id) !== String(currentUserId))
        .map(p => p.username)
        .join(", ")
    // 1-1
    const other = conv?.participants?.find(p => String(p.id) !== String(currentUserId))
    return other?.username || "Conversation"
  }

  // Lecture: statut par message (multi)
  const statusForMyMessage = (msg) => {
    if (String(msg.sender_id) !== String(currentUserId)) return null
    const readCount = Number(msg.read_count || 0)
    const recipientCount = Number(msg.recipient_count || 0)
    if (recipientCount <= 0) return "sent"
    if (readCount === 0) return "sent"
    if (readCount < recipientCount) return "partial"
    return "read"
  }

  // Emoji util
  const addEmojiToInput = (ref, setValue, emojiStr) => {
    const el = ref.current
    if (el) el.focus()
    setValue((prev) => {
      const input = ref.current
      const start = input?.selectionStart ?? prev.length
      const end = input?.selectionEnd ?? prev.length
      const next = prev.slice(0, start) + emojiStr + prev.slice(end)
      requestAnimationFrame(() => {
        if (input) {
          const pos = start + emojiStr.length
          input.setSelectionRange(pos, pos)
          input.focus()
        }
      })
      return next
    })
  }
// --- Conversations
  const fetchConversations = useCallback(async () => {
    try {
      const res = await fetchWithAuth(`${API_CONVERSATIONS}/mine`, { headers: getAuthHeaders() })
      const data = await res.json()
      setConversations(Array.isArray(data) ? data : [])
    } catch (err) {
      console.error("❌ Erreur fetch conversations:", err)
    }
  }, [])

  useEffect(() => { fetchConversations() }, [fetchConversations])

  // --- Rafraîchir les messages de la conv active
  const refreshActiveMessages = useCallback(
    async (convId = activeConv?.id) => {
      if (!convId) return
      const res = await fetchWithAuth(API_CONVERSATION_MESSAGES(convId), { headers: getAuthHeaders() })
      const data = await res.json()
      setMessages(Array.isArray(data) ? data : [])
    },
    [activeConv?.id]
  )
const sendMessageToConv = useCallback(async (conv, content) => {
  if (!conv || !content?.trim()) return

  // ajout optimiste dans l’UI
  const tempMsg = {
    id: `temp-${Date.now()}`,
    conversation_id: conv.id,
    sender_id: currentUserId,
    content,
    created_at: new Date().toISOString(),
    sender_username: "Moi",
    // pour le rendu multi (✓/✓✓)
    read_count: 0,
    recipient_count: Math.max((conv?.participants?.length || 1) - 1, 0),
  }
  setMessages(prev => [...prev, tempMsg])

  // envoi socket
  socket?.emit("sendMessage", { convId: conv.id, content })

  // on actualise le panneau de listes (unread, etc.)
  fetchConversations()
}, [socket, currentUserId, fetchConversations])

  // --- Sockets
  useEffect(() => {
    if (!token) return
    const s = io(API_BACKEND, { auth: { token } })
    setSocket(s)

    s.on("newMessage", async (msg) => {
      if (msg?.conversation_id === activeConv?.id) {
        await refreshActiveMessages(activeConv.id)
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
      }
      fetchConversations()
    })

    return () => s.disconnect()
  }, [token, activeConv, refreshActiveMessages])

  
  // Poll dans une conv ouverte
  useEffect(() => {
    if (view !== "conversation" || !activeConv) return
    const id = setInterval(() => {
      fetchConversations()
      refreshActiveMessages(activeConv.id)
    }, 5000)
    return () => clearInterval(id)
  }, [view, activeConv, fetchConversations, refreshActiveMessages])

  // --- Users pour créer un groupe
  useEffect(() => {
    fetchWithAuth(`${API_BASE}/keycloak-users`, { headers: getAuthHeaders() })
      .then((r) => r.json())
      .then((data) => {
        const arr = (Array.isArray(data) ? data : []).filter(u => String(u.id) !== String(currentUserId))
        setUsers(arr)
      })
      .catch((e) => console.error("❌ Erreur fetch users:", e))
  }, [])

  // --- Ouvrir une conversation
  const openConversation = async (conv) => {
    setActiveConv(conv)
    setView("conversation")
    try {
      setLoadingMessages(true)
      await fetchWithAuth(API_CONVERSATION_READ(conv.id), { method: "POST", headers: getAuthHeaders() })
      await refreshActiveMessages(conv.id)
      setLoadingMessages(false)
      socket?.emit("joinConversation", conv.id)
      fetchConversations()
    } catch (err) {
      setLoadingMessages(false)
      console.error("❌ Erreur openConversation:", err)
    }
  }

  useEffect(() => {
    if (view === "conversation") {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
    }
  }, [messages, view])

  // --- Envoyer un message
  const handleSendMessage = () => {
    if (!newMessage.trim() || !activeConv) return
    sendMessageToConv(activeConv, newMessage)
    setNewMessage("")
  }

  // --- Créer conversation (groupe ou 1-1)
  const handleCreateConversation = async () => {
    const participantIds = [currentUserId, ...selectedUsers.map(u => u.value)]
    if (participantIds.length < 2) return
    try {
      const res = await fetchWithAuth(API_CONVERSATIONS, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({ participant_ids: participantIds, title: groupTitle || null }),
      })
      if (!res.ok) throw new Error("Création de la conversation impossible")
      const conv = await res.json()

      setSelectedUsers([])
      setGroupTitle("")
      await fetchConversations()
      await openConversation(conv)

      if (firstMessage.trim()) {
        await Promise.resolve()
        await sendMessageToConv(conv, firstMessage)
        setFirstMessage("")
      }
    } catch (err) {
      console.error("❌ Erreur création conversation:", err)
    }
  }

  const userOptions = users.map(u => ({ value: u.id, label: u.username }))

  // --- UI
  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column" }}>
      {view === "list" && (
        <>
          <div style={{ overflowY: "auto", flex: 1 }}>
            {conversations.length ? (
              conversations.map((conv) => {
                const last = conv.last_message
                const lastDate = last?.created_at ? parseAPITimestamp(last.created_at) : null
                return (
                  <CCard key={conv.id} className="mb-2" style={{ cursor: "pointer" }} onClick={() => openConversation(conv)}>
                    <CCardBody className="d-flex justify-content-between align-items-center">
                      <div>
                        <h6 className="mb-0">{getConvDisplayName(conv)}</h6>
                        <small className="text-muted d-block">
                          {last ? `${last.sender_username}: ${last.content}` : "aucun message"}
                        </small>
                        {lastDate && (
                          <small className="text-muted d-block">
                            {formatConvDate(lastDate)}
                          </small>
                        )}
                      </div>
                      {conv.unread_count > 0 && (
                        <span className="badge bg-danger">{conv.unread_count}</span>
                      )}
                      <CButton
                        color="danger"
                        variant="ghost"
                        size="sm"
                        title="Supprimer la conversation"
                        disabled={deletingId === conv.id}
                        onClick={async (e) => {
                          e.stopPropagation()
                          if (!window.confirm("Supprimer cette conversation pour tous les participants ?")) return
                          try {
                            setDeletingId(conv.id)
                            const res = await fetchWithAuth(`${API_CONVERSATIONS}/${conv.id}`, {
                              method: "DELETE",
                              headers: getAuthHeaders(),
                            })
                            if (!res.ok) throw new Error("Suppression impossible")
                            if (activeConv?.id === conv.id) {
                              setActiveConv(null)
                              setView("list")
                              setMessages([])
                            }
                            await fetchConversations()
                          } catch (err) {
                            console.error("❌ Erreur suppression:", err)
                          } finally {
                            setDeletingId(null)
                          }
                        }}
                      >
                        <CIcon icon={cilTrash} />
                      </CButton>
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
              style={{ position: "absolute", bottom: "20px", left: "20px", width: 44, height: 44, borderRadius: "50%" }}
              onClick={() => setView("new")}
              title="Nouvelle conversation"
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
              <CIcon icon={cilArrowCircleLeft} size="lg" />
            </CButton>
            <h6 className="mb-0">{getConvDisplayName(activeConv)}</h6>
            <div className="d-flex align-items-center" style={{ gap: 8 }}>
              <h6 className="mb-0">{getConvDisplayName(activeConv)}</h6>
              <CButton
                color="secondary"
                variant="ghost"
                size="sm"
                title="Infos conversation"
                onClick={async () => {
                  if (!activeConv?.id) return
                  await fetchConvSummary(activeConv.id)
                  setShowDetails(true)
                }}
              >
                <CIcon icon={cilInfo} />
              </CButton>
            </div>
          </div>

          <CListGroup className="mb-3" style={{ flex: 1, overflowY: "auto" }}>
            {loadingMessages ? (
              <p className="text-muted">Chargement…</p>
            ) : messages.length ? (
              messages.map((msg) => {
                const isMe = String(msg.sender_id) === String(currentUserId)
                const status = statusForMyMessage(msg) // null | sent | partial | read

                return (
                  <div key={msg.id} className={`d-flex mb-2 ${isMe ? "justify-content-end" : "justify-content-start"}`}>
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

                      <div className="small d-flex align-items-center justify-content-end" style={{ gap: 6, opacity: 0.85 }}>
                        <span className={isMe ? "text-white-50" : "text-muted"}>{formatMsgTime(msg.created_at)}</span>
                        {isMe && (
                          <span
                            title={
                              status === "read" ? "Lu par tous"
                                : status === "partial" ? "Lu par certains destinataires"
                                : "Envoyé"
                            }
                            style={{
                              fontSize: "0.85rem",
                              lineHeight: 1,
                              marginLeft: 2,
                              userSelect: "none",
                              color:
                                status === "read" ? "#bde0ff" :
                                status === "partial" ? "#d0d0d0" :
                                "#e6e6e6",
                            }}
                          >
                            {status === "sent" ? "✓" : "✓✓"}
                          </span>
                        )}
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

          {/* Composer */}
          <div className="d-flex gap-2">
            <CFormTextarea
              ref={newMsgInputRef}
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Écrire un message…"
              rows={2}
              style={{ resize: "none" }}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault()
                  handleSendMessage()
                }
              }}
            />

            <div className="d-flex justify-content-between align-items-center mt-2 position-relative">
              <div className="position-relative">
                <CButton
                  ref={emojiBtnRef}
                  color="secondary"
                  variant="ghost"
                  onClick={() => setShowEmojiPicker((v) => !v)}
                  title="Insérer un emoji"
                >
                  🙂
                </CButton>

                {showEmojiPicker && (
                  <div
                    ref={emojiPickerRef}
                    className="position-absolute"
                    style={{ left: 0, bottom: "calc(100% + 8px)", zIndex: 3000 }}
                    onMouseDown={(e) => e.stopPropagation()}
                  >
                    <EmojiPicker
                      height={320}
                      width={320}
                      lazyLoadEmojis
                      theme="auto"
                      onEmojiClick={(emojiData) => {
                        addEmojiToInput(newMsgInputRef, setNewMessage, emojiData.emoji)
                        setShowEmojiPicker(false)
                      }}
                    />
                  </div>
                )}
              </div>

              <CButton color="primary" onClick={handleSendMessage}>Envoyer</CButton>
            </div>
          </div>
        </>
      )}

      {view === "new" && (
        <div className="d-flex flex-column" style={{ flex: 1, minHeight: 0 }}>
          <div className="mb-2 d-flex align-items-center">
            <CButton size="sm" onClick={() => { setView("list"); setActiveConv(null) }}>
              <CIcon icon={cilArrowCircleLeft} size="lg" />
            </CButton>
            <h6 className="mb-0 ms-2">Nouvelle conversation</h6>
          </div>

          <div className="mb-3">
            <label className="form-label">Participants</label>
            <Select
              isMulti
              options={userOptions}
              value={selectedUsers}
              onChange={setSelectedUsers}
              styles={customStyles}
              placeholder="Choisir un ou plusieurs utilisateurs…"
            />
            <small className="text-muted d-block mt-1">
              Vous êtes ajouté automatiquement.
            </small>
          </div>

          <div className="mb-3">
            <label className="form-label">Nom du groupe (optionnel)</label>
            <CFormInput value={groupTitle} onChange={(e) => setGroupTitle(e.target.value)} placeholder="Ex: Équipe Produit" />
          </div>

          <CFormTextarea
            ref={firstMsgInputRef}
            value={firstMessage}
            onChange={(e) => setFirstMessage(e.target.value)}
            placeholder="Premier message…"
            rows={2}
            style={{ resize: "none" }}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault()
                handleCreateConversation()
              }
            }}
          />

          <div className="d-flex justify-content-between align-items-center mt-2 position-relative">
            <div className="position-relative">
              <CButton
                ref={emojiBtnNewRef}
                color="secondary"
                variant="ghost"
                onClick={() => setShowEmojiPickerNew((v) => !v)}
                title="Insérer un emoji"
              >
                🙂
              </CButton>

              {showEmojiPickerNew && (
                <div
                  ref={emojiPickerNewRef}
                  className="position-absolute"
                  style={{ left: 0, bottom: "calc(100% + 8px)", zIndex: 3000 }}
                  onMouseDown={(e) => e.stopPropagation()}
                >
                  <EmojiPicker
                    height={320}
                    width={320}
                    lazyLoadEmojis
                    theme="auto"
                    onEmojiClick={(emojiData) => {
                      addEmojiToInput(firstMsgInputRef, setFirstMessage, emojiData.emoji)
                      setShowEmojiPickerNew(false)
                    }}
                  />
                </div>
              )}
            </div>

            <CButton color="primary" onClick={handleCreateConversation}>Créer</CButton>
          </div>
        </div>
      )}
      <CModal visible={showDetails} onClose={() => setShowDetails(false)} alignment="center" size="lg">
  <CModalHeader>
    <CModalTitle>Infos conversation</CModalTitle>
  </CModalHeader>
  <CModalBody>
    {!convSummary ? (
      <p className="text-muted">Chargement…</p>
    ) : (
      <>
        <div className="mb-2">
          <strong>Nom</strong><br />
          {convSummary.is_group ? (convSummary.title || "(Groupe)") : getConvDisplayName(activeConv)}
        </div>

        <div className="mb-2">
          <strong>Participants ({convSummary.participants_count})</strong>
          <ul className="mt-1 mb-0">
            {convSummary.participants?.map(p => (
              <li key={p.id}>{p.username}</li>
            ))}
          </ul>
        </div>

        <div className="mb-2">
          <strong>Messages</strong><br />
          {convSummary.messages_count}
        </div>

        <div className="mb-2">
          <strong>Créée le</strong><br />
          {convSummary.created_at ? formatConvDate(parseAPITimestamp(convSummary.created_at)) : "-"}
        </div>

        <div className="mb-0">
          <strong>Dernier message</strong><br />
          {convSummary.last_message_at ? formatConvDate(parseAPITimestamp(convSummary.last_message_at)) : "-"}
        </div>
      </>
    )}
  </CModalBody>
  <CModalFooter>
    <CButton color="secondary" onClick={() => setShowDetails(false)}>Fermer</CButton>
  </CModalFooter>
</CModal>

    </div>
  )
}

export default MessengerContent
