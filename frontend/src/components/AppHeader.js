import React, { useEffect, useRef, useState, useContext } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import {
  CContainer,
  CDropdown,
  CDropdownItem,
  CDropdownMenu,
  CDropdownToggle,
  CHeader,
  CHeaderNav,
  CHeaderToggler,
  CNavLink,
  CNavItem,
  useColorModes,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import {
  cilBell,
  cilContrast,
  cilEnvelopeOpen,
  cilList,
  cilMenu,
  cilMoon,
  cilSun,cilPuzzle,cilCursor,cilNotes,cilChartPie,cilStar,cilCalculator,cilDescription,cilDrop,cilPencil,cilSearch
} from '@coreui/icons'
import AppSidebar from "./AppSidebar"

import { AppBreadcrumb } from './index'
import { AppHeaderDropdown } from './header/index'
import { NotificationsIcon } from "./header/NotificationsIcon"
import MessengerIcon from "./header/MessengerIcon"
import { PermissionsContext } from 'src/context/PermissionsContext'
import { buildNav } from 'src/_nav'
import _nav from 'src/_nav'
import { flattenNav } from 'src/utils/navUtils'
import { fetchWithAuth } from "../utils/auth";
import { API_CONVERSATIONS } from "src/api"
import SearchMenu from "./header/SearchMenu"

const AppHeader = () => {
const headerRef = useRef()

  const { colorMode, setColorMode } = useColorModes('coreui-free-react-admin-template-theme')
    const sidebarShow = useSelector((state) => state.sidebarShow) // ✅ correction

  const dispatch = useDispatch()

  

  return (
    <CHeader position="sticky" className="mb-4 p-0" ref={headerRef}>
      <CContainer className="border-bottom px-4" fluid>
        <CHeaderToggler
          onClick={() => dispatch({ type: 'set', sidebarShow: !sidebarShow })}
          style={{ marginInlineStart: '-14px' }}
        >
          <CIcon icon={cilMenu} size="lg" />
        </CHeaderToggler>
        <CHeaderNav className="d-none d-md-flex">
          <CNavItem>
            <CNavLink to="/settings/settings" as={NavLink}>
              Dashboard
            </CNavLink>
          </CNavItem>
          <CNavItem>
            <CNavLink to="/settings/list/users" as={NavLink}>Utilisateurs
            </CNavLink>
          </CNavItem>
          <CNavItem>
            <CNavLink href="#">Settings</CNavLink>
          </CNavItem>
            

      {/* Charts */}
      <CNavItem>
        <CNavLink to="/charts" as={NavLink}>
          <CIcon icon={cilChartPie} className="me-1" /> Charts
        </CNavLink>
      </CNavItem>

      {/* Icons */}
      <CDropdown variant="nav-item">
        <CDropdownToggle color="link">
          <CIcon icon={cilStar} className="me-1" /> Icons
        </CDropdownToggle>
        <CDropdownMenu>
          <CDropdownItem as={NavLink} to="/icons/coreui-icons">
  CoreUI Free
</CDropdownItem>
<CDropdownItem as={NavLink} to="/icons/flags">
  Flags
</CDropdownItem>
<CDropdownItem as={NavLink} to="/icons/brands">
  Brands
</CDropdownItem>

        </CDropdownMenu>
      </CDropdown>

 
     
        </CHeaderNav>
         <CHeaderNav className="ms-auto">
           <SearchMenu />
         <NotificationsIcon />
          <MessengerIcon />

        </CHeaderNav>
        <CHeaderNav>
          <li className="nav-item py-1">
            <div className="vr h-100 mx-2 text-body text-opacity-75"></div>
          </li>
          <CDropdown variant="nav-item" placement="bottom-end">
            <CDropdownToggle caret={false}>
              {colorMode === 'dark' ? (
                <CIcon icon={cilMoon} size="lg" />
              ) : colorMode === 'auto' ? (
                <CIcon icon={cilContrast} size="lg" />
              ) : (
                <CIcon icon={cilSun} size="lg" />
              )}
            </CDropdownToggle>
            <CDropdownMenu>
              <CDropdownItem
                active={colorMode === 'light'}
                className="d-flex align-items-center"
                as="button"
                type="button"
                onClick={() => setColorMode('light')}
              >
                <CIcon className="me-2" icon={cilSun} size="lg" /> Light
              </CDropdownItem>
              <CDropdownItem
                active={colorMode === 'dark'}
                className="d-flex align-items-center"
                as="button"
                type="button"
                onClick={() => setColorMode('dark')}
              >
              <CIcon className="me-2" icon={cilMoon} size="lg" /> Dark
              </CDropdownItem>
              <CDropdownItem
                active={colorMode === 'auto'}
                className="d-flex align-items-center"
                as="button"
                type="button"
                onClick={() => setColorMode('auto')}
              >
                <CIcon className="me-2" icon={cilContrast} size="lg" /> Auto
              </CDropdownItem>
            </CDropdownMenu>
          </CDropdown>
          <li className="nav-item py-1">
            <div className="vr h-100 mx-2 text-body text-opacity-75"></div>
          </li>
          <AppHeaderDropdown />
        </CHeaderNav>
      </CContainer>
      <CContainer className="px-4" fluid>
        <AppBreadcrumb />
      </CContainer>
    </CHeader>
  )
}

export default AppHeader
