import React, { useEffect, useState } from 'react'
import { CWidgetStatsD } from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilUser } from '@coreui/icons'
import { API_USERS } from 'src/api'


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
if (typeof data.userActive === 'number') return asNumber(data.userActive)
if (typeof data.userActive === 'boolean') return data.userActive ? 1 : 0
if (typeof data.active === 'number') return asNumber(data.active)
if (typeof data.active === 'boolean') return data.active ? 1 : 0
if (typeof data.total === 'number') return asNumber(data.total)
}
return 0
}


const authFetch = (url) => {
const token = localStorage.getItem('access_token')
const headers = token ? { Authorization: `Bearer ${token}` } : {}
return fetch(url, { headers })
}


const UsersWidget = () => {
const [userCount, setUserCount] = useState(0)
const [userActive, setUserActive] = useState(0)


useEffect(() => {
let cancelled = false
;(async () => {
try {
const [uCntRes, uActRes] = await Promise.all([
authFetch(`${API_USERS}/count`),
authFetch(`${API_USERS}/active`),
])
const [uCnt, uAct] = await Promise.all([
uCntRes.ok ? uCntRes.json() : null,
uActRes.ok ? uActRes.json() : null,
])
if (cancelled) return
setUserCount(normalizeCount(uCnt))
setUserActive(normalizeCount(uAct))
} catch (e) {
console.error('UsersWidget error:', e)
}
})()
return () => {
cancelled = true
}
}, [])


return (
<CWidgetStatsD
color="warning"
icon={<CIcon icon={cilUser} height={52} className="my-4 text-white" />}
values={[
{ title: 'Utilisateurs', value: String(userCount) },
{ title: 'Actifs', value: String(userActive) },
]}
/>
)
}


export default UsersWidget