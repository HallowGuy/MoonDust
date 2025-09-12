import React from 'react'
import { CWidgetStatsD } from '@coreui/react'
import CIcon from '@coreui/icons-react'
import {
  cilUser,
  cilShieldAlt,
  cilLayers,
  cilHome,
  cilNotes,
  cilList,
  cilBolt,
  cilMap,
} from '@coreui/icons'
import { useDashboardData } from '../../dashboard/dashboard-data'

export const UsersWidget = () => {
  const { users } = useDashboardData()
  return (
    <CWidgetStatsD
      color="warning"
      icon={<CIcon icon={cilUser} height={52} className="my-4 text-white" />}
      values={[
        { title: 'Utilisateurs', value: String(users.count) },
        { title: 'Actifs', value: String(users.active) },
      ]}
    />
  )
}

export const RolesWidget = () => {
  const { roles } = useDashboardData()
  return (
    <CWidgetStatsD
      icon={<CIcon icon={cilShieldAlt} height={52} className="my-4 text-white" />}
      values={[{ title: 'Rôles', value: String(roles.count) }]}
      style={{ '--cui-card-cap-bg': '#4875b4' }}
    />
  )
}

export const GroupsWidget = () => {
  const { groups } = useDashboardData()
  return (
    <CWidgetStatsD
      icon={<CIcon icon={cilLayers} height={52} className="my-4 text-white" />}
      values={[
        { title: 'Groupes', value: String(groups.groups) },
        { title: 'Sous-groupes', value: String(groups.subGroups) },
      ]}
      style={{ '--cui-card-cap-bg': '#00aced' }}
    />
  )
}

export const RealmWidget = () => {
  const { realm } = useDashboardData()
  return (
    <CWidgetStatsD
      icon={<CIcon icon={cilHome} height={52} className="my-4 text-white" />}
      values={[{ title: 'Nom du realm', value: String(realm.name) }]}
      style={{ '--cui-card-cap-bg': '#3b5998' }}
    />
  )
}

/* --- Nouveaux widgets --- */
export const FormsWidget = () => {
  const { forms = { count: 0 } } = useDashboardData()
  return (
    <CWidgetStatsD
      icon={<CIcon icon={cilNotes} height={52} className="my-4 text-white" />}
      values={[{ title: 'Formulaires', value: String(forms?.count ?? 0) }]}
      style={{ '--cui-card-cap-bg': '#6f42c1' }}
    />
  )
}

export const ListsWidget = () => {
  const { lists = { count: 0 } } = useDashboardData()
  return (
    <CWidgetStatsD
      icon={<CIcon icon={cilList} height={52} className="my-4 text-white" />}
      values={[{ title: 'Listes', value: String(lists?.count ?? 0) }]}
      style={{ '--cui-card-cap-bg': '#0d6efd' }}
    />
  )
}

export const ActionsWidget = () => {
  const { actions = { count: 0 } } = useDashboardData()
  return (
    <CWidgetStatsD
      icon={<CIcon icon={cilBolt} height={52} className="my-4 text-white" />}
      values={[{ title: 'Actions', value: String(actions?.count ?? 0) }]}
      style={{ '--cui-card-cap-bg': '#198754' }}
    />
  )
}

export const RoutesWidget = () => {
  const { routes = { count: 0 } } = useDashboardData()
  return (
    <CWidgetStatsD
      icon={<CIcon icon={cilMap} height={52} className="my-4 text-white" />}
      values={[{ title: 'Routes', value: String(routes?.count ?? 0) }]}
      style={{ '--cui-card-cap-bg': '#fd7e14' }}
    />
  )
}
