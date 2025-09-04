import React, { useState, useEffect } from 'react'
import PropTypes from 'prop-types'
import { CWidgetStatsD, CRow, CCol } from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilUser, cilShieldAlt, cilLayers, cilHome } from '@coreui/icons'
import { API_USERS, API_ROLES, API_GROUPES, API_BASE } from 'src/api'

const asNumber = (v, fallback = 0) => {
  const n = Number(v)
  return Number.isFinite(n) ? n : fallback
}

// -> accepte: number | boolean | array | {count} | {userActive} | {active} | {total}
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
const asText = (v, fallback = '—') =>
  v == null || v === '' ? fallback : String(v)

// ajoute l’Authorization si token présent
const authFetch = (url) => {
  const token = localStorage.getItem('access_token')
  const headers = token ? { Authorization: `Bearer ${token}` } : {}
  return fetch(url, { headers })
}

const WidgetsBrand = ({ className }) => {
  const [userCount, setUserCount] = useState(0)
  const [userActive, setUserActive] = useState(0)
  const [roleCount, setRoleCount] = useState(0)
  const [groupeCount, setGroupeCount] = useState(0)
  const [subGroupeCount, setSubGroupeCount] = useState(0)
  const [realmConnected, setRealmConnected] = useState('—')

  useEffect(() => {
    let cancelled = false

    ;(async () => {
      try {
        const [uCntRes, uActRes, rCntRes, realmRes, groupsRes] = await Promise.all([
          authFetch(`${API_USERS}/count`),
          authFetch(`${API_USERS}/active`), // peut être bool, count, array
          authFetch(`${API_ROLES}/count`),
          authFetch(`${API_BASE}/realm`),
          authFetch(`${API_GROUPES}/stats`),
        ])

        const [uCnt, uAct, rCnt, realm, groups] = await Promise.all([
          uCntRes.ok ? uCntRes.json() : null,
          uActRes.ok ? uActRes.json() : null,
          rCntRes.ok ? rCntRes.json() : null,
          realmRes.ok ? realmRes.json() : null,
          groupsRes.ok ? groupsRes.json() : null,
        ])

        if (cancelled) return

        // 1ère fois, on log pour voir le shape réel
        if (process.env.NODE_ENV !== 'production') {
          console.debug('[widgets] payloads:', {
            users_count: uCnt,
            users_active: uAct,
            roles_count: rCnt,
            realm,
            groups,
          })
        }

        setUserCount(normalizeCount(uCnt))
        setUserActive(normalizeCount(uAct)) // accepte bool/nb/array/object
        setRoleCount(normalizeCount(rCnt))
        setRealmConnected(asText(realm?.realm))

        // stats groupes: accepte {groups, subGroups} ou nombres directs
        const g = normalizeCount(groups?.groups ?? groups)
        const sg = normalizeCount(groups?.subGroups ?? groups?.subgroups)
        setGroupeCount(g)
        setSubGroupeCount(sg)
      } catch (e) {
        console.error('❌ WidgetsBrand error:', e)
      }
    })()

    return () => {
      cancelled = true
    }
  }, [])

  return (
    <CRow className={className} xs={{ gutter: 4 }}>
      <CCol sm={6} xl={4} xxl={3}>
        <CWidgetStatsD
          color="warning"
          icon={<CIcon icon={cilUser} height={52} className="my-4 text-white" />}
          values={[
            { title: 'Utilisateurs', value: String(userCount) },
            { title: 'Actifs', value: String(userActive) },
          ]}
        />
      </CCol>

      <CCol sm={6} xl={4} xxl={3}>
        <CWidgetStatsD
          icon={<CIcon icon={cilShieldAlt} height={52} className="my-4 text-white" />}
          values={[{ title: 'Rôles', value: String(roleCount) }]}
          style={{ '--cui-card-cap-bg': '#4875b4' }}
        />
      </CCol>

      <CCol sm={6} xl={4} xxl={3}>
        <CWidgetStatsD
          icon={<CIcon icon={cilLayers} height={52} className="my-4 text-white" />}
          values={[
            { title: 'Groupes', value: String(groupeCount) },
            { title: 'Sous-groupes', value: String(subGroupeCount) },
          ]}
          style={{ '--cui-card-cap-bg': '#00aced' }}
        />
      </CCol>

      <CCol sm={6} xl={4} xxl={3}>
        <CWidgetStatsD
          icon={<CIcon icon={cilHome} height={52} className="my-4 text-white" />}
          values={[{ title: 'Nom du realm', value: realmConnected }]}
          style={{ '--cui-card-cap-bg': '#3b5998' }}
        />
      </CCol>
    </CRow>
  )
}

WidgetsBrand.propTypes = {
  className: PropTypes.string,
}

export default WidgetsBrand
