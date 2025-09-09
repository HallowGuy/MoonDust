import React, { useEffect, useState } from "react"
import Select from "react-select"
import { API_LISTES_BY_TYPE, API_LISTES_CHILDREN } from "src/api"

const CascadeSelect = ({
  type,
  cascade = true, // ✅ si false = simple liste
  parentLabel = "Parent",
  childLabel = "Enfant",
  value,
  onChange,
}) => {
  const [parents, setParents] = useState([])
  const [children, setChildren] = useState([])
  const [selectedParent, setSelectedParent] = useState(null)
  const [selectedChild, setSelectedChild] = useState(null)

  const getAuthHeaders = () => ({
    "Content-Type": "application/json",
    Authorization: `Bearer ${localStorage.getItem("access_token")}`,
  })

  // Charger les parents
  const fetchParents = async () => {
    const res = await fetch(API_LISTES_BY_TYPE(type), { headers: getAuthHeaders() })
    if (res.ok) {
      const data = await res.json()
      setParents(data.filter((item) => !item.parent_id))
    }
  }

  // Charger les enfants selon parent sélectionné
  const fetchChildren = async (parentId) => {
    if (!parentId || !cascade) {
      setChildren([])
      return
    }
    const res = await fetch(API_LISTES_CHILDREN(type, parentId), { headers: getAuthHeaders() })
    if (res.ok) {
      setChildren(await res.json())
    }
  }

  useEffect(() => {
    fetchParents()
  }, [type])
  useEffect(() => {
  if (value) {
    // en mode simple liste (cascade=false)
    if (!cascade) {
      setSelectedParent(value)
    } else {
      // si cascade : tu peux gérer parent/child ici
      if (value.parent) setSelectedParent(value.parent)
      if (value.child) setSelectedChild(value.child)
    }
  }
}, [value, cascade])
    const customStyles = {
  control: (base) => ({
    ...base,
    backgroundColor: "#2b2f3a",
    borderColor: "#444",
    color: "#f1f1f1",
  }),
  menu: (base) => ({
    ...base,
    backgroundColor: "#2b2f3a",
    color: "#f1f1f1",
  }),
  option: (base, state) => ({
    ...base,
    backgroundColor: state.isFocused ? "#3b3f4a" : "#2b2f3a",
    color: "#f1f1f1",
  }),
  singleValue: (base) => ({
    ...base,
    color: "#f1f1f1",
  }),
}
  useEffect(() => {
    if (cascade) fetchChildren(selectedParent?.value)
  }, [selectedParent, cascade])

  // Gestion sélection parent
  const handleParentChange = (option) => {
    setSelectedParent(option)
    if (!cascade) {
      onChange(option) // ✅ mode simple → on renvoie juste la valeur parent
    } else {
      setSelectedChild(null)
      onChange({ parent: option, child: null })
    }
  }

  // Gestion sélection enfant
  const handleChildChange = (option) => {
    setSelectedChild(option)
    onChange({ parent: selectedParent, child: option })
  }

  return (
    <div className="d-flex flex-column gap-3">
      <div>
        <label className="form-label">{parentLabel}</label>
        <Select
          options={parents.map((p) => ({ value: p.id, label: p.valeur }))}
          value={selectedParent}
          onChange={handleParentChange}
          placeholder="Choisir..."
          styles={customStyles}
        />
      </div>

      {cascade && selectedParent && (
        <div>
          <label className="form-label">{childLabel}</label>
          <Select
            options={children.map((c) => ({ value: c.id, label: c.valeur }))}
            value={selectedChild}
            onChange={handleChildChange}
            placeholder="Choisir..."
          />
        </div>
      )}
    </div>
  )
}

export default CascadeSelect
