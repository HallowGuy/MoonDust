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
        <CDropdownItem href="#">
          <CIcon icon={cilBell} className="me-2" />
          Updates
          <CBadge color="info" className="ms-2">42</CBadge>
        </CDropdownItem>
        <CDropdownItem href="#">
          <CIcon icon={cilEnvelopeOpen} className="me-2" />
          Messages
          <CBadge color="success" className="ms-2">42</CBadge>
        </CDropdownItem>
        <CDropdownItem href="#">
          <CIcon icon={cilTask} className="me-2" />
          Tasks
          <CBadge color="danger" className="ms-2">42</CBadge>
        </CDropdownItem>
        <CDropdownItem href="#">
          <CIcon icon={cilCommentSquare} className="me-2" />
          Comments
          <CBadge color="warning" className="ms-2">42</CBadge>
        </CDropdownItem>

        <CDropdownHeader className="bg-body-secondary fw-semibold my-2">Paramétrage</CDropdownHeader>
        <CDropdownItem href="#">
          <CIcon icon={cilUser} className="me-2" />
          Profile
        </CDropdownItem>
        <CDropdownItem href="#">
          <CIcon icon={cilSettings} className="me-2" />
          Settings
        </CDropdownItem>
        <CDropdownItem href="#">
          <CIcon icon={cilCreditCard} className="me-2" />
          Payments
          <CBadge color="secondary" className="ms-2">42</CBadge>
        </CDropdownItem>
        <CDropdownItem href="#">
          <CIcon icon={cilFile} className="me-2" />
          Projects
          <CBadge color="primary" className="ms-2">42</CBadge>
        </CDropdownItem>

        <CDropdownDivider />
        {/* 🔥 Déconnexion */}
        <CDropdownItem href="#" onClick={handleLogout}>
          <CIcon icon={cilLockLocked} className="me-2" />
          Déconnexion
        </CDropdownItem>
      </CDropdownMenu>
    </CDropdown>
  )
}

export default AppHeaderDropdown
