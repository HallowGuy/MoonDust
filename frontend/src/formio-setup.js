import { Formio } from "formiojs"

// 🚫 Empêche tout appel au SaaS form.io
Formio.setBaseUrl("http://localhost/fake")
Formio.setProjectUrl("http://localhost/fake")

Formio.appUrl = "http://localhost/fake"
Formio.projectUrl = ""

// 🚫 Neutralise le chargement automatique du projet
Formio.loadProject = () => Promise.resolve({})

// (optionnel) : désactiver la vérification des ressources externes
Formio.fetch = (url, options) => {
  console.log("🔒 Interception fetch Formio:", url)
  return Promise.resolve({
    ok: true,
    json: async () => ({}),
  })
}

console.log("✅ Form.io standalone setup appliqué")
