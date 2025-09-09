import React, { useEffect, useState } from "react"
import {
  CDropdown,
  CDropdownMenu,
  CDropdownToggle,
  CDropdownItem,
  CBadge,
  CButton,
} from "@coreui/react"
import CIcon from "@coreui/icons-react"
import { cilBell, cilCheckCircle, cilX } from "@coreui/icons"
import { API_BASE } from "src/api"
import { fetchWithAuth } from "../utils/auth";

export const NotificationsIcon = () => {
  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [showAll, setShowAll] = useState(false)




  // Charger les notifs
async function fetchNotifications() {
  try {
    const res = await fetchWithAuth(`${API_BASE}/notifications/my`);
    if (!res.ok) throw new Error("Erreur API notifications");

    const data = await res.json();
    setNotifications(data);
    setUnreadCount(data.filter((n) => n.status === "unread").length);
  } catch (err) {
    console.error("❌ Erreur fetch notifs:", err);
  }
}


  // Marquer comme lu et rediriger
  const handleClick = async (notif) => {
    try {
      await fetchWithAuth(`${API_BASE}/notifications/${notif.id}/read`, {
        method: "PATCH",
      })
      setNotifications((prev) =>
        prev.map((n) =>
          n.id === notif.id ? { ...n, status: "read" } : n
        )
      )
      setUnreadCount((prev) => Math.max(0, prev - 1))
      window.location.href = `/annuaire/contacts/${notif.contact_id}?tab=3`
    } catch (err) {
      console.error("❌ Erreur maj notif:", err)
    }
  }

  // Marquer comme lu sans redirection
  const markOneAsRead = async (notif) => {
    try {
      await fetchWithAuth(`${API_BASE}/notifications/${notif.id}/read`, {
        method: "PATCH",
      })
      setNotifications((prev) =>
        prev.map((n) =>
          n.id === notif.id ? { ...n, status: "read" } : n
        )
      )
      setUnreadCount((prev) => Math.max(0, prev - 1))
    } catch (err) {
      console.error("❌ Erreur maj notif individuelle:", err)
    }
  }

  // Cacher une notification (supprimer côté frontend + la marquer lue en backend)
const hideNotification = async (notif) => {
  try {
    await fetchWithAuth(`${API_BASE}/notifications/${notif.id}/hide`, {
      method: "PATCH",
    })
    setNotifications((prev) => prev.filter((n) => n.id !== notif.id))
    if (notif.status === "unread") {
      setUnreadCount((prev) => Math.max(0, prev - 1))
    }
  } catch (err) {
    console.error("❌ Erreur hide notif:", err)
  }
}



  
  // Tout marquer comme lu
  const markAllAsRead = async (e) => {
    e.preventDefault()
    try {
      await fetchWithAuth(`${API_BASE}/notifications/mark-all-read`, {
        method: "PATCH",
          headers: { "Content-Type": "application/json" },

      })
      setNotifications((prev) => prev.map((n) => ({ ...n, status: "read" })))
      setUnreadCount(0)
    } catch (err) {
      console.error("❌ Erreur markAllAsRead:", err)
    }
  }

  useEffect(() => {
    fetchNotifications()
    const interval = setInterval(fetchNotifications, 10000)
    return () => clearInterval(interval)
  }, [])

  const visibleNotifications = showAll
    ? notifications
    : notifications.slice(0, 5)

  return (
    <CDropdown variant="nav-item" autoClose="outside" className="me-2">

      <CDropdownToggle color="link" caret={false} className="position-relative">
        <CIcon icon={cilBell} size="lg" />
        {unreadCount > 0 && (
          <span className="position-absolute top-20 start-100 translate-middle badge rounded-pill bg-danger" style={{ minWidth: "auto" }}>
            {unreadCount}
          </span>
        )}
        
      </CDropdownToggle>

      <CDropdownMenu
        className="p-2"
        style={{ minWidth: "400px", maxHeight: "400px", overflowY: "auto" }}
      >
        {notifications.length === 0 ? (
          <div className="text-center text-muted p-2">
            Aucune notification
          </div>
        ) : (
          <>
            {visibleNotifications.map((n) => (
              <CDropdownItem
                key={n.id}
                className={`d-flex justify-content-between align-items-center ${
                  n.status === "unread" ? "fw-bold" : ""
                }`}
              >
                <div
                  onClick={() => handleClick(n)}
                  style={{ cursor: "pointer", flex: 1 }}
                >
                  Mention dans la fiche de {n.contact_prenom} {n.contact_nom}
                  <br />
                  <small className="text-muted">
                    {new Date(n.created_at).toLocaleString()}
                  </small>
                </div>
  <div className="d-flex align-items-center gap-1 ms-2">
                  {n.status === "unread" && (
                    <CButton
                      size="sm"
                      color="success"
                      variant="ghost"
                      onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        markOneAsRead(n)
                      }}
                    >
                      <CIcon icon={cilCheckCircle} size="lg"/>
                    </CButton>
                  )}
                  <CButton
                    size="sm"
                    color="danger"
                    variant="ghost"
                    onClick={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      hideNotification(n)
                    }}
                  >
                    <CIcon icon={cilX} size="lg"/>
                  </CButton>
                </div>
              </CDropdownItem>
            ))}

            {/* Boutons bas */}
            <div className="d-flex justify-content-between mt-2">
              <CButton
                size="sm"
                color="primary"
                variant="outline"
                onClick={markAllAsRead}
              >
                Tout marquer comme lu
              </CButton>
              <CButton
    size="sm"
    color="secondary"
    variant="outline"
    onClick={(e) => {
      e.preventDefault()
      e.stopPropagation()
      setShowAll(!showAll)
    }}
  >
    {showAll ? "Voir moins" : "Voir plus"}
  </CButton>

            </div>
          </>
        )}
      </CDropdownMenu>
    </CDropdown>
  )
}

export default NotificationsIcon
