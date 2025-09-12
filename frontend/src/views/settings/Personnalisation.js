import React, { useEffect, useState } from 'react'
import {
  CCard,
  CCardHeader,
  CCardBody,
  CButton,
  CToaster,
  CToast,
  CToastBody,
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
  Object.entries(colors || {}).forEach(([key, value]) => {
    root.style.setProperty(`--bs-${key}`, value)
    root.style.setProperty(`--cui-${key}`, value)
    root.style.setProperty(`--cui-${key}-rgb`, hexToRgb(value))
  })
  if (colors && colors.primary) {
    root.style.setProperty('--cui-link-color', colors.primary)
    root.style.setProperty('--cui-link-color-rgb', hexToRgb(colors.primary))
  }
}

const Personnalisation = () => {
  // ----- ÉTAT COULEURS / THÈMES -----
  const [themes, setThemes] = useState([])
  const [currentTheme, setCurrentTheme] = useState('default')
  const [colors, setColors] = useState({})

  // ----- ÉTAT LOGO -----
  const [logoUrl, setLogoUrl] = useState(null)
  const [file, setFile] = useState(null)
  const [uploading, setUploading] = useState(false)

  // ----- TOASTS GLOBAUX -----
  const [toasts, setToasts] = useState([])
  const addToast = (message, color = 'danger') => {
    const id = Date.now() + Math.random()
    setToasts((prev) => [...prev, { id, message, color }])
  }
  const showError = (msg) => addToast(msg, 'danger')
  const showSuccess = (msg) => addToast(msg, 'success')
  const removeToast = (id) => setToasts((prev) => prev.filter((t) => t.id !== id))

  // Charger la liste des thèmes
  useEffect(() => {
    fetch(`${API}/theme/list`)
      .then((res) => res.json())
      .then((data) => setThemes(Array.isArray(data) ? data : []))
      .catch(() => showError('Erreur liste thèmes'))
  }, [])

  // Charger le thème courant au démarrage
  useEffect(() => {
    fetch(`${API}/theme/current`)
      .then((res) => res.json())
      .then((data) => {
        if (data?.name) setCurrentTheme(data.name)
        if (data?.colors) {
          setColors(data.colors)
          applyTheme(data.colors)
        }
      })
      .catch(() => showError('Erreur chargement thème courant'))
  }, [])

  // Charger le logo actuel (avec cache-busting)
  useEffect(() => {
    setLogoUrl(`${API}/theme/logo?ts=${Date.now()}`)
  }, [])

  // Changer une couleur en direct
  const handleColorChange = (key, value) => {
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
      setColors(data || {})
      applyTheme(data || {})

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
  const handleSaveColors = async () => {
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

  // Gestion du logo
  const handleFileChange = (e) => {
    setFile(e.target.files?.[0] ?? null)
  }

  const handleUploadLogo = async () => {
    if (!file) {
      showError('Sélectionnez un fichier SVG')
      return
    }
    if (file.size > 200 * 1024) { 
      showError('SVG trop volumineux (>200 Ko)'); 
      return 
    }

    // Petite validation du type
    if (file.type !== 'image/svg+xml' && !file.name.endsWith('.svg')) {
      showError('Le fichier doit être au format SVG')
      return
    }
    // Inspection basique du contenu
      const text = await file.text()
      const DANGEROUS = /(<!\s*script)|on\w+=|javascript:|<\s*foreignObject/i
      if (DANGEROUS.test(text)) {
        showError('SVG refusé (contenu potentiellement dangereux)')
        return
      }
    const formData = new FormData()
    formData.append('file', file)

    setUploading(true)
    try {
      const res = await fetch(`${API}/theme/logo`, {
        method: 'POST',
        body: formData,
      })
      if (!res.ok) throw new Error('Upload échoué')

      setLogoUrl(`${API}/theme/logo?ts=${Date.now()}`) // rafraîchit l'aperçu
      setFile(null)
      showSuccess('Logo mis à jour')
    } catch (err) {
      console.error(err)
      showError('Erreur lors de la mise à jour du logo')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="container py-4">

       {/* ----- Bloc Logo ----- */}
      <CCard className="shadow-lg mb-4">
        <CCardHeader>
          <span>Gestion du logo</span>
        </CCardHeader>
       <CCardBody>
  <div className="row align-middle">
    {/* Colonne gauche : affichage du logo actuel */}
    <div className="col-md-6">
      {logoUrl && (
        <div className="mb-4 d-flex flex-column align-items-start">
          <p className="mb-2">Logo actuel</p>
          <img src={logoUrl} alt="Logo actuel" style={{ maxHeight: 40 }} />
        </div>
      )}
    </div>

    {/* Colonne droite : upload du logo */}
    <div className="col-md-6">
      <div className="mb-3">
        <input
          type="file"
          accept="image/svg+xml"
          className="form-control"
          onChange={handleFileChange}
        />
      </div>

      <CButton color="primary" onClick={handleUploadLogo} disabled={uploading}>
        {uploading ? 'Envoi en cours…' : 'Mettre à jour le logo'}
      </CButton>
    </div>
  </div>
</CCardBody>

      </CCard>


      {/* ----- Bloc Couleurs / Thèmes ----- */}
      <CCard className="shadow-lg mb-4">
        <CCardHeader>
          <span>Gestion des couleurs du thème</span>
        </CCardHeader>
        <CCardBody>
          {/* Sélecteur de thème */}
          <div className="mb-4">
            <label className="form-label">Choisir un thème prédéfini</label>
            <select
              className="form-select w-25"
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

          {/* Éditeur des couleurs */}
          <div className="row">
            {Object.entries(colors).map(([key, value]) => (
              <div key={key} className="col-md-4 mb-4">
                <label className="form-label text-capitalize">{key}</label>
                <input
                  type="color"
                  className="form-control form-control-color mb-2"
                  value={value}
                  onChange={(e) => handleColorChange(key, e.target.value)}
                />
                <input
                  type="text"
                  className="form-control"
                  value={value}
                  onChange={(e) => handleColorChange(key, e.target.value)}
                />
              </div>
            ))}
          </div>

          <CButton color="primary" onClick={handleSaveColors}>
            Enregistrer
          </CButton>
        </CCardBody>
      </CCard>

     

      {/* TOASTER GLOBAL */}
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

export default Personnalisation
