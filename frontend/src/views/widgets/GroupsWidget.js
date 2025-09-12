import React, { useEffect, useState } from 'react'
import { CWidgetStatsD } from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilLayers } from '@coreui/icons'
import { API_GROUPES } from 'src/api'


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


const GroupsWidget = () => {
const [groups, setGroups] = useState(0)
const [subGroups, setSubGroups] = useState(0)


useEffect(() => {
let cancelled = false
;(async () => {
try {
const res = await authFetch(`${API_GROUPES}/stats`)
const json = res.ok ? await res.json() : null
if (cancelled) return
const g = normalizeCount(json?.groups ?? json)
const sg = normalizeCount(json?.subGroups ?? json?.subgroups)
setGroups(g)
setSubGroups(sg)
} catch (e) {
console.error('GroupsWidget error:', e)
}
})()
return () => {
cancelled = true
}
}, [])


return (
<CWidgetStatsD
icon={<CIcon icon={cilLayers} height={52} className="my-4 text-white" />}
values={[
{ title: 'Groupes', value: String(groups) },
{ title: 'Sous-groupes', value: String(subGroups) },
]}
style={{ '--cui-card-cap-bg': '#00aced' }}
/>
)
}


export default GroupsWidget