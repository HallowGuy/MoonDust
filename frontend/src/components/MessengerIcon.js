// src/components/MessengerIcon.js
import React, { useState, useEffect } from "react"
import { CNavItem, CNavLink } from "@coreui/react"
import CIcon from "@coreui/icons-react"
import { cilChatBubble } from "@coreui/icons"
import { useMessenger } from "src/context/MessengerContext"
import { API_CONVERSATIONS } from "src/api"

const MessengerIcon = () => {
  const { openMessenger } = useMessenger()
  const [unreadCount, setUnreadCount] = useState(0)

  const token = localStorage.getItem("access_token")

  const getAuthHeaders = () => ({
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  })

  const fetchUnread = async () => {
    if (!token) return
    try {
      const res = await fetch(`${API_CONVERSATIONS}/mine`, {
        headers: getAuthHeaders(),
      })
      const data = await res.json()
      if (Array.isArray(data)) {
  const total = data.reduce((sum, conv) => sum + Number(conv.unread_count || 0), 0)
  setUnreadCount(total)
}

    } catch (err) {
      console.error("❌ Erreur fetch unread:", err)
    }
  }

  useEffect(() => {
    fetchUnread()
    const interval = setInterval(fetchUnread, 10000)
    return () => clearInterval(interval)
  }, [])

  return (
    <CNavItem className="position-relative me-3">
      <CNavLink
        as="button"
        onClick={() => {
          console.log("Icon clicked!") // ✅ debug
          openMessenger()
        }}
        style={{ cursor: "pointer", background: "none", border: "none" }}
      >
        <CIcon icon={cilChatBubble} size="lg" />
        {unreadCount > 0 && (
          <span className="position-absolute top-20 start-100 translate-middle badge rounded-pill bg-danger" style={{ minWidth: "auto" }}>
            {unreadCount}
          </span>
        )}
      </CNavLink>
    </CNavItem>
  )
}

export default MessengerIcon
