import { useState } from "react"
import {
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CModalFooter,
  CButton,
} from "@coreui/react"

export default function ConfirmDeleteModal({
  title = "Confirmation",
  message = "Êtes-vous sûr ?",
  confirmText = "Supprimer",
  confirmColor = "danger",
  onConfirm,
  trigger,
}) {
  const [visible, setVisible] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleConfirm = async () => {
    try {
      setLoading(true)
      await onConfirm()
      setVisible(false)
    } finally {
      setLoading(false)
    }
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
            Annuler
          </CButton>
          <CButton
            color={confirmColor}
            onClick={handleConfirm}
            disabled={loading}
          >
            {loading ? "Suppression..." : confirmText}
          </CButton>
        </CModalFooter>
      </CModal>
    </>
  )
}
