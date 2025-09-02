import { createContext } from "react"

export const PermissionsContext = createContext({
  actionsConfig: {},
  setActionsConfig: () => {},  // 👈 ajouté
  routesConfig: {},
  setRoutesConfig: () => {},   // 👈 déjà présent
  currentUserRoles: [],
})
