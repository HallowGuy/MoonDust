import React from "react"
import { CButton } from "@coreui/react"
import CIcon from "@coreui/icons-react"
import { cilChatBubble } from "@coreui/icons"
import { useMessenger } from "src/context/MessengerContext"

const FloatingMessengerButton = () => {
const { openMessenger } = useMessenger()

  return (
    <CButton color="primary" className="rounded-circle shadow" style={{position: "fixed",bottom: "80px",right: "20px",width: "60px",height: "60px",zIndex: 1000,}}
          onClick={openMessenger}
    >
      <CIcon icon={cilChatBubble} size="lg" />
    </CButton>
  )
}

export default FloatingMessengerButton
