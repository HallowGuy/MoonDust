import React from 'react'
import {
  CAvatar,
  CBadge,
  CDropdown,
  CDropdownDivider,
  CDropdownHeader,
  CDropdownItem,
  CDropdownMenu,
  CDropdownToggle,
} from '@coreui/react'
import {
  cilBell,
  cilCreditCard,
  cilCommentSquare,
  cilEnvelopeOpen,
  cilFile,
  cilLockLocked,
  cilSettings,
  cilTask,
  cilUser,
} from '@coreui/icons'
import CIcon from '@coreui/icons-react'
import { jwtDecode } from 'jwt-decode' // ✅ import correct

import avatar8 from './../../assets/images/avatars/8.jpg'

const AppHeaderDropdown = () => {
  const token = localStorage.getItem('access_token')
  let username = 'Invité'

  if (token) {
    try {
      const decoded = jwtDecode(token)
      username = decoded?.preferred_username || decoded?.name || 'Utilisateur'
    } catch (e) {
      console.error('❌ Erreur de décodage du token', e)
    }
  }

  const handleLogout = () => {
    // 🔥 Supprimer les tokens du localStorage
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')

    // Rediriger vers la page de login (ou logout Keycloak si besoin)
    window.location.href = '/login'
  }

  return (
    <CDropdown variant="nav-item">
      <CDropdownToggle
  placement="bottom-end"
  className="py-0 pe-0 d-flex align-items-center gap-2"
  caret={false}
>
  <CAvatar src={avatar8} size="md" />
  <span className="mb-0">{username}</span>
</CDropdownToggle>

      <CDropdownMenu className="pt-0" placement="bottom-end">
  <CDropdownHeader className="bg-body-secondary fw-semibold mb-2">Compte</CDropdownHeader>
  
  {/* Profil */}
  <CDropdownItem href="/pages/profil/Profil">
    <CIcon icon={cilUser} className="me-2" />
    Profil
  </CDropdownItem>

  {/* Déconnexion */}
  <CDropdownItem onClick={handleLogout}>
    <CIcon icon={cilLockLocked} className="me-2" />
    Déconnexion
  </CDropdownItem>
</CDropdownMenu>

    </CDropdown>
  )
}

export default AppHeaderDropdown
