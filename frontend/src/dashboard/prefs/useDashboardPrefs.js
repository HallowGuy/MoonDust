import { useEffect, useMemo, useRef, useState } from 'react'
import { API_BASE } from 'src/api'

const DEFAULT_PREFS = {
  visible: ['users','roles','groups','realm','forms','listes','actions','routes'],
  order:   ['users','roles','groups','realm','forms','listes','actions','routes'],
}

const LS_KEY = (uid) => `dashboard_prefs:${uid || 'me'}`

const authFetch = (url, options = {}) => {
  const token = localStorage.getItem('access_token')
  const headers = { ...(options.headers || {}), ...(token ? { Authorization: `Bearer ${token}` } : {}) }
  return fetch(url, { ...options, headers })
}
const authFetchJSON = (url, options = {}) => {
  const token = localStorage.getItem('access_token')
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  }
  return fetch(url, { ...options, headers })
}

async function loadServerPrefs() {
  try {
    const res = await authFetch(`${API_BASE}/me/dashboard-prefs`)
    if (!res?.ok) return null
    const text = await res.text() // gère 204
    if (!text) return null
    return JSON.parse(text)
  } catch {
    return null
  }
}

async function saveServerPrefs(prefs) {
  try {
    const res = await authFetchJSON(`${API_BASE}/me/dashboard-prefs`, {
      method: 'PUT',
      body: JSON.stringify(prefs),
    })
    return !!res?.ok
  } catch {
    return false
  }
}

// ✅ allIds = liste des IDs réels (ex: Object.keys(WIDGETS_REGISTRY))
export function useDashboardPrefs(userId = 'me', allIds = null) {
  const [prefs, setPrefs] = useState(DEFAULT_PREFS)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const didLoadRef = useRef(false)

const uniq = (arr) => Array.from(new Set((arr || []).filter(Boolean)))
  const allIdsKey = Array.isArray(allIds) ? allIds.join('|') : ''

  const mergeWithAllIds = (p) => {
  if (!Array.isArray(allIds) || allIds.length === 0) return p
  const ids = uniq(allIds)

  const prevOrder = Array.isArray(p.order) ? p.order : []
  const prevVisible = Array.isArray(p.visible) ? p.visible : []

  // IDs déjà connus (dans order ou visible)
  const known = new Set([...prevOrder, ...prevVisible])

  // VRAIS nouveaux IDs (jamais vus avant)
  const newIds = ids.filter((id) => !known.has(id))

  // Conserver l'ordre existant pour les IDs présents + ajouter les nouveaux à la fin
  const order = uniq([
    ...prevOrder.filter((id) => ids.includes(id)),
    ...newIds,
  ])

  // Conserver la visibilité existante + rendre visibles seulement les nouveaux IDs
  const visible = uniq([
    ...prevVisible.filter((id) => ids.includes(id)),
    ...newIds,
  ])

  return { ...p, order, visible }
}

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        setLoading(true)
        setError(null)
        const server = await loadServerPrefs()
        const localRaw = localStorage.getItem(LS_KEY(userId))
        let local = null
        try { local = localRaw ? JSON.parse(localRaw) : null } catch {}
        const base = server || local || DEFAULT_PREFS
        const next = mergeWithAllIds(base)
        if (!cancelled) setPrefs(next)
      } catch (e) {
        console.error('prefs load error', e)
        const localRaw = localStorage.getItem(LS_KEY(userId))
        let local = null
        try { local = localRaw ? JSON.parse(localRaw) : null } catch {}
        const base = local || DEFAULT_PREFS
        const next = mergeWithAllIds(base)
        if (!cancelled) { setError(e); setPrefs(next) }
      } finally {
        if (!cancelled) setLoading(false)
        didLoadRef.current = true
      }
    })()
    return () => { cancelled = true }
  }, [userId, allIdsKey]) // 👈 re-merge si la liste des IDs change

  useEffect(() => {
    if (!didLoadRef.current) return
    const t = setTimeout(async () => {
      try {
        const safe = mergeWithAllIds(prefs) // sauvegarde “upgradée”
        localStorage.setItem(LS_KEY(userId), JSON.stringify(safe))
        await saveServerPrefs(safe)
      } catch (e) {
        console.error('prefs save error', e)
      }
    }, 800)
    return () => clearTimeout(t)
  }, [prefs, userId, allIdsKey])

  const api = useMemo(
    () => ({
      loading,
      error,
      prefs,
      setPrefs,
      toggle(id) {
        setPrefs((p) => {
          const visible = p.visible.includes(id)
            ? p.visible.filter((x) => x !== id)
            : [...p.visible, id]
          return { ...p, visible }
        })
      },
      moveUp(id) {
        setPrefs((p) => {
          const idx = p.order.indexOf(id)
          if (idx <= 0) return p
          const copy = [...p.order]
          ;[copy[idx - 1], copy[idx]] = [copy[idx], copy[idx - 1]]
          return { ...p, order: copy }
        })
      },
      moveDown(id) {
        setPrefs((p) => {
          const idx = p.order.indexOf(id)
          if (idx < 0 || idx === p.order.length - 1) return p
          const copy = [...p.order]
          ;[copy[idx + 1], copy[idx]] = [copy[idx], copy[idx + 1]]
          return { ...p, order: copy }
        })
      },
      reset() {
        setPrefs(mergeWithAllIds(DEFAULT_PREFS))
      },
    }),
    [loading, error, prefs, allIdsKey],
  )

  return api
}
