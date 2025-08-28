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

const API = import.meta.env.VITE_API_URL

const ThemeLogo = () => {
  const [logoUrl, setLogoUrl] = useState(null)
  const [file, setFile] = useState(null)

  // ---------- TOASTS ----------
  const [toasts, setToasts] = useState([])
  const addToast = (message, color = 'danger') => {
    const id = Date.now()
    setToasts((prev) => [...prev, { id, message, color }])
  }
  const showError = (msg) => addToast(msg, 'danger')
  const showSuccess = (msg) => addToast(msg, 'success')
  const removeToast = (id) => setToasts((prev) => prev.filter((t) => t.id !== id))

  // Charger le logo actuel
  useEffect(() => {
    setLogoUrl(`${API}/theme/logo?${Date.now()}`) // cache-busting
  }, [])

  const handleFileChange = (e) => {
    setFile(e.target.files[0])
  }

  const handleUpload = async () => {
    if (!file) {
      showError('Sélectionnez un fichier SVG')
      return
    }

    const formData = new FormData()
    formData.append('file', file)

    try {
      const res = await fetch(`${API}/theme/logo`, {
        method: 'POST',
        body: formData,
      })
      if (!res.ok) throw new Error('Upload échoué')

      setLogoUrl(`${API}/theme/logo?ts=${Date.now()}`) // rafraîchit l'aperçu
      showSuccess('Logo mis à jour')
    } catch (err) {
      console.error(err)
      showError('Erreur lors de la mise à jour du logo')
    }
  }

  return (
    <div className="container py-4">
      <CCard className="shadow-lg">
        <CCardHeader>
          <h2 className="mb-0">Gestion du logo</h2>
        </CCardHeader>
        <CCardBody>
          {logoUrl && (
            <div className="mb-4">
              <p>Logo actuel :</p>
              <img src={logoUrl} alt="Logo actuel" style={{ maxHeight: 80 }} />
            </div>
          )}

          <div className="mb-3">
            <input
              type="file"
              accept="image/svg+xml"
              className="form-control"
              onChange={handleFileChange}
            />
          </div>

          <CButton color="primary" onClick={handleUpload}>
            Mettre à jour le logo
          </CButton>
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

export default ThemeLogo
