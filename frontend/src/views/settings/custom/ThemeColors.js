import React, { useEffect, useState } from 'react'
import {
  CToaster,
  CToast,
  CToastBody,
  CCard,
  CCardHeader,
  CCardBody,
  CButton
} from '@coreui/react'

import { API_BASE } from 'src/api'
const API = API_BASE

// Utilitaire : hex → rgb
function hexToRgb(hex) {
  const cleanHex = hex.replace('#', '')
  const bigint = parseInt(cleanHex, 16)
  const r = (bigint >> 16) & 255
  const g = (bigint >> 8) & 255
  const b = bigint & 255
  return `${r}, ${g}, ${b}`
}

// Appliquer un thème au DOM
function applyTheme(colors) {
  const root = document.documentElement
  Object.entries(colors).forEach(([key, value]) => {
    root.style.setProperty(`--bs-${key}`, value)
    root.style.setProperty(`--cui-${key}`, value)
    root.style.setProperty(`--cui-${key}-rgb`, hexToRgb(value))
  })
  if (colors.primary) {
    root.style.setProperty('--cui-link-color', colors.primary)
    root.style.setProperty('--cui-link-color-rgb', hexToRgb(colors.primary))
  }
}

const ThemeColors = () => {
  const [themes, setThemes] = useState([])
  const [currentTheme, setCurrentTheme] = useState('default')
  const [colors, setColors] = useState({})

  // --- TOASTS
  const [toasts, setToasts] = useState([])
  const addToast = (message, color = 'danger') => {
    const id = Date.now()
    setToasts((prev) => [...prev, { id, message, color }])
  }
  const showError = (msg) => addToast(msg, 'danger')
  const showSuccess = (msg) => addToast(msg, 'success')
  const removeToast = (id) => setToasts((prev) => prev.filter((t) => t.id !== id))

  // Charger la liste des thèmes
  useEffect(() => {
    fetch(`${API}/theme/list`)
      .then(res => res.json())
      .then(data => setThemes(data))
      .catch(() => showError('Erreur liste thèmes'))
  }, [])

  // Charger le thème courant au démarrage
  useEffect(() => {
  fetch(`${API}/theme/current`)
    .then(res => res.json())
    .then(data => {
      if (data.name) setCurrentTheme(data.name)   // ✅ garder le nom du thème
      if (data.colors) {
        setColors(data.colors)
        applyTheme(data.colors)
      }
    })
    .catch(() => showError('Erreur chargement thème courant'))
}, [])


  // Changer une couleur en direct
  const handleChange = (key, value) => {
    const newColors = { ...colors, [key]: value }
    setColors(newColors)
    applyTheme(newColors)
  }

  // Changer de thème prédéfini
  const handleThemeChange = async (name) => {
    setCurrentTheme(name)
    try {
      const res = await fetch(`${API}/theme/${name}`)
      const data = await res.json()
      setColors(data)
      applyTheme(data)

      // sauvegarde côté backend
      await fetch(`${API}/theme/current`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      })
      showSuccess(`Thème "${name}" appliqué`)
    } catch {
      showError('Erreur changement de thème')
    }
  }

  // Sauvegarder les couleurs modifiées
  const handleSave = async () => {
    try {
      const res = await fetch(`${API}/theme/colors`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(colors),
      })
      if (!res.ok) throw new Error()
      showSuccess('Couleurs mises à jour avec succès')
    } catch {
      showError('Échec mise à jour')
    }
  }

  return (
    <div className="container py-4">
      <CCard className="shadow-lg">
        <CCardHeader>
          <h2 className="mb-0">Gestion des couleurs du thème</h2>
        </CCardHeader>
        <CCardBody>
          {/* Sélecteur de thème */}
          <div className="mb-4">
            <label className="form-label">Choisir un thème prédéfini</label>
            <select
              className="form-select w-20"
              value={currentTheme}
              onChange={(e) => handleThemeChange(e.target.value)}
            >
              {themes.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>

          {/* Editeur des couleurs */}
          <div className="row">
            {Object.entries(colors).map(([key, value]) => (
              <div key={key} className="col-md-4 mb-4">
                <label className="form-label text-capitalize">{key}</label>
                <input
                  type="color"
                  className="form-control form-control-color mb-2"
                  value={value}
                  onChange={(e) => handleChange(key, e.target.value)}
                />
                <input
                  type="text"
                  className="form-control"
                  value={value}
                  onChange={(e) => handleChange(key, e.target.value)}
                />
              </div>
            ))}
          </div>

          <CButton color="primary" onClick={handleSave}>Enregistrer</CButton>
        </CCardBody>
      </CCard>

      {/* TOASTER */}
      <CToaster placement="bottom-end" className="p-3" style={{ zIndex: 9999 }}>
        {toasts.map((t) => (
          <CToast
            key={t.id}
            visible
            autohide
            delay={3000}
            color={t.color}
            onClose={() => removeToast(t.id)}
          >
            <CToastBody className="text-white">{t.message}</CToastBody>
          </CToast>
        ))}
      </CToaster>
    </div>
  )
}

export default ThemeColors
