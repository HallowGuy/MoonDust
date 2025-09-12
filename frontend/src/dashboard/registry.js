// src/dashboard/registry.js
import {
  UsersWidget, RolesWidget, GroupsWidget, RealmWidget,
  FormsWidget, ListsWidget, ActionsWidget, RoutesWidget
} from 'src/views/widgets/KpiWidgets'

export const WIDGETS_REGISTRY = {
  users:  { id: 'users',  title: 'Utilisateurs', component: UsersWidget, to: '/settings/users',   action: 'widgets.users.view'  },
  roles:  { id: 'roles',  title: 'Rôles',        component: RolesWidget, to: '/settings/roles',   action: 'widgets.roles.view'  },
  groups: { id: 'groups', title: 'Groupes',      component: GroupsWidget,to: '/settings/groupes', action: 'widgets.groups.view' },
  realm:  { id: 'realm',  title: 'Realm',        component: RealmWidget, onClick: () => alert('Realm details'), action: 'widgets.realm.view' },
  forms:  { id: 'forms',  title: 'Formulaires', component: FormsWidget,  to: '/forms', action: 'widgets.forms.view' },
  listes: { id: 'listes', title: 'Listes',      component: ListsWidget,  to: '/settings/listes', action: 'widgets.lists.view' },
  actions:{ id: 'actions',title: 'Actions',     component: ActionsWidget, to: '/settings/actions' ,action: 'widgets.actions.view' },
  routes: { id: 'routes', title: 'Routes',      component: RoutesWidget,  to: '/settings/routes', action: 'widgets.routes.view' },
}


export const DEFAULT_WIDGET_IDS = Object.keys(WIDGETS_REGISTRY)