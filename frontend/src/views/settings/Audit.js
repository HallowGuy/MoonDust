import React, { useEffect, useState } from 'react'
import {
  CCard, CCardHeader, CCardBody,
  CTable, CTableHead, CTableRow, CTableHeaderCell, CTableBody, CTableDataCell,
  CToaster, CToast, CToastBody, CBadge, CFormInput
} from '@coreui/react'

import { API_BASE } from 'src/api'
const API = API_BASE

const AuditLogs = () => {
  const [logs, setLogs] = useState([])
  const [search, setSearch] = useState("")
  const [page, setPage] = useState(1)
  const itemsPerPage = 20

  // --- TOASTS ---
  const [toasts, setToasts] = useState([])
  const addToast = (message, color = 'danger') => {
    const id = Date.now()
    setToasts((prev) => [...prev, { id, message, color }])
  }
  const showError = (msg) => addToast(msg, 'danger')
  const removeToast = (id) => setToasts((prev) => prev.filter((t) => t.id !== id))

  useEffect(() => {
    fetch(`${API}/audit`)
      .then(res => {
        if (!res.ok) throw new Error('Impossible de charger les logs')
        return res.json()
      })
      .then(data => setLogs(data))
      .catch(() => showError('Erreur lors du chargement des logs'))
  }, [])

  // --- FILTRAGE ---
  const filteredLogs = logs.filter(log =>
    JSON.stringify(log).toLowerCase().includes(search.toLowerCase())
  )

  // --- PAGINATION ---
  const totalPages = Math.ceil(filteredLogs.length / itemsPerPage)
  const paginatedLogs = filteredLogs.slice((page - 1) * itemsPerPage, page * itemsPerPage)

  return (
    <div className="container py-4">
      <CCard className="mb-4 shadow-lg">
        <CCardHeader className="d-flex justify-content-between align-items-center">
          <h2 className="mb-0">Journal des actions</h2>
          <CFormInput
            placeholder="Rechercher..."
            style={{ maxWidth: 250 }}
            value={search}
            onChange={(e) => {
              setSearch(e.target.value)
              setPage(1)
            }}
          />
        </CCardHeader>
        <CCardBody>
          <CTable striped hover responsive>
            <CTableHead>
              <CTableRow>
                <CTableHeaderCell>Utilisateur</CTableHeaderCell>
                <CTableHeaderCell>Entité</CTableHeaderCell>
                <CTableHeaderCell>Action</CTableHeaderCell>
                <CTableHeaderCell>Meta</CTableHeaderCell>
                <CTableHeaderCell>Date</CTableHeaderCell>
              </CTableRow>
            </CTableHead>
            <CTableBody>
              {paginatedLogs.map((log) => (
                <CTableRow key={log.id}>
                  <CTableDataCell>
                    {log.actor_user_id === null ? (
                      <CBadge color="secondary">Utilisateur supprimé</CBadge>
                    ) : (
                      log.actor_username || log.actor_user_id
                    )}
                  </CTableDataCell>
                  <CTableDataCell>{`${log.entity_type} #${log.entity_id}`}</CTableDataCell>
                  <CTableDataCell>
                    <span className="badge bg-info text-dark">{log.action}</span>
                  </CTableDataCell>
                  <CTableDataCell>
                    <code>{JSON.stringify(log.meta)}</code>
                  </CTableDataCell>
                  <CTableDataCell>{new Date(log.occurred_at).toLocaleString()}</CTableDataCell>
                </CTableRow>
              ))}
            </CTableBody>
          </CTable>

          {/* Pagination simple */}
          <div className="d-flex justify-content-between align-items-center mt-3">
            <span>Page {page} sur {totalPages}</span>
            <div>
              <button
                className="btn btn-sm btn-outline-secondary me-2"
                disabled={page === 1}
                onClick={() => setPage(page - 1)}
              >
                ← Précédent
              </button>
              <button
                className="btn btn-sm btn-outline-secondary"
                disabled={page === totalPages}
                onClick={() => setPage(page + 1)}
              >
                Suivant →
              </button>
            </div>
          </div>
        </CCardBody>
      </CCard>

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

export default AuditLogs
