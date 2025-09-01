export function safeBuildUrl(path, base, { fallbackBase = 'http://localhost:8081' } = {}) {
  const chosenBase = base && /^https?:\/\//.test(base) ? base : fallbackBase
  try {
    return new URL(path, chosenBase).toString()
  } catch (e) {
    console.error('Invalid URL parts', { path, base, chosenBase, error: e?.message })
    return null
  }
}

