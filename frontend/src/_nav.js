import React from 'react'
import CIcon from '@coreui/icons-react'
import {
  cilBell,
  cilCalculator,
  cilChartPie,
  cilCursor,
  cilDescription,
  cilDrop,
  cilExternalLink,
  cilNotes,
  cilPencil,
  cilPuzzle,
  cilSpeedometer,
  cilStar,
  cilUser,
  cilImagePlus

  
} from '@coreui/icons'
import { CNavGroup, CNavItem, CNavTitle } from '@coreui/react'
import { API_ROUTES_CONFIG, API_BASE } from 'src/api'

const _nav = [
  {
    component: CNavItem,
    name: 'Paramétrage',
    to: '/settings/settings',
    icon: <CIcon icon={cilSpeedometer} customClassName="nav-icon" />,
  },
  {
    component: CNavTitle,
    name: 'Interface',
  },
  {
    component: CNavItem,
    name: 'Liste utilisateurs',
    to: '/settings/list/users',
    icon: <CIcon icon={cilUser} customClassName="nav-icon" />,
  },
  {
    component: CNavItem,
    name: 'Liste rôles',
    to: '/settings/list/roles',
    icon: <CIcon icon={cilUser} customClassName="nav-icon" />,
  },
  {
    component: CNavItem,
    name: 'Liste groupes',
    to: '/settings/list/groupes',
    icon: <CIcon icon={cilUser} customClassName="nav-icon" />,
  },
  {
    component: CNavItem,
    name: 'Documents',
    to: '/import/documents',
    icon: <CIcon icon={cilUser} customClassName="nav-icon" />,
  },
   {
    component: CNavItem,
    name: 'Audit',
    to: '/settings/custom/AuditLogs',
    icon: <CIcon icon={cilUser} customClassName="nav-icon" />,
  },
  {
    component: CNavItem,
    name: 'Edition route',
    to: '/settings/custom/editionRoute',
    icon: <CIcon icon={cilUser} customClassName="nav-icon" />,
  },
  
  {
    component: CNavTitle,
    name: 'Workflow',
  },
  {
  component: CNavItem,
  name: 'Workflow',
  to: '/wkf/Workflow',
  icon: <CIcon icon={cilUser} customClassName="nav-icon" />,
},

{
  component: CNavItem,
  name: 'Suivi demande',
  to: '/wkf/avancementworkflow',
  icon: <CIcon icon={cilUser} customClassName="nav-icon" />,
},

{
    component: CNavGroup,
    name: 'Détails',
    to: '/details',
    icon: <CIcon icon={cilPuzzle} customClassName="nav-icon" />,
    items: [
       {
  component: CNavItem,
  name: 'Demande de congés',
  to: '/wkf/test',
  icon: <CIcon icon={cilUser} customClassName="nav-icon" />,
},
      
     
    ],
  },

 {
    component: CNavTitle,
    name: 'Personnalisation',
  },
  {
    component: CNavItem,
    name: 'Couleurs',
    to: '/settings/custom/themecolors',
    icon: <CIcon icon={cilDrop} customClassName="nav-icon" />,
  },
   {
    component: CNavItem,
    name: 'Logo',
    to: '/settings/custom/themelogo',
    icon: <CIcon icon={cilImagePlus} customClassName="nav-icon" />,
  }
]

export async function getUserRoles() {
  const token = localStorage.getItem("access_token")
  //console.log("🔑 Token envoyé à /me/roles:", token)

  const res = await fetch(`${API_BASE}/me/roles`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })

  //console.log("📡 Status réponse /me/roles:", res.status)

  if (!res.ok) {
    console.error("❌ Erreur brut /me/roles:", await res.text())
    throw new Error("Impossible de récupérer les rôles utilisateur")
  }

  const data = await res.json()
  //console.log("📥 Réponse JSON /me/roles:", data)

  const roles = data.roles || []
  console.log("✅ Rôles utilisateur extraits:", roles)

  return roles
}


export async function buildNav() {
  const roles = await getUserRoles()
  const res = await fetch(API_ROUTES_CONFIG)
  const config = await res.json()

  const filterNav = (items) =>
    items
      .map((item) => {
        if (item.items) {
          const sub = filterNav(item.items)
          return sub.length ? { ...item, items: sub } : null
        } else if (item.to) {
          const allowedRoles = config[item.to] || []
          //console.log("🔎 Vérif accès:", item.to, "→ requis:", allowedRoles, "→ user:", roles)

          if (allowedRoles.length === 0) return item
          return allowedRoles.some((r) => roles.includes(r)) ? item : null
        }
        return item
      })
      .filter(Boolean)

  return filterNav(_nav)
}

export default _nav
