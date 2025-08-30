import React, { useEffect, useState } from "react"
import { useParams } from "react-router-dom"
import { API_CONGES } from "src/api"
import { CCard, CCardBody, CCardHeader, CButton, CSpinner } from "@coreui/react"

const DetailConge = () => {
  const { id } = useParams()
  const [demande, setDemande] = useState(null)
  const [loading, setLoading] = useState(true)

  // Charger la demande
  useEffect(() => {
    const fetchDemande = async () => {
      try {
        const res = await fetch(`${API_CONGES}/${id}`)
        if (!res.ok) throw new Error("Erreur chargement demande")
        setDemande(await res.json())
      } catch (e) {
        console.error(e)
      } finally {
        setLoading(false)
      }
    }
    fetchDemande()
  }, [id])

  // Fonction mise à jour statut
  const updateStatus = async (newStatus) => {
    try {
      const res = await fetch(`${API_CONGES}/${id}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      })
      if (!res.ok) throw new Error("Erreur mise à jour statut")
      const updated = await res.json()
      setDemande(updated) // refresh l’écran
      alert(`✅ Demande ${newStatus}`)
    } catch (e) {
      alert(`❌ ${e.message}`)
    }
  }

  if (loading) return <CSpinner />

  if (!demande) return <p>Demande introuvable</p>

  return (
    <CCard>
      <CCardHeader>Détail de la demande #{demande.id}</CCardHeader>
      <CCardBody>
        <p><b>Nom :</b> {demande.name}</p>
        <p><b>Email :</b> {demande.email}</p>
        <p><b>Du :</b> {new Date(demande.start_date).toLocaleDateString("fr-FR")}</p>
        <p><b>Au :</b> {new Date(demande.end_date).toLocaleDateString("fr-FR")}</p>
        <p><b>Motif :</b> {demande.reason}</p>
        <p><b>Statut :</b> {demande.status}</p>

        {/* Boutons action */}
        <div className="d-flex gap-2 mt-3">
          <CButton color="success" onClick={() => updateStatus("APPROUVÉ")}>
            Approuver
          </CButton>
          <CButton color="danger" onClick={() => updateStatus("REJETÉ")}>
            Rejeter
          </CButton>
        </div>
      </CCardBody>
    </CCard>
  )
}

export default DetailConge
