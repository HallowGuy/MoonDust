import React from 'react'
import {
  CAvatar,
  CDropdown,
  CDropdownHeader,
  CDropdownItem,
  CDropdownMenu,
  CDropdownToggle,
} from '@coreui/react'
import { cilUser, cilLockLocked } from '@coreui/icons'
import CIcon from '@coreui/icons-react'
import { jwtDecode } from 'jwt-decode'
import keycloak from 'src/keycloak'

import avatar8 from './../../assets/images/avatars/8.jpg'

const AppHeaderDropdown = () => {
  // Récupérer le token pour afficher l'utilisateur
  const token = localStorage.getItem('access_token')
  let username = 'Invité'

  if (token) {
    try {
      const decoded = jwtDecode(token)
      username = decoded?.preferred_username || decoded?.name || 'Utilisateur'
    } catch (e) {
      console.error('❌ Erreur décodage token', e)
    }
  }

  const handleLogout = () => {
    // Déclenche le logout Keycloak
    keycloak.logout({
      redirectUri: window.location.origin + '/login',
    })

    // Sécurité : nettoyer le localStorage
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
  }

  return (
    <CDropdown variant="nav-item">
  <CDropdownToggle
    placement="bottom-end"
    caret={false}
    className="py-0 pe-0 d-flex align-items-center gap-2"
  >
    <span className="d-flex align-items-center" style={{ lineHeight: "2.4" }}>
{username}</span>
  </CDropdownToggle>

  <CDropdownMenu className="pt-0" placement="bottom-end">
    <CDropdownHeader className="bg-body-secondary fw-semibold mb-2">
      Compte
    </CDropdownHeader>

    <CDropdownItem href="/pages/profil/Profil">
      <CIcon icon={cilUser} className="me-2" />
      Profil
    </CDropdownItem>

    <CDropdownItem onClick={handleLogout}>
      <CIcon icon={cilLockLocked} className="me-2" />
      Déconnexion
    </CDropdownItem>
  </CDropdownMenu>
</CDropdown>

  )
}

export default AppHeaderDropdown
