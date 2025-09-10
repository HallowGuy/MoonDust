import React, { useState, useContext, useRef, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import CIcon from "@coreui/icons-react"
import { cilSearch } from "@coreui/icons"
import { PermissionsContext } from "src/context/PermissionsContext"
import { buildNav } from "src/_nav"
import { flattenNav } from "src/utils/navUtils"
import { bottom } from "@popperjs/core"

const SearchMenu = () => {
  const navigate = useNavigate()
  const { routesConfig, currentUserRoles } = useContext(PermissionsContext)

  const allowedNav = buildNav(routesConfig, currentUserRoles || [])
  const navItems = flattenNav(allowedNav)

  const [expanded, setExpanded] = useState(false)
  const [query, setQuery] = useState("")
  const [results, setResults] = useState([])

  const inputRef = useRef(null)

  const handleInput = (e) => {
    const value = e.target.value
    setQuery(value)
    if (value.length > 1) {
      const filtered = navItems.filter((item) =>
        item.name.toLowerCase().includes(value.toLowerCase())
      )
      setResults(filtered)
    } else {
      setResults([])
    }
  }

  const handleSelect = (to) => {
    setQuery("")
    setResults([])
    setExpanded(false)
    navigate(to)
  }

  const handleSearch = (e) => {
    e.preventDefault()
    if (results.length > 0) {
      handleSelect(results[0].to)
    }
  }

  // focus auto quand on ouvre
  useEffect(() => {
    if (expanded && inputRef.current) {
      inputRef.current.focus()
    }
  }, [expanded])

  return (
    <li className="nav-item d-flex align-items-center position-relative dropdown me-2">
      <CIcon
        icon={cilSearch}
        size="xl"
        role="button"
        className="me-2 text-muted"
        onClick={() => setExpanded(!expanded)}
          style={{ paddingBottom: "3px" }}

      />
      <form onSubmit={handleSearch} className="d-flex align-items-center">
        <input
          ref={inputRef}
          type="text"
          placeholder="Rechercher..."
          value={query}
          onChange={handleInput}
          style={{
            width: expanded ? "150px" : "0px",
            opacity: expanded ? 1 : 0,
            padding: expanded ? "0.25rem 0.5rem" : "0",
            border: expanded ? "1px solid #ced4da" : "none",
            borderRadius: "4px",
            transition: "all 0.3s ease",
            overflow: "hidden",
          }}
          className="form-control form-control-sm"
        />
      </form>

      {expanded && results.length > 0 && (
        <ul
          className="list-group position-absolute mt-5"
          style={{ minWidth: "150px", zIndex: 1050, top: "0", left: "28px" }}
        >
          {results.map((item, idx) => (
            <li
              key={idx}
              className="list-group-item list-group-item-action"
              role="button"
              onClick={() => handleSelect(item.to)}
            >
              {item.name}
            </li>
          ))}
        </ul>
      )}
    </li>
  )
}

export default SearchMenu
