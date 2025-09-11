import React, { useEffect, useState, useMemo } from "react"
import { useParams, Link } from "react-router-dom"
import { useEditor, EditorContent } from "@tiptap/react"

import {
  CCard, CCardHeader, CCardBody,
  CNav, CNavItem, CNavLink, CTabContent, CTabPane,
  CBadge, CButton, CFormInput, CRow, CCol,CFormTextarea
} from "@coreui/react"
import { API_CONTACTS,API_ENTREPRISES, API_ACTIVITES, API_ACTIVITE_DETAIL,API_NOTES, API_NOTES_BY_CONTACT, API_MY_NOTIFICATIONS, API_BASE } from "src/api"
import ProtectedButton from "../../components/ProtectedButton"
import { PermissionsContext } from '/src/context/PermissionsContext'
import Select from 'react-select'
import AsyncSelect from "react-select/async"
import CascadeSelect from "src/components/CascadeSelect"
import MultiSelect from "src/components/MultiSelect"
import StarterKit from "@tiptap/starter-kit"
import Mention from "@tiptap/extension-mention"
import tippy from "tippy.js"
import "tippy.js/dist/tippy.css"
import "tippy.js/animations/scale.css"
import { useSearchParams } from "react-router-dom"
import { jwtDecode } from "jwt-decode"


