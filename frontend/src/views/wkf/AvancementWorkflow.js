import React, { useEffect, useState } from 'react'
import {
  CCard, CCardHeader, CCardBody,
  CTable, CTableHead, CTableRow, CTableHeaderCell, CTableBody, CTableDataCell,
  CBadge, CSpinner,
} from '@coreui/react'

const API = import.meta.env.VITE_API_URL

const AvancementWorkflow = () => {
  const [demandes, setDemandes] = useState([])
  const [loading, setLoading] = useState(true)

  // ---------- FETCH DEMANDES ----------
  const fetchDemandes = async () => {
    try {
      const res = await fetch(`${API}/conges`) // ✅ route corrigée
      if (!res.ok) throw new Error("Impossible de charger les demandes")
      const data = await res.json()
      setDemandes(data)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDemandes()
  }, [])

  // ---------- STATUS BADGE ----------
  const renderStatus = (status) => {
    switch (status) {
      case "APPROUVÉ":
        return <CBadge color="success">Approuvée</CBadge>
      case "REJETÉ":
        return <CBadge color="danger">Rejetée</CBadge>
      default:
        return <CBadge color="warning">En attente</CBadge>
    }
  }

  return (
    <CCard className="mb-4">
      <CCardHeader>
        <h2 className="mb-0">Avancement des demandes de congés</h2>
      </CCardHeader>
      <CCardBody>
        {loading ? (
          <div className="text-center">
            <CSpinner color="primary" />
          </div>
        ) : (
          <CTable striped hover responsive>
            <CTableHead>
              <CTableRow>
                <CTableHeaderCell>Nom</CTableHeaderCell>
                <CTableHeaderCell>Email</CTableHeaderCell>
                <CTableHeaderCell>Début</CTableHeaderCell>
                <CTableHeaderCell>Fin</CTableHeaderCell>
                <CTableHeaderCell>Motif</CTableHeaderCell>
                <CTableHeaderCell>Statut</CTableHeaderCell>
              </CTableRow>
            </CTableHead>
            <CTableBody>
              {demandes.map((d) => (
                <CTableRow key={d.id}>
                  <CTableDataCell>{d.name}</CTableDataCell>
<CTableDataCell>{d.email}</CTableDataCell>
<CTableDataCell>{d.start_date}</CTableDataCell>
<CTableDataCell>{d.end_date}</CTableDataCell>
<CTableDataCell>{d.reason}</CTableDataCell>
<CTableDataCell>{renderStatus(d.status)}</CTableDataCell>

                </CTableRow>
              ))}
            </CTableBody>
          </CTable>
        )}
      </CCardBody>
    </CCard>
  )
}

export default AvancementWorkflow
