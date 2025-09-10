import React, { useEffect, useState } from "react"
import { CButton } from "@coreui/react"
import { API_ACTIVITES } from "src/api"
import { fetchWithAuth } from "../../utils/auth";

const getAuthHeaders = () => ({
  "Content-Type": "application/json",
  "Authorization": `Bearer ${localStorage.getItem("access_token")}`,
})

const ContactHistorique = ({ contactId }) => {
  const [activites, setActivites] = useState([])
  const [newActivity, setNewActivity] = useState({ type: "", description: "" })

  useEffect(() => {
    const fetchActivites = async () => {
      try {
        const res = await fetchWithAuth(`${API_ACTIVITES}?contact_id=${contactId}`, {
          headers: getAuthHeaders(),
        })
        if (!res.ok) throw new Error("Erreur lors du chargement des activités")
        setActivites(await res.json())
      } catch (err) {
        console.error(err)
      }
    }
    fetchActivites()
  }, [contactId])

  const handleAddActivity = async () => {
    try {
      const res = await fetchWithAuth(`${API_ACTIVITES}`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({
          contact_id: contactId,
          type: newActivity.type,
          description: newActivity.description,
        }),
      })
      if (!res.ok) throw new Error("Erreur lors de l'ajout")
      const created = await res.json()
      setActivites([created, ...activites])
      setNewActivity({ type: "", description: "" })
    } catch (err) {
      console.error(err)
      alert("Impossible d'ajouter l'activité")
    }
  }

  return (
    <div>
      <div className="mb-3 d-flex gap-2">
        <select
          className="form-select" style={{ width: "150px" }}
          value={newActivity.type}
          onChange={(e) => setNewActivity({ ...newActivity, type: e.target.value })}
        >
          <option value="">Type</option>
          <option value="appel">Appel</option>
          <option value="email">Email</option>
        </select>
        <input
          type="text"
          className="form-control flex-grow-1"
          placeholder="Description"
          value={newActivity.description}
          onChange={(e) => setNewActivity({ ...newActivity, description: e.target.value })}
        />
        <CButton color="primary" onClick={handleAddActivity}>Ajouter</CButton>
      </div>

      {activites.length === 0 ? (
        <p>Aucune activité enregistrée</p>
      ) : (
        <ul className="list-group">
          {activites.map((a) => (
            <li key={a.id} className="list-group-item bg-dark text-white">
              <strong>{a.type}</strong> — {a.description}
              <br />
              <small>{a.date ? new Date(a.date).toLocaleString() : "-"} par {a.utilisateur_username || "N/A"}</small>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export default ContactHistorique
