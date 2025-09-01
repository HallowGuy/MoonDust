import React, { useEffect } from 'react'
import { CContainer, CRow, CCol, CCard, CCardBody } from '@coreui/react'

const Callback = () => {
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const code = params.get('code')
    const verifier = sessionStorage.getItem('pkce_verifier')

    if (!code || !verifier) {
      console.error('❌ Code ou PKCE verifier manquant')
      return
    }

    fetch('http://localhost:8081/realms/REALM_REUNION/protocol/openid-connect/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        client_id: 'react-app',
        code,
        redirect_uri: 'http://localhost:3002/callback',
        code_verifier: verifier,
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.access_token) {
          localStorage.setItem('access_token', data.access_token)
          localStorage.setItem('refresh_token', data.refresh_token)
          window.location.href = '/' // redirection après login
        } else {
          console.error('❌ Impossible de récupérer le token', data)
        }
      })
      .catch((err) => console.error('❌ Erreur Callback Keycloak', err))
  }, [])

  return (
    <div className="bg-body-tertiary min-vh-100 d-flex flex-row align-items-center">
      <CContainer>
        <CRow className="justify-content-center">
          <CCol md={6}>
            <CCard>
              <CCardBody className="text-center">
                <h2>Connexion en cours...</h2>
                <p>Veuillez patienter pendant que nous validons votre compte</p>
              </CCardBody>
            </CCard>
          </CCol>
        </CRow>
      </CContainer>
    </div>
  )
}

export default Callback
