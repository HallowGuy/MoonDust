import React from 'react'
import ProtectedRoute from "./components/ProtectedRoute"

const Dashboard = React.lazy(() => import('./views/dashboard/Dashboard'))
const Users = React.lazy(() => import('./views/settings/list/Users'))
const Roles = React.lazy(() => import('./views/settings/list/Roles'))
const Groupes = React.lazy(() => import('./views/settings/list/Groupes'))
const Documents = React.lazy(() => import('./views/import/Documents'))
const ThemeColors = React.lazy(() => import('./views/settings/custom/ThemeColors'))
const ThemeLogo = React.lazy(() => import('./views/settings/custom/ThemeLogo'))
const Audit = React.lazy(() => import('./views/settings/Audit'))
const Test = React.lazy(() => import('./views/wkf/Test'))
const AvancementWorkflow = React.lazy(() => import('./views/wkf/AvancementWorkflow'))
const Workflow = React.lazy(() => import('./views/wkf/Workflow'))
const DetailConge = React.lazy(() => import('./views/wkf/DetailConge'))
const Routes = React.lazy(() => import('./views/settings/Routes'))
const Actions = React.lazy(() => import('./views/settings/Actions'))
const Profil = React.lazy(() => import('./views/pages/profil/Profil'))
const Settings = React.lazy(() => import('./views/settings/Settings'))
const FormioBuilder = React.lazy(() => import('./views/forms/FormioBuilder'))
const FormioRenderer = React.lazy(() => import('./views/forms/FormioRenderer'))
const EditionForms = React.lazy(() => import('./views/forms/EditionForms'))
const FormBuilderPage = React.lazy(() => import('./views/forms/FormBuilderPage'))
const FormRenderPage = React.lazy(() => import('./views/forms/FormRenderPage'))


// Base
const Accordion = React.lazy(() => import('./views/base/accordion/Accordion'))
const Breadcrumbs = React.lazy(() => import('./views/base/breadcrumbs/Breadcrumbs'))
const Cards = React.lazy(() => import('./views/base/cards/Cards'))
const Carousels = React.lazy(() => import('./views/base/carousels/Carousels'))
const Collapses = React.lazy(() => import('./views/base/collapses/Collapses'))
const ListGroups = React.lazy(() => import('./views/base/list-groups/ListGroups'))
const Navs = React.lazy(() => import('./views/base/navs/Navs'))
const Paginations = React.lazy(() => import('./views/base/paginations/Paginations'))
const Placeholders = React.lazy(() => import('./views/base/placeholders/Placeholders'))
const Popovers = React.lazy(() => import('./views/base/popovers/Popovers'))
const Progress = React.lazy(() => import('./views/base/progress/Progress'))
const Spinners = React.lazy(() => import('./views/base/spinners/Spinners'))
const Tabs = React.lazy(() => import('./views/base/tabs/Tabs'))
const Tables = React.lazy(() => import('./views/base/tables/Tables'))
const Tooltips = React.lazy(() => import('./views/base/tooltips/Tooltips'))

// Buttons
const Buttons = React.lazy(() => import('./views/buttons/buttons/Buttons'))
const ButtonGroups = React.lazy(() => import('./views/buttons/button-groups/ButtonGroups'))
const Dropdowns = React.lazy(() => import('./views/buttons/dropdowns/Dropdowns'))

// Forms
const ChecksRadios = React.lazy(() => import('./views/forms/checks-radios/ChecksRadios'))
const FloatingLabels = React.lazy(() => import('./views/forms/floating-labels/FloatingLabels'))
const FormControl = React.lazy(() => import('./views/forms/form-control/FormControl'))
const InputGroup = React.lazy(() => import('./views/forms/input-group/InputGroup'))
const Layout = React.lazy(() => import('./views/forms/layout/Layout'))
const Range = React.lazy(() => import('./views/forms/range/Range'))
const Select = React.lazy(() => import('./views/forms/select/Select'))
const Validation = React.lazy(() => import('./views/forms/validation/Validation'))

// Charts
const Charts = React.lazy(() => import('./views/charts/Charts'))

// Icons
const CoreUIIcons = React.lazy(() => import('./views/icons/coreui-icons/CoreUIIcons'))
const Flags = React.lazy(() => import('./views/icons/flags/Flags'))
const Brands = React.lazy(() => import('./views/icons/brands/Brands'))

// Notifications
const Alerts = React.lazy(() => import('./views/notifications/alerts/Alerts'))
const Badges = React.lazy(() => import('./views/notifications/badges/Badges'))
const Modals = React.lazy(() => import('./views/notifications/modals/Modals'))
const Toasts = React.lazy(() => import('./views/notifications/toasts/Toasts'))

// Widgets
const Widgets = React.lazy(() => import('./views/widgets/Widgets'))

