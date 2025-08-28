import React, { useState } from 'react'
import { CCard, CCardHeader, CCardBody, CFormInput, CFormTextarea, CButton } from '@coreui/react'

const Test = () => {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [reason, setReason] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const res = await fetch('http://localhost:5678/webhook/conges', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, startDate, endDate, reason }),
      })
      if (!res.ok) throw new Error('Erreur lors de l’envoi')
      alert('✅ Demande envoyée !')
    } catch (err) {
      alert(`❌ ${err.message}`)
    }
  }

  return (
    <CCard>
      <CCardHeader>Demande de congés</CCardHeader>
      <CCardBody>
        <form onSubmit={handleSubmit} className="d-flex flex-column gap-3">
          <CFormInput label="Nom" value={name} onChange={(e) => setName(e.target.value)} required />
          <CFormInput label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          <CFormInput label="Date de début" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} required />
          <CFormInput label="Date de fin" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} required />
          <CFormTextarea label="Motif" value={reason} onChange={(e) => setReason(e.target.value)} required />
          <CButton type="submit" color="primary">Envoyer</CButton>
        </form>
      </CCardBody>
    </CCard>
  )
}

export default Test
