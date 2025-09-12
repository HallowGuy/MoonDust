import React, { useEffect, useState } from 'react'
import { CWidgetStatsD } from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilHome } from '@coreui/icons'
import { API_BASE } from 'src/api'


const asText = (v, fallback = '—') => (v == null || v === '' ? fallback : String(v))


const authFetch = (url) => {
const token = localStorage.getItem('access_token')
const headers = token ? { Authorization: `Bearer ${token}` } : {}
return fetch(url, { headers })
}


const RealmWidget = () => {
const [realm, setRealm] = useState('—')


useEffect(() => {
let cancelled = false
;(async () => {
try {
const res = await authFetch(`${API_BASE}/realm`)
const json = res.ok ? await res.json() : null
if (cancelled) return
setRealm(asText(json?.realm))
} catch (e) {
console.error('RealmWidget error:', e)
}
})()
return () => {
cancelled = true
}
}, [])


return (
<CWidgetStatsD
icon={<CIcon icon={cilHome} height={52} className="my-4 text-white" />}
values={[{ title: 'Nom du realm', value: realm }]}
style={{ '--cui-card-cap-bg': '#3b5998' }}
/>
)
}


export default RealmWidget