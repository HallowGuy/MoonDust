import { useState } from "react"
import {
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CModalFooter,
  CButton,
} from "@coreui/react"

export default function ConfirmCancelModal({
  title = "Confirmation",
  message = "Êtes-vous sûr de vouloir annuler vos modifications ?",
  confirmText = "Oui, annuler",
  confirmColor = "danger",
  onConfirm,
  trigger,
}) {
  const [visible, setVisible] = useState(false)

  const handleConfirm = () => {
    if (onConfirm) onConfirm()
    setVisible(false)
  }

  return (
    <>
      <span onClick={() => setVisible(true)}>{trigger}</span>

      <CModal visible={visible} onClose={() => setVisible(false)}>
        <CModalHeader closeButton>
          <CModalTitle>{title}</CModalTitle>
        </CModalHeader>
        <CModalBody>{message}</CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={() => setVisible(false)}>
            Retour
          </CButton>
          <CButton color={confirmColor} onClick={handleConfirm}>
            {confirmText}
          </CButton>
        </CModalFooter>
      </CModal>
    </>
  )
}
