// src/views/pages/login/Login.js
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
import { API_THEME_LOGO, KEYCLOAK_URL as KC_URL, REALM, CLIENT_ID } from "src/api"
import { generatePKCE } from "src/pkce"
import { safeBuildUrl } from "src/utils/url"

const Login = () => {
  const handleLogin = async () => {
    console.log("🔑 --- DEBUG LOGIN ---")
    console.log("👉 KEYCLOAK_URL =", KC_URL)
    console.log("👉 REALM =", REALM)
    console.log("👉 CLIENT_ID =", CLIENT_ID)
    console.log("👉 import.meta.env =", import.meta.env)

    // sécurité : vérifier que les valeurs existent
    if (!KC_URL || !REALM || !CLIENT_ID) {
      alert("❌ Variables Keycloak manquantes ! Vérifie ton .env et src/api.js")
      return
    }

    // génération PKCE
    const { verifier, challenge } = await generatePKCE()
    sessionStorage.setItem("pkce_verifier", verifier)
    console.log("👉 PKCE challenge généré:", challenge)

    const redirectUri = `${window.location.origin}/callback`
    console.log("👉 redirectUri:", redirectUri)

    // construction de l’URL d’auth
    const authUrlStr = safeBuildUrl(`/realms/${REALM}/protocol/openid-connect/auth`, KC_URL)
    const url = new URL(authUrlStr)
    url.searchParams.append("client_id", CLIENT_ID)
    url.searchParams.append("response_type", "code")
    url.searchParams.append("scope", "openid profile email")
    url.searchParams.append("redirect_uri", redirectUri)
    url.searchParams.append("code_challenge", challenge)
    url.searchParams.append("code_challenge_method", "S256")
    url.searchParams.append("prompt", "login")

    console.log("🔗 Redirection vers Keycloak:", url.toString())

    // redirection réelle
    window.location.href = url.toString()
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
