import React, { useEffect, useState, useMemo } from "react"
import { CButton, CFormInput } from "@coreui/react"
import { useEditor, EditorContent } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import Mention from "@tiptap/extension-mention"
import tippy from "tippy.js"
import "tippy.js/dist/tippy.css"
import "tippy.js/animations/scale.css"
import { API_NOTES, API_NOTES_BY_CONTACT, API_BASE } from "src/api"
import { jwtDecode } from "jwt-decode"
import { fetchWithAuth } from "../../utils/auth";

// ----------------- UTILS -----------------

const getTextFromTipTap = (node) => {
  if (!node) return ""
  if (typeof node === "string") return node

  let text = ""
  if (node.type === "text" && node.text) {
    text += node.text
  }
  if (node.content && Array.isArray(node.content)) {
    node.content.forEach((child) => {
      text += getTextFromTipTap(child)
    })
  }
  return text
}

const extractMentions = (json) => {
  const mentions = []

  const traverse = (node) => {
    if (!node) return
    if (node.type === "mention" && node.attrs?.id) {
      mentions.push(node.attrs.id)
    }
    if (node.content) {
      node.content.forEach(traverse)
    }
  }

  traverse(json)
  return mentions
}

const fetchUsers = async (query) => {
  if (!query || query.length < 3) return []
  try {
    const res = await fetchWithAuth(`${API_BASE}/keycloak-users/search?q=${query}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("access_token")}`,
      },
    })
    if (!res.ok) throw new Error("Erreur API Keycloak")
    const users = await res.json()
    return users
      .filter((u) => u && u.username)
      .map((u) => ({
        id: String(u.username),
        label: String(u.username),
      }))
  } catch (err) {
    console.error(err)
    return []
  }
}

// ----------------- SUB COMPONENTS -----------------

const ReplyEditor = ({ onSubmit, onCancel }) => {
  const replyEditor = useEditor({
    extensions: [
      StarterKit,
      Mention.configure({
        HTMLAttributes: { class: "mention" },
        suggestion: {
          items: async ({ query }) => {
            return await fetchUsers(query)
          },
          render: () => {
            let popup
            let dom
            let selectedIndex = 0
            let items = []
            let commandFn

            const renderItems = () => {
              dom.innerHTML = ""
              items.forEach((item, index) => {
                const el = document.createElement("div")
                el.classList.add("mention-item")
                if (index === selectedIndex) el.classList.add("is-selected")
                el.textContent = item.label
                el.onclick = () => commandFn(item)
                dom.appendChild(el)
              })
            }

            return {
              onStart: (props) => {
                dom = document.createElement("div")
                dom.classList.add("mention-dropdown")

                commandFn = props.command
                items = props.items

                popup = tippy("body", {
                  getReferenceClientRect: props.clientRect,
                  appendTo: () => document.body,
                  content: dom,
                  showOnCreate: true,
                  interactive: true,
                  trigger: "manual",
                  placement: "bottom-start",
                  animation: "scale",
                })

                selectedIndex = 0
                renderItems()
              },
              onUpdate: (props) => {
                commandFn = props.command
                items = props.items
                selectedIndex = 0
                renderItems()
              },
              onKeyDown: (props) => {
                if (props.event.key === "ArrowDown") {
                  selectedIndex = (selectedIndex + 1) % items.length
                  renderItems()
                  return true
                }
                if (props.event.key === "ArrowUp") {
                  selectedIndex = (selectedIndex - 1 + items.length) % items.length
                  renderItems()
                  return true
                }
                if (props.event.key === "Enter") {
                  if (items[selectedIndex]) commandFn(items[selectedIndex])
                  return true
                }
                if (props.event.key === "Escape") {
                  popup[0].hide()
                  return true
                }
                return false
              },
              onExit: () => {
                popup[0].destroy()
              },
            }
          },
        },
      }),
    ],
    content: "",
  })

  if (!replyEditor) return null

  return (
    <div className="mt-3">
      <div
        style={{
          border: "1px solid #444",
          borderRadius: "6px",
          padding: "6px",
          minHeight: "38px",
        }}
      >
        <EditorContent editor={replyEditor} />
      </div>

      <div className="mt-2 d-flex gap-2">
        <CButton
          size="sm"
          color="success"
          onClick={() => {
            const json = replyEditor.getJSON()
            onSubmit(json)
            replyEditor.commands.clearContent()
          }}
        >
          Répondre
        </CButton>
        <CButton
          size="sm"
          color="secondary"
          variant="outline"
          onClick={onCancel}
        >
          Annuler
        </CButton>
      </div>
    </div>
  )
}

const ReadOnlyEditor = ({ content }) => {
  const editor = useEditor({
    extensions: [StarterKit, Mention],
    content: content,
    editable: false,
  })

  if (!editor) return null
  return <EditorContent editor={editor} />
}

// ----------------- MAIN COMPONENT -----------------

