import React from "react"

const ContactDocuments = ({ contactId }) => {
  return (
    <div className="mb-3 d-flex gap-2">
      <p>📂 Zone pour les documents liés au contact {contactId}</p>
    </div>
  )
}

export default ContactDocuments
