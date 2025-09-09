import React, { useRef, useEffect } from "react"
import MessengerContent from "../../components/MessengerContent"
import { useMessenger } from "src/context/MessengerContext"

const WidgetMessenger = () => {
  const { isOpen, closeMessenger } = useMessenger()
  const widgetRef = useRef(null)

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (widgetRef.current && !widgetRef.current.contains(event.target)) {
        closeMessenger()
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside)
    }
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [isOpen, closeMessenger])

  if (!isOpen) return null

  return (
    <div
      ref={widgetRef}
      style={{
        position: "fixed",
        bottom: "80px",
        right: "20px",
        width: "350px",
        height: "500px",
        backgroundColor: "white",
        borderRadius: "12px",
        boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        zIndex: 1001,
      }}
    >
      {/* Header */}
      <div
        className="d-flex justify-content-between align-items-center p-2 bg-primary text-white"
        style={{ cursor: "pointer" }}
        onClick={closeMessenger}
      >
        <span>Messagerie</span>
        <span style={{ fontSize: "1.2rem", fontWeight: "bold" }}>×</span>
      </div>

      {/* Contenu */}
      <div style={{ flex: 1, overflow: "auto", padding: "10px", background: "#212631" }}>
        <MessengerContent isWidget={true} startMode="list" />
      </div>
    </div>
  )
}

export default WidgetMessenger
