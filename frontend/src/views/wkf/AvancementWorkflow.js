import React, { useEffect, useState } from 'react'
import {
  CCard, CCardHeader, CCardBody,
  CTable, CTableHead, CTableRow, CTableHeaderCell, CTableBody, CTableDataCell,
  CBadge, CSpinner, CFormSelect, CFormInput,
} from '@coreui/react'

// ✅ API centralisée
import { API_CONGES } from 'src/api'

const AvancementWorkflow = () => {
  const [demandes, setDemandes] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState("ALL")
  const [search, setSearch] = useState("")
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" }) // 🔥 tri

  // ---- fetch demandes ----
  const fetchDemandes = async () => {
    try {
      const res = await fetch(API_CONGES)
      if (!res.ok) throw new Error("Impossible de charger les demandes")
      const data = await res.json()
      setDemandes(data)
    } catch (e) {
      console.error("Erreur fetch demandes :", e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDemandes()
  }, [])

  // ---- rendu badge statut ----
  const renderStatus = (status) => {
    const upper = status?.toUpperCase()
    switch (upper) {
      case "APPROUVÉ":
        return <CBadge color="success">Approuvée</CBadge>
      case "REJETÉ":
        return <CBadge color="danger">Rejetée</CBadge>
      default:
        return <CBadge color="warning">En attente</CBadge>
    }
  }

  // ---- filtres ----
  let filteredDemandes = demandes.filter((d) => {
    const status = d.status?.toUpperCase() || ""
    if (filter === "PENDING" && (status === "APPROUVÉ" || status === "REJETÉ")) return false
    if (filter !== "ALL" && filter !== "PENDING" && status !== filter) return false
    if (search.trim() !== "") {
      const query = search.toLowerCase()
      return (
        d.name?.toLowerCase().includes(query) ||
        d.email?.toLowerCase().includes(query)
      )
    }
    return true
  })

  // ---- tri ----
  if (sortConfig.key) {
    filteredDemandes = [...filteredDemandes].sort((a, b) => {
      let aVal = a[sortConfig.key]
      let bVal = b[sortConfig.key]

      if (sortConfig.key === "start_date" || sortConfig.key === "end_date") {
        aVal = new Date(aVal)
        bVal = new Date(bVal)
      }

      if (aVal < bVal) return sortConfig.direction === "asc" ? -1 : 1
      if (aVal > bVal) return sortConfig.direction === "asc" ? 1 : -1
      return 0
    })
  }

  const handleSort = (key) => {
    let direction = "asc"
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc"
    }
    setSortConfig({ key, direction })
  }

  const getSortIcon = (key) => {
    if (sortConfig.key !== key) return "⇅"
    return sortConfig.direction === "asc" ? "↑" : "↓"
  }

  return (
    <div className="container py-4">
          <CCard className="mb-4">
            <CCardHeader className="d-flex justify-content-between align-items-center">
              <span>Avancement des demandes de congés</span>
            </CCardHeader>
    
          {/* Main Card Body avec la grille */}
      <CCardBody>
        {/* filtres */}
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-center mb-3 gap-2">
          <CFormSelect
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            style={{ maxWidth: "220px" }}
          >
            <option value="ALL">Toutes les demandes</option>
            <option value="PENDING">En attente</option>
            <option value="APPROUVÉ">Approuvées</option>
            <option value="REJETÉ">Rejetées</option>
          </CFormSelect>

          <CFormInput
            type="text"
            placeholder="Rechercher par nom ou email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ maxWidth: "300px" }}
          />
        </div>

        {loading ? (
          <div className="text-center">
            <CSpinner color="primary" />
          </div>
        ) : (
          <CTable striped hover responsive>
            <CTableHead>
              <CTableRow>
                <CTableHeaderCell onClick={() => handleSort("name")} style={{ cursor: "pointer" }}>
                  Nom {getSortIcon("name")}
                </CTableHeaderCell>
                <CTableHeaderCell onClick={() => handleSort("email")} style={{ cursor: "pointer" }}>
                  Email {getSortIcon("email")}
                </CTableHeaderCell>
                <CTableHeaderCell onClick={() => handleSort("start_date")} style={{ cursor: "pointer" }}>
                  Début {getSortIcon("start_date")}
                </CTableHeaderCell>
                <CTableHeaderCell onClick={() => handleSort("end_date")} style={{ cursor: "pointer" }}>
                  Fin {getSortIcon("end_date")}
                </CTableHeaderCell>
                <CTableHeaderCell>Motif</CTableHeaderCell>
                <CTableHeaderCell onClick={() => handleSort("status")} style={{ cursor: "pointer" }}>
                  Statut {getSortIcon("status")}
                </CTableHeaderCell>
              </CTableRow>
            </CTableHead>
            <CTableBody>
              {filteredDemandes.length > 0 ? (
                filteredDemandes.map((d) => (
                  <CTableRow key={d.id}>
                    <CTableDataCell>{d.name}</CTableDataCell>
                    <CTableDataCell>{d.email}</CTableDataCell>
                    <CTableDataCell>{new Date(d.start_date).toLocaleDateString("fr-FR")}</CTableDataCell>
                    <CTableDataCell>{new Date(d.end_date).toLocaleDateString("fr-FR")}</CTableDataCell>
                    <CTableDataCell>{d.reason}</CTableDataCell>
                    <CTableDataCell>{renderStatus(d.status)}</CTableDataCell>
                  </CTableRow>
                ))
              ) : (
                <CTableRow>
                  <CTableDataCell colSpan={6} className="text-center">
                    Aucune demande trouvée
                  </CTableDataCell>
                </CTableRow>
              )}
            </CTableBody>
          </CTable>
        )}
      </CCardBody>
    </CCard>
    </div>
  )
}

export default AvancementWorkflow
