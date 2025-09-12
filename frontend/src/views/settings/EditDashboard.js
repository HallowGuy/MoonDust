// src/settings/SettingsDashboard.js
import React from 'react'
import { CCard, CCardHeader, CCardBody, CButton, CListGroup, CListGroupItem, CFormCheck } from '@coreui/react'
import { useDashboardPrefs } from 'src/dashboard/prefs/useDashboardPrefs'
import { WIDGETS_REGISTRY } from 'src/dashboard/registry'
import CIcon from '@coreui/icons-react'


import { cilArrowCircleTop, cilArrowCircleBottom } from '@coreui/icons'

const EditDashboard = ({ prefsApi, allowedIds }) => {
  const api = prefsApi || useDashboardPrefs()
  const { prefs, toggle, moveUp, moveDown, reset } = api

  // ✅ n’affiche que les widgets autorisés
  const editableOrder = (allowedIds && allowedIds.length
    ? prefs.order.filter((id) => allowedIds.includes(id))
    : prefs.order
  )

  return (
    <CCard className="mb-0">
      <CCardHeader>Personnaliser mon tableau de bord</CCardHeader>
      <CCardBody>
        <CListGroup className="mb-3">
          {editableOrder.map((id) => {
            const def = WIDGETS_REGISTRY[id]
            if (!def) return null
            const checked = prefs.visible.includes(id)
            return (
              <CListGroupItem key={id} className="d-flex align-items-center justify-content-between">
                <CFormCheck id={`chk-${id}`} checked={checked} onChange={() => toggle(id)} label={def.title} />
                <div className="d-flex gap-2">
                  <CButton color="info" variant='ghost' size="sm" onClick={() => moveUp(id)}><CIcon icon={cilArrowCircleTop} size="lg" /> </CButton>
                  <CButton color="info" variant='ghost' size="sm" onClick={() => moveDown(id)}><CIcon icon={cilArrowCircleBottom} size="lg" /> </CButton>
                </div>
              </CListGroupItem>
            )
          })}
        </CListGroup>
        <CButton color="primary" onClick={reset}>Réinitialiser les widgets</CButton>
      </CCardBody>
    </CCard>
  )
}

export default EditDashboard