const ContactDetail = () => {
  const [contact, setContact] = useState(null)
const { id } = useParams()
  const [searchParams] = useSearchParams()
  const initialTab = parseInt(searchParams.get("tab") || "1", 10)

  const [activeKey, setActiveKey] = useState(initialTab)  
  const [isEditing, setIsEditing] = useState(false)
const [formData, setFormData] = useState({})
const [entreprises, setEntreprises] = useState([])
const token = localStorage.getItem("access_token"); // ou depuis Keycloak JS adapter
const [notes, setNotes] = useState([]);
const [newNote, setNewNote] = useState("");
const [editingNoteId, setEditingNoteId] = useState(null);
  const [editContent, setEditContent] = useState("");
  const [replyingNoteId, setReplyingNoteId] = useState(null);
  const [replyContent, setReplyContent] = useState("");
const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const notesPerPage = 5;
 // --- Auth & socket
  let decoded = null
  try {
    decoded = token ? jwtDecode(token) : null
  } catch {
    decoded = null
  }
  const currentUserId = decoded?.sub || null
  const [socket, setSocket] = useState(null)


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


const ReplyEditor = ({ onSubmit, onCancel }) => {
  const replyEditor = useEditor({
    extensions: [
      StarterKit,
      Mention.configure({
        HTMLAttributes: { class: "mention" },
        suggestion: {
          items: async ({ query }) => {
            return await fetchUsers(query)   // 🔎 ta fonction fetchUsers déjà définie
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
    content: content,   // 👈 JSON de la BDD
    editable: false,
  })

  if (!editor) return null
  return <EditorContent editor={editor} />
}



  // Pagination
  const totalPages = Math.ceil(filteredNotes.length / notesPerPage);
  const displayedNotes = filteredNotes.slice(
    (page - 1) * notesPerPage,
    page * notesPerPage
  );

// 🔎 Parcourt récursivement le JSON Tiptap pour extraire toutes les mentions
const extractMentions = (json) => {
  const mentions = []

  const traverse = (node) => {
    if (!node) return
    if (node.type === "mention" && node.attrs?.id) {
      mentions.push(node.attrs.id) // 👈 on récupère l'id du user (username)
    }
    if (node.content) {
      node.content.forEach(traverse)
    }
  }

  traverse(json)
  return mentions
}

const customStyles = {
  control: (provided) => ({
    ...provided,
    backgroundColor: "#2b2b2b",   // fond input
    borderColor: "#444",
    color: "#fff",
  }),
  menu: (provided) => ({
    ...provided,
    backgroundColor: "#2b2b2b",   // fond du menu déroulant
    color: "#fff",
  }),
  option: (provided, state) => ({
    ...provided,
    backgroundColor: state.isFocused ? "#444" : "#2b2b2b",
    color: "#fff",
    cursor: "pointer",
  }),
  singleValue: (provided) => ({
    ...provided,
    color: "#fff",   // texte de la valeur sélectionnée
  }),
  multiValue: (provided) => ({
    ...provided,
    backgroundColor: "#444",
    color: "#fff",
  }),
  multiValueLabel: (provided) => ({
    ...provided,
    color: "#fff",
  }),
  placeholder: (provided) => ({
    ...provided,
    color: "#aaa",
  }),
}

const [activites, setActivites] = useState([])
const [newActivity, setNewActivity] = useState({ type: "", description: "" });
const getAuthHeaders = () => ({
  "Content-Type": "application/json",
  "Authorization": `Bearer ${localStorage.getItem("access_token")}`,
});

const fetchUsers = async (query) => {
    if (!query || query.length < 3) return []
    try {
      const res = await fetch(`${API_BASE}/keycloak-users/search?q=${query}`, {
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

// 🔎 Configuration Tiptap
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
    onUpdate: ({ editor }) => {
      setNewNote(editor.getHTML()) // 👈 stocke le HTML
    },
  })

const handleReplyNote = async (noteId, replyJson) => {
  try {
    const res = await fetch(`${API_NOTES}/${noteId}/replies`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${localStorage.getItem("access_token")}`,
      },
      body: JSON.stringify({ contenu: replyJson }),  // 👈 JSON direct
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



// Mettre à jour une note
const handleUpdateNote = async (noteId, newContentJson) => {
  try {
    const res = await fetch(`${API_NOTES}/${noteId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${localStorage.getItem("access_token")}`,
      },
      body: JSON.stringify({ contenu: newContentJson }),
    });
    if (!res.ok) throw new Error("Erreur lors de la mise à jour de la note");
    const updated = await res.json();

    setNotes((prev) =>
      prev.map((n) => (n.id === noteId ? { ...n, ...updated } : n))
    );
  } catch (err) {
    console.error(err);
    alert("Impossible de modifier la note");
  }
};


// Supprimer une note
const handleDeleteNote = async (noteId) => {
  if (!window.confirm("Supprimer cette note ?")) return;

  try {
    const res = await fetch(`${API_NOTES}/${noteId}`, {
      method: "DELETE",
      headers: {
        "Authorization": `Bearer ${localStorage.getItem("access_token")}`,
      },
    });
    if (!res.ok) throw new Error("Erreur lors de la suppression");

    // Retire la note localement
    setNotes((prev) => prev.filter((n) => n.id !== noteId));
  } catch (err) {
    console.error(err);
    alert("Impossible de supprimer la note");
  }
};
const handleDeleteReply = async (replyId, noteId) => {
  if (!window.confirm("Supprimer cette réponse ?")) return;

  try {
    const res = await fetch(`${API_NOTES}/replies/${replyId}`, {
      method: "DELETE",
      headers: {
        "Authorization": `Bearer ${localStorage.getItem("access_token")}`,
      },
    });
    if (!res.ok) throw new Error("Erreur lors de la suppression");

    // Mise à jour locale : on retire la réponse
    setNotes((prev) =>
      prev.map((n) =>
        n.id === noteId
          ? { ...n, replies: n.replies.filter((r) => r.id !== replyId) }
          : n
      )
    );
  } catch (err) {
    console.error(err);
    alert("Impossible de supprimer la réponse");
  }
};



useEffect(() => {
  const fetchNotes = async () => {
    try {
      const res = await fetch(API_NOTES_BY_CONTACT(id), {
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("access_token")}`,
        },
      });
      if (!res.ok) throw new Error("Erreur lors du chargement des notes");
      const data = await res.json();
      setNotes(data);
    } catch (err) {
      console.error(err);
    }
  };
  fetchNotes();
}, [id]);


const handleAddActivity = async () => {
  try {
    const res = await fetch(`${API_ACTIVITES}`, {
  method: "POST",
  headers: getAuthHeaders(), 
  body: JSON.stringify({
    contact_id: id,
    type: newActivity.type,
    description: newActivity.description,
  }),
});
    if (!res.ok) throw new Error("Erreur lors de l'ajout");
    const created = await res.json();
    setActivites([created, ...activites]); // on ajoute en haut de la liste
    setNewActivity({ type: "", description: "" }); // reset
  } catch (err) {
    console.error(err);
    alert("Impossible d'ajouter l'activité");
  }
};

const handleAddNote = async () => {
  if (!editor) return

  try {
    // 1. Récupérer le contenu JSON depuis TipTap
    const json = editor.getJSON()

    // 2. Extraire les mentions éventuelles
    const mentions = extractMentions(json)

    // 3. Envoyer la note au backend
    const res = await fetch(`${API_NOTES}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${localStorage.getItem("access_token")}`,
      },
      body: JSON.stringify({
        contact_id: id,   // 👈 l’id du contact courant
        contenu: json,    // 👈 JSON complet (pas du HTML)
        mentions,         // 👈 tableau de usernames mentionnés
      }),
    })

    if (!res.ok) throw new Error("Erreur lors de l'ajout de la note")

    // 4. Ajouter la note dans ton state
    const created = await res.json()
    setNotes((prev) => [created, ...prev])

    // 5. Reset l’éditeur
    editor.commands.clearContent()
  } catch (err) {
    console.error(err)
    alert("Impossible d'ajouter la note")
  }
}



useEffect(() => {
  const fetchActivites = async () => {
    try {
const res = await fetch(`${API_ACTIVITES}?contact_id=${id}`, {
 headers: getAuthHeaders(),
});      if (!res.ok) throw new Error("Erreur lors du chargement des activités")
      const data = await res.json()
      setActivites(data)
    } catch (err) {
      console.error(err)
    }
  }
  fetchActivites()
}, [id])

// Fonction pour charger les options depuis l'API gouvernementale
const loadAddressOptions = async (inputValue) => {
  if (!inputValue || inputValue.length < 3) return []
  const res = await fetch(
    `https://api-adresse.data.gouv.fr/search/?q=${encodeURIComponent(inputValue)}&limit=5`
  )
  const data = await res.json()
  return data.features.map((f) => ({
    value: f.properties.label,
    label: f.properties.label,
    city: f.properties.city,
    postcode: f.properties.postcode,
    context: f.properties.context,
  }))
}
  useEffect(() => {
  const fetchContact = async () => {
    try {
      const res = await fetch(`${API_CONTACTS}/${id}`)
      if (!res.ok) throw new Error("Erreur lors du chargement du contact")
      const data = await res.json()
      setContact(data)
      setFormData(data)   // <--- important
    } catch (err) {
      console.error(err)
    }
  }
  fetchContact()
}, [id])
useEffect(() => {
  const fetchEntreprises = async () => {
    try {
      const res = await fetch(`${API_ENTREPRISES}`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
        },
      })
      if (!res.ok) throw new Error('Impossible de charger les entreprises')
      const data = await res.json()
      setEntreprises(data)
    } catch (e) {
      console.error(e)
    }
  }
  fetchEntreprises()
}, [])
    const handleSave = async () => {
  try {
    const res = await fetch(`${API_CONTACTS}/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    })
    if (!res.ok) throw new Error("Erreur lors de la sauvegarde")
    const updated = await res.json()
    setContact(updated)
    setFormData(updated)
    setIsEditing(false)
  } catch (err) {
    console.error(err)
    alert("Impossible de sauvegarder le contact")
  }
}


  if (!contact) return <p>Chargement...</p>

  return (
    <div className="container py-4">
      <CCard>
        <CCardHeader className="d-flex justify-content-between align-items-center">
  {!isEditing ? (
    <h4>{contact.prenom} {contact.nom}</h4>
  ) : (
    <div className="d-flex gap-2">
      <CFormInput
        size="sm"
        placeholder="Prénom"
        label="Prénom"
        value={formData.prenom || ""}
        onChange={(e) => setFormData({ ...formData, prenom: e.target.value })}
      />
      <CFormInput
        size="sm"
        placeholder="Nom"
        label="Nom"
        value={formData.nom || ""}
        onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
      />
    </div>
  )}

  <div className="d-flex gap-2">
        {!isEditing ? (
      <CButton color="primary" onClick={() => setIsEditing(true)}>Éditer</CButton>
    ) : (
      <>
        <CButton color="danger" variant="outline" onClick={() => { setIsEditing(false); setFormData(contact) }}>
          Annuler
        </CButton>
        <CButton color="primary" onClick={handleSave}>
          Enregistrer
        </CButton>
      </>
    )}
  </div>
</CCardHeader>

        <CCardBody>
          {/* Onglets */}
          <CNav variant="underline" role="tablist">
            <CNavItem>
              <CNavLink active={activeKey === 1} onClick={() => setActiveKey(1)}>Infos générales</CNavLink>
            </CNavItem>
            <CNavItem>
              <CNavLink active={activeKey === 2} onClick={() => setActiveKey(2)}>Historique</CNavLink>
            </CNavItem>
            <CNavItem>
              <CNavLink active={activeKey === 3} onClick={() => setActiveKey(3)}>Notes</CNavLink>
            </CNavItem>
            <CNavItem>
              <CNavLink active={activeKey === 4} onClick={() => setActiveKey(4)}>Documents</CNavLink>
            </CNavItem>
          </CNav>

          <CTabContent className="mt-3">
            {/* Infos générales */}
            <CTabPane role="tabpanel" visible={activeKey === 1}>
  {!isEditing ? (
  <CRow>
    <CCol md={6}>
      <p><strong>Civilité :</strong> {contact.civilite || "-"}</p>
      <p><strong>Poste :</strong> {contact.poste || "-"}</p>
      <p><strong>Email :</strong> <a href={`mailto:${contact.email}`}>{contact.email}</a></p>
      <p><strong>Téléphone :</strong> {contact.telephone || "-"}</p>
      <p><strong>Mobile :</strong> {contact.mobile || "-"}</p>
      <p>
        <strong>Entreprise :</strong>{" "}
        {contact.entreprise_id ? (
          <Link to={`/entreprises/${contact.entreprise_id}`} className="text-primary fw-bold">
            {contact.entreprise_nom || "Entreprise"}
          </Link>
        ) : (
          "-"
        )}
      </p>
    </CCol>
    <CCol md={6}>
      <p><strong>Adresse :</strong> {contact.adresse || "-"} {contact.pays}</p>
      <p><strong>Statut :</strong> <CBadge color="primary">{contact.statut || "Non défini"}</CBadge></p>
      <p><strong>Source :</strong> {contact.source || "-"}</p>
      <p><strong>Tags :</strong> {contact.tags ? contact.tags.join(", ") : "-"}</p>
    </CCol>
  </CRow>
) : (
  <CRow>
    <CCol md={6}>
      <CascadeSelect
  type="Genre"
  cascade={false}
  parentLabel="Genre"
  value={
    formData.civilite
      ? { value: formData.civilite, label: formData.civilite_label || formData.civilite }
      : null
  }
  onChange={(option) =>
    setFormData({
      ...formData,
      civilite: option?.value || null,
      civilite_label: option?.label || ""
    })
  }
/>


      <CFormInput
        className="mb-2"
        label="Poste"
        value={formData.poste || ""}
        onChange={(e) => setFormData({ ...formData, poste: e.target.value })}
      />
      <CFormInput
        className="mb-2"
        label="Email"
        type="email"
        value={formData.email || ""}
        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
      />
      <CFormInput
        className="mb-2"
        label="Téléphone"
        value={formData.telephone || ""}
        onChange={(e) => setFormData({ ...formData, telephone: e.target.value })}
      />
      <CFormInput
        className="mb-2"
        label="Mobile"
        value={formData.mobile || ""}
        onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
      />

      {/* Entreprise Select */}
      <label className="form-label">Entreprise</label>
      <Select
        options={entreprises.map(e => ({ value: e.id, label: e.nom }))}
        value={formData.entreprise_id ? { value: formData.entreprise_id, label: formData.entreprise_nom } : null}
        onChange={(opt) =>
          setFormData({ ...formData, entreprise_id: opt?.value || null, entreprise_nom: opt?.label || "" })
        }
        placeholder="Sélectionner une entreprise"
      />
    </CCol>

    <CCol md={6}>
      <div className="mb-3">
  <label className="form-label">Adresse</label>
  <AsyncSelect
    cacheOptions
    loadOptions={loadAddressOptions}
    defaultOptions={false}
    placeholder="Saisir une adresse"
    value={
      formData.adresse
        ? { value: formData.adresse, label: formData.adresse }
        : null
    }
    onChange={(opt) =>
      setFormData({
        ...formData,
        adresse: opt?.value || "",
        ville: opt?.city || "",
        code_postal: opt?.postcode || "",
        pays: "France",
      })
    }
  />
</div>

<CFormInput
  className="mb-2"
  label="Ville"
  value={formData.ville || ""}
  onChange={(e) => setFormData({ ...formData, ville: e.target.value })}
/>

<CFormInput
  className="mb-2"
  label="Pays"
  value={formData.pays || ""}
  onChange={(e) => setFormData({ ...formData, pays: e.target.value })}
/>
      
      <CascadeSelect
  type="Statut"
  cascade={false}
  parentLabel="Statut"
  value={
    formData.statut
      ? { value: formData.statut, label: formData.statut_label || formData.statut }
      : null
  }
  onChange={(option) =>
    setFormData({
      ...formData,
      statut: option?.value || null,
      statut_label: option?.label || ""
    })
  }
/>
      <CascadeSelect
  type="Source"   styles={customStyles}

  cascade={false}
  parentLabel="Source"
  value={
    formData.source
      ? { value: formData.source, label: formData.source_label || formData.source }
      : null
  }
  onChange={(option) =>
    setFormData({
      ...formData,
      source: option?.value || null,
      source_label: option?.label || ""
    })
  }
/>
      <MultiSelect   classNamePrefix="react-select"

  type="Tag"
  label="Tags"
  value={(formData.tags || []).map(tag => ({ value: tag, label: tag }))}
  onChange={(options) =>
    setFormData({
      ...formData,
      tags: options ? options.map(opt => opt.label) : []
    })
  }
/>

    </CCol>
  </CRow>
)}


</CTabPane>


            {/* Historique */}
            <CTabPane role="tabpanel" visible={activeKey === 2}>
  <div className="mb-3 d-flex gap-2">
  <select
    className="form-select" style={{ width: "150px" }}
    value={newActivity.type}
    onChange={(e) => setNewActivity({ ...newActivity, type: e.target.value })}
  >
    <option value="">Type</option>
    <option value="appel">Appel</option>
    <option value="email">Email</option>
  </select>
  <input
    type="text"
    className="form-control flex-grow-1"
    placeholder="Description"
    value={newActivity.description}
    onChange={(e) => setNewActivity({ ...newActivity, description: e.target.value })}
  />
  <CButton color="primary" onClick={handleAddActivity}>Ajouter</CButton>
</div>


  {activites.length === 0 ? (
    <p>Aucune activité enregistrée</p>
  ) : (
    <ul className="list-group">
      {activites.map((a) => (
        <li key={a.id} className="list-group-item bg-dark text-white">
          <strong>{a.type}</strong> — {a.description}
          <br />
          <small>
  {a.date ? new Date(a.date).toLocaleString() : "-"} 
  {" "}par {a.utilisateur_username || a.utilisateur_email || "N/A"}
</small>
        </li>
      ))}
    </ul>
  )}
</CTabPane>



            {/* Notes */}
            <CTabPane role="tabpanel" visible={activeKey === 3}>
              {/* Barre de recherche */}
      <div className="mb-3">
        <CFormInput
          type="text"
          placeholder="Rechercher une note..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1); // reset page quand on recherche
          }}
        />
      </div>
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
      {editingNoteId === n.id ? (
  <div className="mt-2">
    <EditorContent
      editor={useEditor({
        extensions: [StarterKit, Mention],
        content: editContent, // contenu JSON de la note
        onUpdate: ({ editor }) => setEditContent(editor.getJSON()),
      })}
    />
    <div className="mt-2 d-flex gap-2">
      <CButton
        size="sm"
        color="success"
        onClick={() => {
          handleUpdateNote(n.id, editContent) // envoie JSON
          setEditingNoteId(null)
        }}
      >
        Sauvegarder
      </CButton>
      <CButton
        size="sm"
        color="secondary"
        onClick={() => setEditingNoteId(null)}
      >
        Annuler
      </CButton>
    </div>
  </div>
) : (

        <>
<ReadOnlyEditor content={n.contenu} />
          <small>
            {new Date(n.created_at).toLocaleString()} par{" "}
            {n.username || "N/A"}
          </small>
        </>
      )}

      {/* Actions */}
     {/* Actions */}
<div className="mt-2 d-flex gap-2">
  {n.utilisateur_id === currentUserId && editingNoteId !== n.id && (
    <>
      <CButton
        size="sm"
        color="warning"
        onClick={() => {
          setEditingNoteId(n.id)
          setEditContent(n.contenu)
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
    onClick={() => setReplyingNoteId(n.id)}
  >
    Répondre
  </CButton>
</div>

{/* Réponse en dessous */}
{replyingNoteId === n.id && (
  <div className="mt-3">
    <ReplyEditor
      onSubmit={(json) => {
        handleReplyNote(n.id, json)
        setReplyingNoteId(null)
      }}
      onCancel={() => setReplyingNoteId(null)}
    />
  </div>
)}


      {/* Affichage des réponses */}
      {n.replies && n.replies.length > 0 && (
        <ul className="list-group mt-2">
          {n.replies.map((r) => (
            <li
              key={r.id}
              className="list-group-item bg-secondary text-white"
            >
<ReadOnlyEditor content={r.contenu} />
              <small>
                {new Date(r.created_at).toLocaleString()} par{" "}
                {r.username || "N/A"}
              </small>

              {/* 🔥 Bouton Supprimer sur la réponse */}
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
    </CTabPane>



            {/* Documents */}
            <CTabPane role="tabpanel" visible={activeKey === 4}>
              <p>📂 Zone pour les documents liés au contact</p>
            </CTabPane>
          </CTabContent>
        </CCardBody>
      </CCard>
    </div>
  )
}

export default ContactDetail
