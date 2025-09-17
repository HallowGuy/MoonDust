import React, { useEffect, useState } from 'react'
import { CWidgetStatsD } from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilBolt } from '@coreui/icons'
import { API_ACTIONS_CONFIG } from 'src/api'

const asNumber = (v, f = 0) => Number.isFinite(Number(v)) ? Number(v) : f
const normalizeCount = (d) => {
  if (typeof d === 'number') return asNumber(d)
  if (typeof d === 'boolean') return d ? 1 : 0
  if (Array.isArray(d)) return d.length
  if (d && typeof d === 'object') {
    if (typeof d.count === 'number') return asNumber(d.count)
    if (typeof d.total === 'number') return asNumber(d.total)
  }
  return 0
}
const authFetch = (url) => {
  const t = localStorage.getItem('access_token')
  const headers = t ? { Authorization: `Bearer ${t}` } : {}
  return fetch(url, { headers })
}

const ActionsWidget = () => {
  const [count, setCount] = useState(0)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const res = await authFetch(`${API_ACTIONS_CONFIG}/count`)
        const json = res.ok ? await res.json() : null
        if (cancelled) return
        setCount(normalizeCount(json))
      } catch (e) {
        console.error('ActionsWidget error:', e)
      }
    })()
    return () => { cancelled = true }
  }, [])

  return (
    <CWidgetStatsD
      icon={<CIcon icon={cilBolt} height={52} className="my-4 text-white" />}
      values={[{ title: 'Actions', value: String(count) }]}
      style={{ '--cui-card-cap-bg': '#198754' }}
    />
  )
}

export default ActionsWidget