const ContactNotes = ({ contactId }) => {
  const [notes, setNotes] = useState([])
  const [search, setSearch] = useState("")
  const [page, setPage] = useState(1)
  const notesPerPage = 5

  const token = localStorage.getItem("access_token")
  let decoded = null
  try {
    decoded = token ? jwtDecode(token) : null
  } catch {
    decoded = null
  }
  const currentUserId = decoded?.sub || null

  // TipTap pour nouvelle note
  const editor = useEditor({
    extensions: [
      StarterKit,
      Mention.configure({
        HTMLAttributes: { class: "mention" },
        suggestion: {
          items: async ({ query }) => {
            return await fetchUsers(query)
          },
          render: () => {
            let popup
            let dom
            let selectedIndex = 0
            let items = []
            let commandFn

            const renderItems = () => {
              dom.innerHTML = ""
              items.forEach((item, index) => {
                const el = document.createElement("div")
                el.classList.add("mention-item")
                if (index === selectedIndex) el.classList.add("is-selected")
                el.textContent = item.label
                el.onclick = () => commandFn(item)
                dom.appendChild(el)
              })
            }

            return {
              onStart: (props) => {
                dom = document.createElement("div")
                dom.classList.add("mention-dropdown")

                commandFn = props.command
                items = props.items

                popup = tippy("body", {
                  getReferenceClientRect: props.clientRect,
                  appendTo: () => document.body,
                  content: dom,
                  showOnCreate: true,
                  interactive: true,
                  trigger: "manual",
                  placement: "bottom-start",
                  animation: "scale",
                })

                selectedIndex = 0
                renderItems()
              },
              onUpdate: (props) => {
                commandFn = props.command
                items = props.items
                selectedIndex = 0
                renderItems()
              },
              onKeyDown: (props) => {
                if (props.event.key === "ArrowDown") {
                  selectedIndex = (selectedIndex + 1) % items.length
                  renderItems()
                  return true
                }
                if (props.event.key === "ArrowUp") {
                  selectedIndex = (selectedIndex - 1 + items.length) % items.length
                  renderItems()
                  return true
                }
                if (props.event.key === "Enter") {
                  if (items[selectedIndex]) commandFn(items[selectedIndex])
                  return true
                }
                if (props.event.key === "Escape") {
                  popup[0].hide()
                  return true
                }
                return false
              },
              onExit: () => {
                popup[0].destroy()
              },
            }
          },
        },
      }),
    ],
    content: "",
  })

  // Recherche
  const filteredNotes = useMemo(() => {
    return notes.filter((n) => {
      const noteText = getTextFromTipTap(n.contenu)?.toLowerCase() || ""
      const user = n.username?.toLowerCase() || ""
      return (
        noteText.includes(search.toLowerCase()) ||
        user.includes(search.toLowerCase())
      )
    })
  }, [notes, search])

  // Pagination
  const totalPages = Math.ceil(filteredNotes.length / notesPerPage)
  const displayedNotes = filteredNotes.slice(
    (page - 1) * notesPerPage,
    page * notesPerPage
  )

  // CRUD
  const handleAddNote = async () => {
    if (!editor) return

    try {
      const json = editor.getJSON()
      const mentions = extractMentions(json)

      const res = await fetchWithAuth(`${API_NOTES}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("access_token")}`,
        },
        body: JSON.stringify({
          contact_id: contactId,
          contenu: json,
          mentions,
        }),
      })

      if (!res.ok) throw new Error("Erreur lors de l'ajout de la note")

      const created = await res.json()
      setNotes((prev) => [created, ...prev])
      editor.commands.clearContent()
    } catch (err) {
      console.error(err)
      alert("Impossible d'ajouter la note")
    }
  }

  const handleReplyNote = async (noteId, replyJson) => {
    try {
      const res = await fetchWithAuth(`${API_NOTES}/${noteId}/replies`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("access_token")}`,
        },
        body: JSON.stringify({ contenu: replyJson }),
      })

      if (!res.ok) throw new Error("Erreur lors de la réponse")
      const created = await res.json()

      setNotes((prev) =>
        prev.map((n) =>
          n.id === noteId ? { ...n, replies: [created, ...(n.replies || [])] } : n
        )
      )
    } catch (err) {
      console.error(err)
      alert("Impossible d'ajouter la réponse")
    }
  }

  const handleUpdateNote = async (noteId, newContentJson) => {
    try {
      const res = await fetchWithAuth(`${API_NOTES}/${noteId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("access_token")}`,
        },
        body: JSON.stringify({ contenu: newContentJson }),
      })
      if (!res.ok) throw new Error("Erreur lors de la mise à jour de la note")
      const updated = await res.json()

      setNotes((prev) =>
        prev.map((n) => (n.id === noteId ? { ...n, ...updated } : n))
      )
    } catch (err) {
      console.error(err)
      alert("Impossible de modifier la note")
    }
  }

  const handleDeleteNote = async (noteId) => {
    if (!window.confirm("Supprimer cette note ?")) return

    try {
      const res = await fetchWithAuth(`${API_NOTES}/${noteId}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("access_token")}`,
        },
      })
      if (!res.ok) throw new Error("Erreur lors de la suppression")

      setNotes((prev) => prev.filter((n) => n.id !== noteId))
    } catch (err) {
      console.error(err)
      alert("Impossible de supprimer la note")
    }
  }

  const handleDeleteReply = async (replyId, noteId) => {
    if (!window.confirm("Supprimer cette réponse ?")) return

    try {
      const res = await fetchWithAuth(`${API_NOTES}/replies/${replyId}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("access_token")}`,
        },
      })
      if (!res.ok) throw new Error("Erreur lors de la suppression")

      setNotes((prev) =>
        prev.map((n) =>
          n.id === noteId
            ? { ...n, replies: n.replies.filter((r) => r.id !== replyId) }
            : n
        )
      )
    } catch (err) {
      console.error(err)
      alert("Impossible de supprimer la réponse")
    }
  }

  // Fetch initial notes
  useEffect(() => {
    const fetchNotes = async () => {
      try {
        const res = await fetchWithAuth(API_NOTES_BY_CONTACT(contactId), {
          headers: {
            "Authorization": `Bearer ${localStorage.getItem("access_token")}`,
          },
        })
        if (!res.ok) throw new Error("Erreur lors du chargement des notes")
        const data = await res.json()
        setNotes(data)
      } catch (err) {
        console.error(err)
      }
    }
    fetchNotes()
  }, [contactId])

  // ----------------- RENDER -----------------

  return (
    <div>
      {/* Barre de recherche */}
      <div className="mb-3">
        <CFormInput
          type="text"
          placeholder="Rechercher une note..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value)
            setPage(1)
          }}
        />
      </div>

      {/* Zone pour nouvelle note */}
      <div className="mb-3 d-flex gap-2">
        <div
          style={{
            flexGrow: 1,
            border: "1px solid #444",
            borderRadius: "6px",
            display: "flex",
            alignItems: "center",
            minHeight: "38px",
          }}
        >
          <EditorContent editor={editor} style={{ flex: 1 }} />
        </div>
        <CButton color="primary" onClick={handleAddNote}>
          Ajouter
        </CButton>
      </div>

      {/* Liste des notes */}
      {displayedNotes.length === 0 ? (
        <p>Aucune note</p>
      ) : (
        <ul className="list-group">
          {displayedNotes.map((n) => (
            <li key={n.id} className="list-group-item bg-dark text-white">
              <ReadOnlyEditor content={n.contenu} />
              <small>
                {new Date(n.created_at).toLocaleString()} par {n.username || "N/A"}
              </small>

              {/* Actions */}
              <div className="mt-2 d-flex gap-2">
                {n.utilisateur_id === currentUserId && (
                  <>
                    <CButton
                      size="sm"
                      color="warning"
                      onClick={() => {
                        const newContent = prompt("Modifier la note en JSON ?", JSON.stringify(n.contenu))
                        if (newContent) {
                          try {
                            handleUpdateNote(n.id, JSON.parse(newContent))
                          } catch {
                            alert("Format JSON invalide")
                          }
                        }
                      }}
                    >
                      Éditer
                    </CButton>
                    <CButton
                      size="sm"
                      color="danger"
                      onClick={() => handleDeleteNote(n.id)}
                    >
                      Supprimer
                    </CButton>
                  </>
                )}

                <CButton
                  size="sm"
                  color="info"
                  onClick={() => {
                    const replyEditor = document.getElementById(`reply-${n.id}`)
                    if (replyEditor) {
                      replyEditor.style.display =
                        replyEditor.style.display === "none" ? "block" : "none"
                    }
                  }}
                >
                  Répondre
                </CButton>
              </div>

              {/* Zone réponse */}
              <div id={`reply-${n.id}`} style={{ display: "none" }}>
                <ReplyEditor
                  onSubmit={(json) => handleReplyNote(n.id, json)}
                  onCancel={() => {
                    const replyEditor = document.getElementById(`reply-${n.id}`)
                    if (replyEditor) replyEditor.style.display = "none"
                  }}
                />
              </div>

              {/* Réponses */}
              {n.replies && n.replies.length > 0 && (
                <ul className="list-group mt-2">
                  {n.replies.map((r) => (
                    <li
                      key={r.id}
                      className="list-group-item bg-secondary text-white"
                    >
                      <ReadOnlyEditor content={r.contenu} />
                      <small>
                        {new Date(r.created_at).toLocaleString()} par {r.username || "N/A"}
                      </small>

                      {r.utilisateur_id === currentUserId && (
                        <div className="mt-2">
                          <CButton
                            size="sm"
                            color="danger"
                            onClick={() => handleDeleteReply(r.id, n.id)}
                          >
                            Supprimer
                          </CButton>
                        </div>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </li>
          ))}
        </ul>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="d-flex justify-content-between align-items-center mt-3">
          <CButton
            color="secondary"
            disabled={page === 1}
            onClick={() => setPage(page - 1)}
          >
            Précédent
          </CButton>
          <span>
            Page {page} / {totalPages}
          </span>
          <CButton
            color="secondary"
            disabled={page === totalPages}
            onClick={() => setPage(page + 1)}
          >
            Suivant
          </CButton>
        </div>
      )}
    </div>
  )
}

export default ContactNotes
