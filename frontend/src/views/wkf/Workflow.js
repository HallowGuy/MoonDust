import React from 'react'
import {
  CCard, CCardBody, CCardHeader, CCardTitle, CButton
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilBriefcase, cilTask } from '@coreui/icons'

const workflows = [
  { 
    id: 1, 
    title: "Demande de congés", 
    description: "Soumettre une nouvelle demande de congés", 
    link: "/wkf/test",
    icon: cilBriefcase,
    color: "primary"
  },
  { 
    id: 2, 
    title: "Avancement des demandes", 
    description: "Suivre l'état d'avancement des demandes de congés", 
    link: "/wkf/avancementworkflow",
    icon: cilTask,
    color: "info"
  },
]

const Workflow = () => {
  return (
    <div className="container py-4">
      <CCard className="mb-4">
        <CCardHeader className="d-flex justify-content-between align-items-center">
          <span>Workflow</span>
        </CCardHeader>

      {/* Main Card Body avec la grille */}
      <CCardBody>
        <div className="row">
          {workflows.map((wf) => (
            <div key={wf.id} className="col-12 col-md-6 col-lg-4 mb-4">
              <CCard 
                className="h-100 shadow-sm border-0"
                style={{ borderRadius: "1rem", overflow: "hidden" }}
              >
                <CCardHeader 
                  className={`bg-${wf.color} text-white text-center`}
                  style={{ 
                    minHeight: "120px", 
                    display: "flex", 
                    flexDirection: "column", 
                    justifyContent: "center", 
                    alignItems: "center" 
                  }}
                >
                  <CIcon icon={wf.icon} size="xxl" className="mb-2" />
                  <CCardTitle className="m-0">{wf.title}</CCardTitle>
                </CCardHeader>
                <CCardBody className="text-center">
                  <p className="text-muted">{wf.description}</p>
                  <CButton 
                    color={wf.color} 
                    href={wf.link} 
                    style={{ borderRadius: "50px", padding: "0.5rem 1.5rem" }}
                  >
                    Ouvrir
                  </CButton>
                </CCardBody>
              </CCard>
            </div>
          ))}
        </div>
      </CCardBody>
    </CCard>

    </div>
  )
}

export default Workflow
