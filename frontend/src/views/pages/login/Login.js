import React from "react"
import {
  CButton,
  CCard,
  CCardBody,
  CCardGroup,
  CCol,
  CContainer,
  CRow,
} from "@coreui/react"
import { Link } from "react-router-dom"
import { API_THEME_LOGO } from "src/api"
import keycloak from "src/keycloak"

const Login = () => {
  const handleLogin = () => {
    keycloak.login()
  }

  return (
    <div className="bg-dark min-vh-100 d-flex flex-row align-items-center">
      <CContainer>
        <CRow className="justify-content-center">
          <CCol md={10} lg={8}>
            <div className="text-center mb-4">
              <img
                src={API_THEME_LOGO}
                alt="Logo"
                style={{ height: "70px", marginBottom: "15px" }}
              />
            </div>

            <CCardGroup>
              {/* Connexion */}
              <CCard className="p-5 shadow-lg border-0 text-center">
                <CCardBody>
                  <h2>Connexion</h2>
                  <p className="mt-3">
                    Connectez-vous à votre compte via <strong>Keycloak</strong>
                  </p>
                  <CButton
                    type="button"
                    color="primary"
                    className="px-4 text-center"
                    onClick={handleLogin}
                  >
                    Se connecter
                  </CButton>
                </CCardBody>
              </CCard>

              {/* Inscription */}
              <CCard className="text-white bg-primary p-5 shadow-lg border-0 text-center">
                <CCardBody>
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
