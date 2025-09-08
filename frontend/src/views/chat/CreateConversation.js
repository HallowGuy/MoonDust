import React, { useEffect, useState } from "react"
import axios from "axios"
import { useNavigate } from "react-router-dom"

export default function CreateConversation() {
  const [users, setUsers] = useState([])
  const [selected, setSelected] = useState("")
  const navigate = useNavigate()

  useEffect(() => {
    const token = localStorage.getItem("access_token")

    if (!token) return

    axios
      .get("http://localhost:5001/api/conversations/users", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        const me = JSON.parse(atob(token.split(".")[1])).sub // décoder le JWT pour avoir mon ID Keycloak
        setUsers(res.data.filter((u) => u.id !== me))
      })
      .catch((err) => console.error("❌ Erreur get users:", err))
  }, [])

  const createConversation = async () => {
    const token = localStorage.getItem("access_token")
    const me = JSON.parse(atob(token.split(".")[1])).sub

    try {
      const res = await axios.post(
        "http://localhost:5001/api/conversations",
        { user1: me, user2: selected },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      // rediriger vers le chat
      navigate(`/chat/${res.data.id}`)
    } catch (err) {
      console.error("❌ Erreur create conversation:", err)
    }
  }

  return (
    <div style={{ maxWidth: 400, margin: "0 auto" }}>
      <h2>Nouvelle conversation</h2>

      <select
        value={selected}
        onChange={(e) => setSelected(e.target.value)}
        style={{ width: "100%", marginBottom: "1rem" }}
      >
        <option value="">-- Choisir un utilisateur --</option>
        {users.map((u) => (
          <option key={u.id} value={u.id}>
            {u.username} ({u.email})
          </option>
        ))}
      </select>

      <button onClick={createConversation} disabled={!selected}>
        Créer
      </button>
    </div>
  )
}
