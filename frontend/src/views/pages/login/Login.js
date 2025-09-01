import React from 'react'
import { Link } from 'react-router-dom'
import { generatePKCE } from 'src/pkce'

import {
  CButton,
  CCard,
  CCardBody,
  CCardGroup,
  CCol,
  CContainer,
  CForm,
  CRow,
} from '@coreui/react'
import { API_THEME_LOGO  } from 'src/api'
const CLIENT_ID = import.meta.env.VITE_FRONT_ID
const Login = () => {
  const handleLogin = async () => {
    const { verifier, challenge } = await generatePKCE()
    sessionStorage.setItem('pkce_verifier', verifier)

const url = new URL(`${import.meta.env.VITE_KEYCLOAK_URL}/realms/${import.meta.env.VITE_REALM}/protocol/openid-connect/auth`)
    url.searchParams.append('client_id', CLIENT_ID)
    url.searchParams.append('response_type', 'code')
    url.searchParams.append('scope', 'openid profile email')
    url.searchParams.append('redirect_uri', 'http://localhost:3002/callback')
    url.searchParams.append('code_challenge', challenge)
    url.searchParams.append('code_challenge_method', 'S256')
    url.searchParams.append('prompt', 'login')


    window.location.href = url.toString()
  }

  return (
    <div className="bg-dark min-vh-100 d-flex flex-row align-items-center">
      <CContainer>
        <CRow className="justify-content-center">
          <CCol md={10} lg={8}>
            <div className="text-center mb-4">
              {/* Logo du backend */}
              <img
                src={API_THEME_LOGO}
                alt="Logo"
                style={{ height: '70px', marginBottom: '15px' }}
              />
              
            </div>

            <CCardGroup>
              {/* Connexion */}
              <CCard className="p-5 shadow-lg border-0 text-center">
                <CCardBody>
                  
                  <div>
                    <h2>Connexion</h2>
                    <p className="mt-3">Connectez-vous à votre compte via <strong>Keycloak</strong></p>
                    <Link to="/login">
                       <CButton color="primary" className="px-4 text-center" onClick={handleLogin}>
                          Se connecter
                        </CButton>
                        
                    </Link>
                  </div>
                </CCardBody>
              </CCard>

              {/* Inscription */}
              <CCard className="text-white bg-primary p-5 shadow-lg border-0 text-center">
                <CCardBody>
                  <div>
                    <h2>S'inscrire</h2>
                    <p className="mt-3">Rejoignez-nous dès maintenant</p>
                    <Link to="/register">
                      <CButton
                        color="light"
                        variant="outline"
                        className="mt-3 fw-bold px-4"
                        active
                        tabIndex={-1}
                      >
                        Créer un compte
                      </CButton>
                    </Link>
                  </div>
                </CCardBody>
              </CCard>
            </CCardGroup>
          </CCol>
        </CRow>
      </CContainer>
    </div>
  )
}

export default Login
