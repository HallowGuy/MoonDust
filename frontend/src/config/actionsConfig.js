// src/config/actionsConfig.js
export const ACTIONS_CONFIG = {
  user: {
    edit: ["admin", "manager"],    // qui peut éditer un utilisateur
    delete: ["admin"],             // qui peut supprimer
    create: ["admin"],             // bouton "nouvel utilisateur"
  },
  role: {
    edit: ["admin"],
    delete: ["admin"],
  },
  groupe: {
    create: ["admin", "manager"],
    delete: ["admin"],
  }
}
