import React, { useEffect, useState } from 'react'
import { CWidgetStatsD } from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilShieldAlt } from '@coreui/icons'
import { API_ROLES } from 'src/api'


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


const RolesWidget = () => {
const [roleCount, setRoleCount] = useState(0)


useEffect(() => {
let cancelled = false
;(async () => {
try {
const res = await authFetch(`${API_ROLES}/count`)
const json = res.ok ? await res.json() : null
if (cancelled) return
setRoleCount(normalizeCount(json))
} catch (e) {
console.error('RolesWidget error:', e)
}
})()
return () => {
cancelled = true
}
}, [])


return (
<CWidgetStatsD
icon={<CIcon icon={cilShieldAlt} height={52} className="my-4 text-white" />}
values={[{ title: 'Rôles', value: String(roleCount) }]}
style={{ '--cui-card-cap-bg': '#4875b4' }}
/>
)
}


export default RolesWidget