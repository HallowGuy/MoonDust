import React, { useEffect, useState, useContext } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { Link } from 'react-router-dom'
import { PermissionsContext } from 'src/context/PermissionsContext'

import {
  CCloseButton,
  CSidebar,
  CSidebarBrand,
  CSidebarFooter,
  CSidebarHeader,
  CSidebarToggler,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { AppHeaderDropdown } from './header/index'

import { AppSidebarNav } from './AppSidebarNav'
import { logo } from 'src/assets/brand/logo'
import { sygnet } from 'src/assets/brand/sygnet'
import { API_THEME_LOGO } from 'src/api'

import { buildNav } from '../_nav'

const AppSidebar = () => {
  const dispatch = useDispatch()
  const unfoldable = useSelector((state) => state.sidebarUnfoldable)
  const sidebarShow = useSelector((state) => state.sidebarShow)
  const { routesConfig, currentUserRoles } = useContext(PermissionsContext)

  const [navItems, setNavItems] = useState([])

  useEffect(() => {
    if (!routesConfig || !currentUserRoles) return
    const filtered = buildNav(routesConfig, currentUserRoles)
    setNavItems(filtered)
  }, [routesConfig, currentUserRoles]) // 👈 se relance automatiquement

  return (
    <CSidebar
      className="border-end"
      colorScheme="dark"
      position="fixed"
      unfoldable={unfoldable}
      visible={sidebarShow}
      onVisibleChange={(visible) => {
        dispatch({ type: 'set', sidebarShow: visible })
      }}
    >
      <CSidebarHeader className="border-bottom">
        <CSidebarBrand as={Link} to="/">
          <img
            src={API_THEME_LOGO}
            alt="Logo"
            className="sidebar-brand-full"
            style={{ width: "90%", height: "auto" }}
          />
          <CIcon
            customClassName="sidebar-brand-narrow"
            icon={sygnet}
            height={32}
          />
        </CSidebarBrand>

        <CCloseButton
          className="d-lg-none"
          dark
          onClick={() => dispatch({ type: 'set', sidebarShow: false })}
        />
      </CSidebarHeader>

      {/* 🔥 Ici on passe la navigation filtrée */}
      <AppSidebarNav items={navItems} />

      <CSidebarFooter className="border-top d-none d-lg-flex"><CSidebarToggler          onClick={() => dispatch({ type: 'set', sidebarUnfoldable: !unfoldable })}
        />
      </CSidebarFooter>
      
    </CSidebar>
  )
}

export default React.memo(AppSidebar)
