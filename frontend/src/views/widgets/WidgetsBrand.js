import React, { useState, useEffect } from 'react'
import PropTypes from 'prop-types'
import { CWidgetStatsD, CRow, CCol } from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cibFacebook, cibLinkedin, cibTwitter, cilUser } from '@coreui/icons'
import { CChart } from '@coreui/react-chartjs'

const WidgetsBrand = (props) => {
  const [userCount, setUserCount] = useState(0)
  const [userActive, setUserActive] = useState(0)

  const API_BASE = import.meta.env.VITE_API_URL || process.env.REACT_APP_API_URL

  useEffect(() => {
    // nombre total d'utilisateurs
    fetch(`${API_BASE}/users/count`)
      .then(res => res.json())
      .then(data => setUserCount(Number(data.count)))
      .catch(err => console.error('❌ Erreur API count:', err))

    // nombre d'actifs du mois
    fetch(`${API_BASE}/users/active`)
      .then(res => res.json())
      .then(data => setUserActive(Number(data.userActive))) // ✅ FIX ICI
      .catch(err => console.error('❌ Erreur API actifs mois:', err))
  }, [API_BASE])

  const chartOptions = {
    elements: {
      line: { tension: 0.4 },
      point: {
        radius: 0,
        hitRadius: 10,
        hoverRadius: 4,
        hoverBorderWidth: 3,
      },
    },
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: { x: { display: false }, y: { display: false } },
  }

  return (
    <CRow className={props.className} xs={{ gutter: 4 }}>
      <CCol sm={6} xl={4} xxl={3}>
        <CWidgetStatsD
          icon={<CIcon icon={cibFacebook} height={52} className="my-4 text-white" />}
          values={[{ title: 'friends', value: '89K' }, { title: 'feeds', value: '459' }]}
          style={{ '--cui-card-cap-bg': '#3b5998' }}
          {...(props.withCharts && {
            chart: (
              <CChart
                className="position-absolute w-100 h-100"
                type="line"
                data={{
                  labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'],
                  datasets: [
                    {
                      backgroundColor: 'rgba(255,255,255,.1)',
                      borderColor: 'rgba(255,255,255,.55)',
                      data: [65, 59, 84, 84, 51, 55, 40],
                      borderWidth: 2,
                      fill: true,
                    },
                  ],
                }}
                options={chartOptions}
              />
            ),
          })}
        />
      </CCol>

      <CCol sm={6} xl={4} xxl={3}>
        <CWidgetStatsD
          icon={<CIcon icon={cibTwitter} height={52} className="my-4 text-white" />}
          values={[{ title: 'followers', value: '973k' }, { title: 'tweets', value: '1.792' }]}
          style={{ '--cui-card-cap-bg': '#00aced' }}
          {...(props.withCharts && {
            chart: (
              <CChart
                className="position-absolute w-100 h-100"
                type="line"
                data={{
                  labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'],
                  datasets: [
                    {
                      backgroundColor: 'rgba(255,255,255,.1)',
                      borderColor: 'rgba(255,255,255,.55)',
                      data: [1, 13, 9, 17, 34, 41, 38],
                      borderWidth: 2,
                      fill: true,
                    },
                  ],
                }}
                options={chartOptions}
              />
            ),
          })}
        />
      </CCol>

      <CCol sm={6} xl={4} xxl={3}>
        <CWidgetStatsD
          icon={<CIcon icon={cibLinkedin} height={52} className="my-4 text-white" />}
          values={[{ title: 'contacts', value: '652' }, { title: 'feeds', value: '1.293' }]}
          style={{ '--cui-card-cap-bg': '#4875b4' }}
          {...(props.withCharts && {
            chart: (
              <CChart
                className="position-absolute w-100 h-100"
                type="line"
                data={{
                  labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'],
                  datasets: [
                    {
                      backgroundColor: 'rgba(255,255,255,.1)',
                      borderColor: 'rgba(255,255,255,.55)',
                      data: [78, 81, 80, 45, 34, 12, 40],
                      borderWidth: 2,
                      fill: true,
                    },
                  ],
                }}
                options={chartOptions}
              />
            ),
          })}
        />
      </CCol>

      <CCol sm={6} xl={4} xxl={3}>
        <CWidgetStatsD
          color="warning"
          icon={<CIcon icon={cilUser} height={52} className="my-4 text-white" />}
          values={[
            { title: 'Utilisateurs', value: userCount },
            { title: 'Actifs', value: userActive },
          ]}
          {...(props.withCharts && {
            chart: (
              <CChart
                className="position-absolute w-100 h-100"
                type="line"
                data={{
                  labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'],
                  datasets: [
                    {
                      backgroundColor: 'rgba(255,255,255,.1)',
                      borderColor: 'rgba(255,255,255,.55)',
                      data: [35, 23, 56, 22, 97, 23, 64],
                      borderWidth: 2,
                      fill: true,
                    },
                  ],
                }}
                options={chartOptions}
              />
            ),
          })}
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
