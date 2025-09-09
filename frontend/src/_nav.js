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
  cilImagePlus,
  cilSettings,
  cilPeople,
  cilLayers,
  cilListRich,
  cilList,
  cilFile,
  cilSpreadsheet,
  cilFeaturedPlaylist

  
} from '@coreui/icons'
import { CNavGroup, CNavItem, CNavTitle } from '@coreui/react'
import { API_ROUTES_CONFIG, API_BASE } from 'src/api'

const _nav = [
  {
    component: CNavItem,
    name: 'Dashboard',
    to: '/settings/settings',
    icon: <CIcon icon={cilSpeedometer} customClassName="nav-icon" />,
  },
  {
    component: CNavTitle,
    name: 'Annuaire',
  },
  
      {
    component: CNavItem,
    name: 'Contacts',
    to: '/annuaire/contacts',
    icon: <CIcon icon={cilUser} customClassName="nav-icon" />,
  },
  {
    component: CNavItem,
    name: 'Entreprises',
    to: '/annuaire/entreprises',
    icon: <CIcon icon={cilPeople} customClassName="nav-icon" />,
  },
  {
    component: CNavItem,
    name: 'Projets',
    to: '/annuaire/projets',
    icon: <CIcon icon={cilLayers} customClassName="nav-icon" />,
  }
      
    ,
    
  {
    component: CNavTitle,
    name: 'Workflow',
  },
  {
  component: CNavItem,
  name: 'Workflow',
  to: '/wkf/Workflow',
  icon: <CIcon icon={cilSpreadsheet} customClassName="nav-icon" />,
},

{
  component: CNavItem,
  name: 'Suivi demande',
  to: '/wkf/avancementworkflow',
  icon: <CIcon icon={cilFeaturedPlaylist} customClassName="nav-icon" />,
},
{
    component: CNavTitle,
    name: 'Formulaires',
  },
{
  component: CNavItem,
  name: 'Formulaires',
  to: '/editionforms',
  icon: <CIcon icon={cilNotes} customClassName="nav-icon" />,
},
{
    component: CNavTitle,
    name: 'Admin',
  },
  {
    component: CNavGroup,
    name: 'Paramétrage',
    to: '/parametrages',
    icon: <CIcon icon={cilSettings} customClassName="nav-icon" />,
    items: [
      {
    component: CNavItem,
    name: 'Utilisateurs',
    to: '/settings/list/users',
    icon: <CIcon icon={cilUser} customClassName="nav-icon" />,
  },
  {
    component: CNavItem,
    name: 'Rôles',
    to: '/settings/list/roles',
    icon: <CIcon icon={cilPeople} customClassName="nav-icon" />,
  },
  {
    component: CNavItem,
    name: 'Listes',
    to: '/settings/listes',
    icon: <CIcon icon={cilPeople} customClassName="nav-icon" />,
  },
  {
    component: CNavItem,
    name: 'Groupes',
    to: '/settings/list/groupes',
    icon: <CIcon icon={cilLayers} customClassName="nav-icon" />,
  },     
    ],
  },
  {
    component: CNavGroup,
    name: 'Sécurité',
    to: '/securite',
    icon: <CIcon icon={cilSettings} customClassName="nav-icon" />,
    items: [
      
  {
    component: CNavItem,
    name: 'Routes',
    to: '/settings/routes',
    icon: <CIcon icon={cilListRich} customClassName="nav-icon" />,
  },
  {
    component: CNavItem,
    name: 'Actions',
    to: '/settings/actions',
    icon: <CIcon icon={cilList} customClassName="nav-icon" />,
  },
  {
    component: CNavItem,
    name: 'Audit',
    to: '/settings/audit',
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
  },
  {
    component: CNavItem,
    name: 'Documents',
    to: '/import/documents',
    icon: <CIcon icon={cilFile} customClassName="nav-icon" />,
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


export function buildNav(routesConfig, userRoles) {
  const filterNav = (items) =>
    items
      .map((item) => {
        if (item.items) {
          const sub = filterNav(item.items)
          return sub.length ? { ...item, items: sub } : null
        } else if (item.to) {
          const allowedRoles = routesConfig[item.to] || []

          if (allowedRoles.length === 0) return item
          return allowedRoles.some((r) => userRoles.includes(r)) ? item : null
        }
        return item
      })
      .filter(Boolean)

  return filterNav(_nav)
}


export default _nav
