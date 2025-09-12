// src/utils/authFetch.js
export const authFetch = (url, options = {}) => {
const token = localStorage.getItem('access_token')
const headers = {
...(options.headers || {}),
...(token ? { Authorization: `Bearer ${token}` } : {}),
}
return fetch(url, { ...options, headers })
}


export const authFetchJSON = (url, options = {}) => {
const token = localStorage.getItem('access_token')
const headers = {
'Content-Type': 'application/json',
...(options.headers || {}),
...(token ? { Authorization: `Bearer ${token}` } : {}),
}
return fetch(url, { ...options, headers })
}