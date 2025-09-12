import React, { useEffect, useState } from 'react'
import { CWidgetStatsD } from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilNotes } from '@coreui/icons'
import { API_FORMS } from 'src/api'

const asNumber = (v, fallback = 0) => {
  const n = Number(v)
  return Number.isFinite(n) ? n : fallback
}
const normalizeCount = (data) => {
  if (typeof data === 'number') return asNumber(data)
  if (typeof data === 'boolean') return data ? 1 : 0
  if (Array.isArray(data)) return data.length
  if (data && typeof data === 'object') {
    if (typeof data.count === 'number') return asNumber(data.count)
    if (typeof data.total === 'number') return asNumber(data.total)
  }
  return 0
}
const authFetch = (url) => {
  const token = localStorage.getItem('access_token')
  const headers = token ? { Authorization: `Bearer ${token}` } : {}
  return fetch(url, { headers })
}

const FormsWidget = () => {
  const [count, setCount] = useState(0)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const res = await authFetch(`${API_FORMS}/count`)
        const json = res.ok ? await res.json() : null
        if (cancelled) return
        setCount(normalizeCount(json))
      } catch (e) {
        console.error('FormsWidget error:', e)
      }
    })()
    return () => { cancelled = true }
  }, [])

  return (
    <CWidgetStatsD
      icon={<CIcon icon={cilNotes} height={52} className="my-4 text-white" />}
      values={[{ title: 'Formulaires', value: String(count) }]}
      style={{ '--cui-card-cap-bg': '#6f42c1' }}
    />
  )
}

export default FormsWidget