const routes = [
  { path: '/', name: 'Accueil', element: Settings  },
  { path: '/dashboard', name: 'Dashboard', element: Dashboard  },
  { path: '/settings/settings', name: 'Paramétrage', element: Settings  },

  { path: '/settings/list/users', name: 'Gestion des utilisateurs', element: Users  },
  { path: '/settings/list/roles', name: 'Gestion des rôles', element: Roles  },
  { path: '/settings/list/groupes', name: 'Gestion des groupes', element: Groupes  },

  { path: '/import/documents', name: 'Gestion des documents', element: Documents  },

  { path: '/settings/custom/themecolors', name: 'Gestion des couleurs', element: ThemeColors  },
  { path: '/settings/custom/themelogo', name: 'Gestion du logo', element: ThemeLogo  },
  { path: '/settings/audit', name: 'Journal audit', element: Audit  },
  { path: '/settings/routes', name: 'Édition des accès', element: Routes  },
  { path: '/settings/actions', name: 'Permissions', element: Actions  },
    { path: '/forms/formiobuilder', name: 'Permissions', element: FormioBuilder  },
  { path: '/forms/formiorenderer', name: 'Affichage formulaire', element: FormioRenderer  },
  { path: '/editionforms', name: 'Edition de formulaire', element: EditionForms  },
  { path: '/forms/:id/builder', name: 'Edition formulaire ', element: FormBuilderPage  },
    { path: '/forms/:id/view', name: 'Visualisation formulaire ', element: FormRenderPage  },


  { path: '/wkf/test', name: 'Test Workflow', element: Test  },
  { path: '/wkf/avancementworkflow', name: 'Avancement Workflow', element: AvancementWorkflow  },
  { path: '/wkf/workflow', name: 'Liste Workflow', element: Workflow  },
  { path: '/wkf/DetailConge/detail/:id', name: 'Détail Congé', element: DetailConge  },

  { path: '/pages/profil/profil', name: 'Mon profil', element: Profil  },

  // Base
  { path: '/base', name: 'Base', exact: true, element: Cards  },
  { path: '/base/accordion', name: 'Accordion', element: Accordion  },
  { path: '/base/breadcrumbs', name: 'Breadcrumbs', element: Breadcrumbs  },
  { path: '/base/cards', name: 'Cards', element: Cards  },
  { path: '/base/carousels', name: 'Carousel', element: Carousels  },
  { path: '/base/collapses', name: 'Collapse', element: Collapses  },
  { path: '/base/list-groups', name: 'List Groups', element: ListGroups  },
  { path: '/base/navs', name: 'Navs', element: Navs  },
  { path: '/base/paginations', name: 'Paginations', element: Paginations  },
  { path: '/base/placeholders', name: 'Placeholders', element: Placeholders  },
  { path: '/base/popovers', name: 'Popovers', element: Popovers  },
  { path: '/base/progress', name: 'Progress', element: Progress  },
  { path: '/base/spinners', name: 'Spinners', element: Spinners  },
  { path: '/base/tabs', name: 'Tabs', element: Tabs  },
  { path: '/base/tables', name: 'Tables', element: Tables  },
  { path: '/base/tooltips', name: 'Tooltips', element: Tooltips  },

  // Buttons
  { path: '/buttons', name: 'Buttons', exact: true, element: Buttons  },
  { path: '/buttons/buttons', name: 'Buttons', element: Buttons  },
  { path: '/buttons/dropdowns', name: 'Dropdowns', element: Dropdowns  },
  { path: '/buttons/button-groups', name: 'Button Groups', element: ButtonGroups  },

  // Charts
  { path: '/charts', name: 'Charts', element: Charts  },

  // Forms
  { path: '/forms', name: 'Forms', exact: true, element: FormControl  },
  { path: '/forms/form-control', name: 'Form Control', element: FormControl  },
  { path: '/forms/select', name: 'Select', element: Select  },
  { path: '/forms/checks-radios', name: 'Checks & Radios', element: ChecksRadios  },
  { path: '/forms/range', name: 'Range', element: Range  },
  { path: '/forms/input-group', name: 'Input Group', element: InputGroup  },
  { path: '/forms/floating-labels', name: 'Floating Labels', element: FloatingLabels  },
  { path: '/forms/layout', name: 'Layout', element: Layout  },
  { path: '/forms/validation', name: 'Validation', element: Validation  },

  // Icons
  { path: '/icons', name: 'Icons', exact: true, element: CoreUIIcons },
  { path: '/icons/coreui-icons', name: 'CoreUI Icons', element: CoreUIIcons  },
  { path: '/icons/flags', name: 'Flags', element: Flags  },
  { path: '/icons/brands', name: 'Brands', element: Brands },

  // Notifications
  { path: '/notifications', name: 'Notifications', exact: true, element:Alerts},
  { path: '/notifications/alerts', name: 'Alerts', element: Alerts },
  { path: '/notifications/badges', name: 'Badges', element: Badges  },
  { path: '/notifications/modals', name: 'Modals', element: Modals },
  { path: '/notifications/toasts', name: 'Toasts', element: Toasts },

  // Widgets
  { path: '/widgets', name: 'Widgets', element: Widgets },
]

export default routes

