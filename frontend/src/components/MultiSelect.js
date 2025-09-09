import React, { useEffect, useState } from "react"
import Select from "react-select"
import { API_LISTES_BY_TYPE } from "src/api"

const MultiSelect = ({ type, label = "Sélection", value = [], onChange }) => {
  const [options, setOptions] = useState([])

  const getAuthHeaders = () => ({
    "Content-Type": "application/json",
    Authorization: `Bearer ${localStorage.getItem("access_token")}`,
  })

  // Charger toutes les valeurs du type
  const fetchOptions = async () => {
    const res = await fetch(API_LISTES_BY_TYPE(type), { headers: getAuthHeaders() })
    if (res.ok) {
      const data = await res.json()
      setOptions(data.map((item) => ({ value: item.id, label: item.valeur })))
    }
  }
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
    fetchOptions()
  }, [type])

  return (
    <div className="mb-3">
      <label className="form-label">{label}</label>
      <Select
        isMulti
        options={options}
        value={value}
        onChange={onChange}
        placeholder={`Choisir ${label.toLowerCase()}...`}
              styles={customStyles}

      />
    </div>
  )
}

export default MultiSelect
