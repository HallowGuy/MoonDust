import React from 'react'
import PropTypes from 'prop-types'
import { CRow, CCol } from '@coreui/react'

import UsersWidget from './UsersWidget.js'
import RolesWidget from './RolesWidget.js'
import GroupsWidget from './GroupsWidget.js'
import RealmWidget from './RealmWidget.js'


const WidgetsBrand = ({ className }) => {
return (
<CRow className={className} xs={{ gutter: 4 }}>
<CCol sm={6} xl={4} xxl={3}>
<UsersWidget />
</CCol>


<CCol sm={6} xl={4} xxl={3}>
<RolesWidget />
</CCol>


<CCol sm={6} xl={4} xxl={3}>
<GroupsWidget />
</CCol>


<CCol sm={6} xl={4} xxl={3}>
<RealmWidget />
</CCol>
</CRow>
)
}


WidgetsBrand.propTypes = {
className: PropTypes.string,
}


export default WidgetsBrand