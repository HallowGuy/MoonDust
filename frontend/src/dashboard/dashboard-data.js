import React, { createContext, useContext, useEffect, useMemo, useState } from 'react'
import {
  API_USERS,
  API_ROLES,
  API_GROUPES,
  API_BASE,
  API_LISTES,
  API_FORMS,
  API_ACTIONS_CONFIG,
  API_ROUTES_CONFIG,
} from 'src/api'

// ——— Helpers ———
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
    // fallback objet: nombre de clés (utile si on reçoit une map)
    return Object.keys(data).length
  }
  return 0
}
const asText = (v, fallback = '—') => (v == null || v === '' ? fallback : String(v))
const authFetch = (url, options = {}) => {
  const token = localStorage.getItem('access_token')
  const headers = { ...(options.headers || {}), ...(token ? { Authorization: `Bearer ${token}` } : {}) }
  return fetch(url, { ...options, headers })
}

// ——— Context ———
const DashboardDataContext = createContext({
  loading: true,
  error: null,
  users: { count: 0, active: 0 },
  roles: { count: 0 },
  groups: { groups: 0, subGroups: 0 },
  realm: { name: '—' },
  // nouveaux KPIs
  forms: { count: 0 },
  lists: { count: 0 },
  actions: { count: 0 },
  routes: { count: 0 },
  refresh: () => {},
})

export const DashboardDataProvider = ({ children }) => {
  const [state, setState] = useState({
    loading: true,
    error: null,
    users: { count: 0, active: 0 },
    roles: { count: 0 },
    groups: { groups: 0, subGroups: 0 },
    realm: { name: '—' },
    // nouveaux KPIs
    forms: { count: 0 },
    lists: { count: 0 },
    actions: { count: 0 },
    routes: { count: 0 },
  })

  const load = async () => {
    try {
      setState((s) => ({ ...s, loading: true, error: null }))

      // appels principaux (avec /count quand dispo)
      const [
        uCntRes, uActRes, rCntRes, realmRes, groupsRes,
        formsCountRes, listsCountRes, actionsCountRes, routesCountRes,
      ] = await Promise.all([
        authFetch(`${API_USERS}/count`),
        authFetch(`${API_USERS}/active`),
        authFetch(`${API_ROLES}/count`),
        authFetch(`${API_BASE}/realm`),
        authFetch(`${API_GROUPES}/stats`),
        authFetch(`${API_FORMS}/count`),                 // peut ne pas exister → fallback plus bas
        authFetch(`${API_LISTES}/count?distinct=type`),                // ajouté côté backend /listes/count
        authFetch(`${API_ACTIONS_CONFIG}/count`),        // ajouté /actions-config/count
        authFetch(`${API_ROUTES_CONFIG}/count`),         // ajouté /routes-config/count
      ])

      // parse premiers résultats
      const [uCnt, uAct, rCnt, realm, groups] = await Promise.all([
        uCntRes.ok ? uCntRes.json() : null,
        uActRes.ok ? uActRes.json() : null,
        rCntRes.ok ? rCntRes.json() : null,
        realmRes.ok ? realmRes.json() : null,
        groupsRes.ok ? groupsRes.json() : null,
      ])

      // Fallbacks intelligents pour les /count manquants
      // FORMS
      let formsJson = formsCountRes.ok ? await formsCountRes.json() : null
      if (formsJson == null) {
        const allFormsRes = await authFetch(`${API_FORMS}`)
        formsJson = allFormsRes.ok ? await allFormsRes.json() : null // array ou object map
      }
      // LISTS
      let listsJson = listsCountRes.ok ? await listsCountRes.json() : null
      if (listsJson == null) {
        const allListsRes = await authFetch(`${API_LISTES}`)
        listsJson = allListsRes.ok ? await allListsRes.json() : null // array
      }
      // ACTIONS
      let actionsJson = actionsCountRes.ok ? await actionsCountRes.json() : null
      if (actionsJson == null) {
        const actionsCfgRes = await authFetch(`${API_ACTIONS_CONFIG}`)
        actionsJson = actionsCfgRes.ok ? await actionsCfgRes.json() : null // object map
      }
      // ROUTES
      let routesJson = routesCountRes.ok ? await routesCountRes.json() : null
      if (routesJson == null) {
        const routesCfgRes = await authFetch(`${API_ROUTES_CONFIG}`)
        routesJson = routesCfgRes.ok ? await routesCfgRes.json() : null // object/array
      }

      // mapping vers le state
      const users = { count: normalizeCount(uCnt), active: normalizeCount(uAct) }
      const roles = { count: normalizeCount(rCnt) }
      const g = normalizeCount(groups?.groups ?? groups)
      const sg = normalizeCount(groups?.subGroups ?? groups?.subgroups)

      const forms = { count: normalizeCount(formsJson) }
      const lists = { count: normalizeCount(listsJson) }
      const actions = { count: normalizeCount(actionsJson) }
      const routes = { count: normalizeCount(routesJson) }

      setState((s) => ({
        ...s,
        loading: false,
        error: null,
        users,
        roles,
        groups: { groups: g, subGroups: sg },
        realm: { name: asText(realm?.realm) },
        forms,
        lists,
        actions,
        routes,
      }))
    } catch (e) {
      console.error('❌ DashboardData load error:', e)
      setState((s) => ({ ...s, loading: false, error: e }))
    }
  }

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      await load()
      if (cancelled) return
    })()
    return () => {
      cancelled = true
    }
  }, [])

  const value = useMemo(() => ({ ...state, refresh: load }), [state])

  return <DashboardDataContext.Provider value={value}>{children}</DashboardDataContext.Provider>
}

export const useDashboardData = () => useContext(DashboardDataContext)
