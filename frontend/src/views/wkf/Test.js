import React, { useState } from 'react'
import {
  CCard,
  CCardHeader,
  CCardBody,
  CFormInput,
  CFormTextarea,
  CButton
} from '@coreui/react'

import { API_CONGES } from 'src/api'


const formatDate = (date) => date.toISOString().split('T')[0]

const Test = () => {
 const today = new Date()
  const nextWeek = new Date()
  nextWeek.setDate(today.getDate() + 7)

  const [name, setName] = useState('')
  const [email, setEmail] = useState('test@test.com') // ✅ valeur par défaut
  const [startDate, setStartDate] = useState(formatDate(today)) // ✅ aujourd’hui
  const [endDate, setEndDate] = useState(formatDate(nextWeek))  // ✅ +7 jours
  const [reason, setReason] = useState('')

const handleSubmit = async (e) => {
  e.preventDefault()
  try {
    const res = await fetch(API_CONGES, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name,
        email,
        start_date: startDate,
        end_date: endDate,
        reason
      }),
    })

    if (!res.ok) throw new Error('Erreur lors de l’envoi')
    alert('✅ Demande envoyée, stockée et workflow déclenché !')
  } catch (err) {
    alert(`❌ ${err.message}`)
  }
}



  return (
    <CCard>
      <CCardHeader>jjDemande de congés</CCardHeader>
      <CCardBody>
        <form onSubmit={handleSubmit} className="d-flex flex-column gap-3">
          <CFormInput
            label="Nom complet"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <CFormInput
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <CFormInput
            label="Date de début"
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            required
          />
          <CFormInput
            label="Date de fin"
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            required
          />
          <CFormTextarea
            label="Motif"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            required
          />
          <CButton type="submit" color="primary">
            Envoyer
          </CButton>
        </form>
      </CCardBody>
    </CCard>
  )
}

export default Test