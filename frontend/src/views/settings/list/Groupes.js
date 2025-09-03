import React, { useEffect, useState, useContext } from 'react'
import {
  CCard, CCardHeader, CCardBody, CFormInput, CButton,
  CTable, CTableHead, CTableRow, CTableHeaderCell, CTableBody, CTableDataCell,
  COffcanvas, COffcanvasHeader, COffcanvasBody,
  CToaster, CToast, CToastBody,
} from '@coreui/react'

import CIcon from '@coreui/icons-react'
import { cilPencil, cilTrash, cilPlus, cilUser, cilLayers } from '@coreui/icons'
import { API_GROUPES } from 'src/api'
import ConfirmDeleteModal from "../../../components/ConfirmDeleteModal"
import ProtectedButton from "../../../components/ProtectedButton"
import { PermissionsContext } from '/src/context/PermissionsContext'

const Groupes = () => {
  const [groupes, setGroupes] = useState([])
  const [search, setSearch] = useState('')

  const { actionsConfig, currentUserRoles } = useContext(PermissionsContext)

  // --- Création / édition
  const [showCreate, setShowCreate] = useState(false)
  const [createName, setCreateName] = useState("")
  const [createSubGroups, setCreateSubGroups] = useState([])
  const [newSubGroup, setNewSubGroup] = useState("")

  const [showEdit, setShowEdit] = useState(false)
  const [editGroup, setEditGroup] = useState(null)
  const [editName, setEditName] = useState('')

  // --- TOASTS
  const [toasts, setToasts] = useState([])
  const addToast = (message, color = 'danger') => {
    const id = Date.now()
    setToasts((prev) => [...prev, { id, message, color }])
  }
  const showError = (msg) => addToast(msg, 'danger')
  const showSuccess = (msg) => addToast(msg, 'success')
  const removeToast = (id) => setToasts((prev) => prev.filter((t) => t.id !== id))

  // --- Voir utilisateurs d’un groupe
  const [showUsers, setShowUsers] = useState(false)
  const [selectedGroupe, setSelectedGroupe] = useState(null)
  const [usersByGroupe, setUsersByGroupe] = useState([])

  // --- Voir sous-groupes
  const [showSubGroups, setShowSubGroups] = useState(false)
  const [selectedParent, setSelectedParent] = useState(null)
  const [subGroups, setSubGroups] = useState([])

  // --- FETCH groupes ---
  const fetchGroupes = async () => {
    try {
      const res = await fetch(API_GROUPES)
      if (!res.ok) throw new Error('Impossible de charger les groupes')
      const data = await res.json()
      setGroupes(data)
    } catch (e) {
      showError(e.message || 'Erreur réseau lors du chargement')
    }
  }

  const fetchUsersByGroupe = async (groupId) => {
    try {
      const res = await fetch(`${API_GROUPES}/${groupId}/users`)
      if (!res.ok) throw new Error("Impossible de charger les utilisateurs du groupe")
      return await res.json()
    } catch (e) {
      console.error(e)
      return []
    }
  }

  const fetchSubGroups = async (groupId) => {
    try {
      const res = await fetch(`${API_GROUPES}/${groupId}/subgroups`)
      if (!res.ok) throw new Error("Impossible de charger les sous-groupes")
      return await res.json()
    } catch (e) {
      console.error(e)
      return []
    }
  }

  const handleCreate = async () => {
    if (!createName) return showError("Nom du groupe requis")
    try {
      const res = await fetch(API_GROUPES, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: createName,
          subGroups: createSubGroups,
        }),
      })
      if (!res.ok) throw new Error("Création du groupe impossible")

      await fetchGroupes()
      setShowCreate(false)
      setCreateName("")
      setCreateSubGroups([])
      showSuccess("✅ Groupe et sous-groupes créés avec succès")
    } catch (e) {
      showError(e.message || "Erreur lors de la création")
    }
  }

  const openEdit = (g) => {
    setEditGroup(g)
    setEditName(g.name || "")
    setShowEdit(true)
  }

  const handleSaveEdit = async () => {
    if (!editGroup) return
    try {
      const res = await fetch(`${API_GROUPES}/${editGroup.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: editName }),
      })
      if (!res.ok) throw new Error("Mise à jour impossible")

      await fetchGroupes()
      setShowEdit(false)
      setEditGroup(null)
      showSuccess("Groupe mis à jour")
    } catch (e) {
      showError(e.message || "Erreur update")
    }
  }

  useEffect(() => { fetchGroupes() }, [])

  const openUsers = async (groupe) => {
    setSelectedGroupe(groupe.name)
    setShowUsers(true)
    setUsersByGroupe(await fetchUsersByGroupe(groupe.id))
  }

  const openSubGroups = async (groupe) => {
    setSelectedParent(groupe)
    setSubGroups(await fetchSubGroups(groupe.id))
    setShowSubGroups(true)
  }

  const filtered = groupes.filter(
    (r) =>
      r.name?.toLowerCase().includes(search.toLowerCase()) ||
      r.description?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="container py-4">
      <CCard className="mb-4">
        <CCardHeader className="d-flex justify-content-between align-items-center">
          <span>Groupes</span>
          <ProtectedButton actionsConfig={actionsConfig} currentUserRoles={currentUserRoles} action="group.new">
            <CButton color="primary" onClick={() => setShowCreate(true)}>
              <CIcon icon={cilPlus} className="me-2" /> Nouveau groupe
            </CButton>
          </ProtectedButton>
        </CCardHeader>

        <CCardBody>
          <CFormInput
            className="mb-3"
            type="text"
            placeholder="Rechercher par nom ou description…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <CTable striped hover responsive>
            <CTableHead>
              <CTableRow className="align-middle">
                <CTableHeaderCell>Nom</CTableHeaderCell>
                <CTableHeaderCell>Détails</CTableHeaderCell>
                <CTableHeaderCell style={{ textAlign: 'center' }}>Actions</CTableHeaderCell>
              </CTableRow>
            </CTableHead>
            <CTableBody>
              {filtered.length ? (
                filtered.map((g) => (
                  <CTableRow key={g.id}>
                    <CTableDataCell className="align-middle">{g.name}</CTableDataCell>
                    <CTableDataCell className="align-middle">
                      <ProtectedButton actionsConfig={actionsConfig} currentUserRoles={currentUserRoles} action="group.viewUsers">
                        <CButton size="sm" color="info" variant="ghost" onClick={() => openUsers(g)}>
                          <CIcon icon={cilUser} size="lg" /> Utilisateurs
                        </CButton>
                      </ProtectedButton>
                      <ProtectedButton actionsConfig={actionsConfig} currentUserRoles={currentUserRoles} action="group.viewSubGroups">
                        <CButton size="sm" color="warning" variant="ghost" onClick={() => openSubGroups(g)}>
                          <CIcon icon={cilLayers} size="lg" /> Sous-groupes
                        </CButton>
                      </ProtectedButton>
                    </CTableDataCell>
                    <CTableDataCell className="text-center align-middle">
                      <ProtectedButton actionsConfig={actionsConfig} currentUserRoles={currentUserRoles} action="group.edit">
                        <CButton size="sm" color="success" variant="ghost" onClick={() => openEdit(g)}>
                          <CIcon icon={cilPencil} size="lg" />
                        </CButton>
                      </ProtectedButton>
                      <ProtectedButton actionsConfig={actionsConfig} currentUserRoles={currentUserRoles} action="group.delete">
                        <ConfirmDeleteModal
                          title="Supprimer le groupe"
                          message="Êtes-vous sûr de vouloir supprimer ce groupe ? Cette action est irréversible."
                          trigger={
                            <CButton size="sm" color="danger" variant="ghost">
                              <CIcon icon={cilTrash} size="lg" />
                            </CButton>
                          }
                          onConfirm={async () => {
                            try {
                              const res = await fetch(`${API_GROUPES}/${g.id}`, { method: "DELETE" })
                              if (!res.ok) throw new Error("Suppression impossible")
                              setGroupes((prev) => prev.filter((group) => group.id !== g.id))
                              showSuccess("✅ Groupe supprimé")
                            } catch (e) {
                              showError(e.message || "Erreur lors de la suppression")
                            }
                          }}
                        />
                      </ProtectedButton>
                    </CTableDataCell>
                  </CTableRow>
                ))
              ) : (
                <CTableRow>
                  <CTableDataCell colSpan={3} className="text-center">
                    Aucun groupe
                  </CTableDataCell>
                </CTableRow>
              )}
            </CTableBody>
          </CTable>
        </CCardBody>
      </CCard>

      {/* Offcanvas édition */}
      <COffcanvas placement="end" visible={showEdit} onHide={() => setShowEdit(false)} style={{ width: "30%" }}>
        <COffcanvasHeader>
          <h5 className="mb-0">Éditer groupe</h5>
        </COffcanvasHeader>
        <COffcanvasBody>
          <CFormInput label="Nom du groupe" value={editName} onChange={(e) => setEditName(e.target.value)} />
          <div className="d-flex gap-2 justify-content-end mt-3">
            <CButton color="secondary" variant="ghost" onClick={() => setShowEdit(false)}>Annuler</CButton>
            <CButton color="primary" onClick={handleSaveEdit}>Enregistrer</CButton>
          </div>
        </COffcanvasBody>
      </COffcanvas>

      {/* Offcanvas sous-groupes */}
      <COffcanvas placement="end" visible={showSubGroups} onHide={() => setShowSubGroups(false)} style={{ width: "20%" }}>
        <COffcanvasHeader>
          <h5 className="mb-0">Sous-groupes de {selectedParent?.name}</h5>
        </COffcanvasHeader>
        <COffcanvasBody>
          {subGroups.length ? (
            <CTable striped hover responsive className="align-middle">
              <CTableHead>
                <CTableRow>
                  <CTableHeaderCell>Nom</CTableHeaderCell>
                  <CTableHeaderCell>Actions</CTableHeaderCell>
                </CTableRow>
              </CTableHead>
              <CTableBody>
                {subGroups.map((sg) => (
                  <CTableRow key={sg.id}>
                    <CTableDataCell>{sg.name}</CTableDataCell>
                    <CTableDataCell>
                      <ProtectedButton actionsConfig={actionsConfig} currentUserRoles={currentUserRoles} action="group.viewUsers">
                        <CButton size="sm" color="info" variant="ghost" onClick={() => openUsers(sg)}>
                          <CIcon icon={cilUser} size="lg" /> Membres
                        </CButton>
                      </ProtectedButton>
                    </CTableDataCell>
                  </CTableRow>
                ))}
              </CTableBody>
            </CTable>
          ) : (
            <p>Aucun sous-groupe</p>
          )}
        </COffcanvasBody>
      </COffcanvas>

      {/* Offcanvas création */}
      <COffcanvas placement="end" visible={showCreate} onHide={() => setShowCreate(false)} style={{ width: "30%" }}>
        <COffcanvasHeader>
          <h5 className="mb-0">Nouveau groupe</h5>
        </COffcanvasHeader>
        <COffcanvasBody>
          <CFormInput label="Nom du groupe" value={createName} onChange={(e) => setCreateName(e.target.value)} />
          <div className="mt-3">
            <h6>Sous-groupes</h6>
            <div className="d-flex gap-2 mb-2">
              <CFormInput placeholder="Nom du sous-groupe" value={newSubGroup} onChange={(e) => setNewSubGroup(e.target.value)} />
              <CButton
                color="primary"
                onClick={() => {
                  if (newSubGroup.trim()) {
                    setCreateSubGroups((prev) => [...prev, newSubGroup.trim()])
                    setNewSubGroup('')
                  }
                }}
              >
                Ajouter
              </CButton>
            </div>
            <ul>
              {createSubGroups.map((sg, idx) => (
                <li key={idx} className="d-flex justify-content-between align-items-center">
                  {sg}
                  <CButton size="sm" color="danger" variant="ghost" onClick={() => setCreateSubGroups(createSubGroups.filter((_, i) => i !== idx))}>
                    <CIcon icon={cilTrash} />
                  </CButton>
                </li>
              ))}
            </ul>
          </div>
          <div className="d-flex gap-2 justify-content-end mt-3">
            <CButton color="secondary" variant="ghost" onClick={() => setShowCreate(false)}>Annuler</CButton>
            <CButton color="primary" onClick={handleCreate}>Créer</CButton>
          </div>
        </COffcanvasBody>
      </COffcanvas>

      {/* Offcanvas utilisateurs */}
      <COffcanvas placement="end" visible={showUsers} onHide={() => setShowUsers(false)} style={{ width: "20%" }}>
        <COffcanvasHeader>
          <h5 className="mb-0">Utilisateurs du groupe : {selectedGroupe}</h5>
        </COffcanvasHeader>
        <COffcanvasBody>
          {usersByGroupe.length ? (
            <CTable striped hover responsive>
              <CTableHead>
                <CTableRow>
                  <CTableHeaderCell>Username</CTableHeaderCell>
                  <CTableHeaderCell>Email</CTableHeaderCell>
                </CTableRow>
              </CTableHead>
              <CTableBody>
                {usersByGroupe.map((u) => (
                  <CTableRow key={u.id}>
                    <CTableDataCell>{u.username}</CTableDataCell>
                    <CTableDataCell>{u.email}</CTableDataCell>
                  </CTableRow>
                ))}
              </CTableBody>
            </CTable>
          ) : (
            <p>Aucun utilisateur associé</p>
          )}
        </COffcanvasBody>
      </COffcanvas>

      {/* TOASTER */}
      <CToaster placement="bottom-end" className="p-3" style={{ zIndex: 9999 }}>
        {toasts.map((t) => (
          <CToast
            key={t.id}
            visible
            autohide
            delay={3000}
            color={t.color}
            onClose={() => removeToast(t.id)}
          >
            <CToastBody className="text-white">{t.message}</CToastBody>
          </CToast>
        ))}
      </CToaster>
    </div>
  )
}

export default Groupes
