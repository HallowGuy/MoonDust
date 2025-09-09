import React, { createContext, useContext, useState } from "react"

const MessengerContext = createContext()

export const MessengerProvider = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false)

  const openMessenger = () => setIsOpen(true)
  const closeMessenger = () => setIsOpen(false)
  const toggleMessenger = () => setIsOpen(prev => !prev)

  return (
    <MessengerContext.Provider value={{ isOpen, openMessenger, closeMessenger, toggleMessenger }}>
      {children}
    </MessengerContext.Provider>
  )
}

export const useMessenger = () => useContext(MessengerContext)
