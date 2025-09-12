import React from 'react'
import PropTypes from 'prop-types'
import { CRow, CCol } from '@coreui/react'


import UsersWidget from 'src/dashboard/widgets/UsersWidget'
import RolesWidget from 'src/dashboard/widgets/RolesWidget'
import GroupsWidget from 'src/dashboard/widgets/GroupsWidget'
import RealmWidget from 'src/dashboard/widgets/RealmWidget'


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