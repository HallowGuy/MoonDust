import React, { useState, useEffect } from 'react'
import PropTypes from 'prop-types'
import { CWidgetStatsD, CRow, CCol } from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cibFacebook, cibLinkedin, cibTwitter, cilUser, cilShieldAlt,cilLayers, cilHome } from '@coreui/icons'
import { CChart } from '@coreui/react-chartjs'
import { API_USERS,API_ROLES, API_GROUPES, API_BASE } from 'src/api'

const WidgetsBrand = (props) => {
  const [userCount, setUserCount] = useState(0)
  const [userActive, setUserActive] = useState(0)
  const [roleCount, setRoleCount] = useState(0)
  const [groupeCount, setGroupeCount] = useState(0)
const [subGroupeCount, setSubGroupCount] = useState(0)
const [realmConnected, setRealmConnected] = useState(0)


 useEffect(() => {
  fetch(`${API_USERS}/count`)
    .then(res => res.json())
    .then(data => setUserCount(Number(data.count)))

  fetch(`${API_USERS}/active`)
    .then(res => res.json())
    .then(data => setUserActive(Number(data.userActive)))

  fetch(`${API_ROLES}/count`)
    .then(res => res.json())
    .then(data => setRoleCount(Number(data.count)))

    fetch(`${API_BASE}/realm`)
    .then(res => res.json())
    .then(data => setRealmConnected(data.realm))
    
  fetch(`${API_GROUPES}/stats`)
    .then(res => res.json())
    .then(data => {
      setGroupeCount(data.groups)
      setSubGroupCount(data.subGroups)
    })
    .catch(err => console.error('❌ Erreur API groupes stats:', err))
}, [API_USERS])


  

  return (
    <CRow className={props.className} xs={{ gutter: 4 }}>
      <CCol sm={6} xl={4} xxl={3}>
        <CWidgetStatsD
          color="warning"
          icon={<CIcon icon={cilUser} height={52} className="my-4 text-white" />}
          values={[
            { title: 'Utilisateurs', value: userCount },
            { title: 'Actifs', value: userActive },
          ]}
        />
      </CCol>
      <CCol sm={6} xl={4} xxl={3}>
        <CWidgetStatsD
          icon={<CIcon icon={cilShieldAlt} height={52} className="my-4 text-white" />}
          values={[{ title: 'Rôles', value: roleCount }]}
          style={{ '--cui-card-cap-bg': '#4875b4' }}
        />
      </CCol>
     

      <CCol sm={6} xl={4} xxl={3}>
        <CWidgetStatsD
          icon={<CIcon icon={cilLayers} height={52} className="my-4 text-white" />}
          values={[{ title: 'Groupes', value: groupeCount }, { title: 'Sous-groupes', value: subGroupeCount }]}
          style={{ '--cui-card-cap-bg': '#00aced' }}
          
        />
      </CCol>
           <CCol sm={6} xl={4} xxl={3}>
        <CWidgetStatsD
          icon={<CIcon icon={cilHome} height={52} className="my-4 text-white" />}
          values={[{ title: 'Nom du realm', value: realmConnected }]}
          style={{ '--cui-card-cap-bg': '#3b5998' }}
         
        />
      </CCol>
      

      
    </CRow>
  )
}

WidgetsBrand.propTypes = {
  className: PropTypes.string,
  withCharts: PropTypes.bool,
}

export default WidgetsBrand
