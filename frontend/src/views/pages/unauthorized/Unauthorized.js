import React from 'react'
import { CButton, CCard, CCardBody, CCol, CContainer, CRow } from '@coreui/react'
import { useNavigate } from 'react-router-dom'

const Unauthorized = () => {
  const navigate = useNavigate()

  return (
    <div className="bg-body-tertiary min-vh-100 d-flex flex-row align-items-center">
      <CContainer>
        <CRow className="justify-content-center">
          <CCol md={6}>
            <CCard className="p-4 text-center">
              <CCardBody>
                <h1 className="text-danger">403</h1>
                <h4 className="mb-3">Accès non autorisé</h4>
                <p className="text-body-secondary">
                  Vous n’avez pas les permissions nécessaires pour accéder à cette page.
                </p>
                <CButton color="primary" onClick={() => navigate('/')}>
                  Retour à l’accueil
                </CButton>
              </CCardBody>
            </CCard>
          </CCol>
        </CRow>
      </CContainer>
    </div>
  )
}

export default Unauthorized
