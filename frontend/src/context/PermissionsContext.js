import { createContext } from "react"

export const PermissionsContext = createContext({
  actionsConfig: {},
  setActionsConfig: () => {},
  routesConfig: {},
  setRoutesConfig: () => {},
  currentUserRoles: [],
  setCurrentUserRoles: () => {}
})
