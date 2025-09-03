import React, { useEffect, useRef } from 'react'
import { NavLink } from 'react-router-dom'
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
  cilSun,cilPuzzle,cilCursor,cilNotes,cilChartPie,cilStar,cilCalculator,cilDescription,cilDrop,cilPencil
} from '@coreui/icons'

import { AppBreadcrumb } from './index'
import { AppHeaderDropdown } from './header/index'

const AppHeader = () => {
  const headerRef = useRef()
  const { colorMode, setColorMode } = useColorModes('coreui-free-react-admin-template-theme')

  const dispatch = useDispatch()
  const sidebarShow = useSelector((state) => state.sidebarShow)

  useEffect(() => {
    document.addEventListener('scroll', () => {
      headerRef.current &&
        headerRef.current.classList.toggle('shadow-sm', document.documentElement.scrollTop > 0)
    })
  }, [])

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
            <CNavLink to="/dashboard" as={NavLink}>
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
          <CDropdown variant="nav-item">
        <CDropdownToggle color="link">
          <CIcon icon={cilPuzzle} className="me-1" /> Base
        </CDropdownToggle>
        <CDropdownMenu>
          <CDropdownItem as={NavLink} to="/base/accordion">Accordion</CDropdownItem>
  <CDropdownItem as={NavLink} to="/base/breadcrumbs">Breadcrumb</CDropdownItem>
  <CDropdownItem as={NavLink} to="/base/cards">Cards</CDropdownItem>
  <CDropdownItem as={NavLink} to="/base/carousels">Carousel</CDropdownItem>
  <CDropdownItem as={NavLink} to="/base/collapses">Collapse</CDropdownItem>
  <CDropdownItem as={NavLink} to="/base/list-groups">List group</CDropdownItem>
  <CDropdownItem as={NavLink} to="/base/navs">Navs & Tabs</CDropdownItem>
  <CDropdownItem as={NavLink} to="/base/paginations">Pagination</CDropdownItem>
  <CDropdownItem as={NavLink} to="/base/placeholders">Placeholders</CDropdownItem>
  <CDropdownItem as={NavLink} to="/base/popovers">Popovers</CDropdownItem>
  <CDropdownItem as={NavLink} to="/base/progress">Progress</CDropdownItem>
  <CDropdownItem as={NavLink} to="/base/spinners">Spinners</CDropdownItem>
  <CDropdownItem as={NavLink} to="/base/tables">Tables</CDropdownItem>
  <CDropdownItem as={NavLink} to="/base/tabs">Tabs</CDropdownItem>
  <CDropdownItem as={NavLink} to="/base/tooltips">Tooltips</CDropdownItem>
        </CDropdownMenu>
      </CDropdown>

      {/* Buttons */}
      <CDropdown variant="nav-item">
        <CDropdownToggle color="link">
          <CIcon icon={cilCursor} className="me-1" /> Buttons
        </CDropdownToggle>
        <CDropdownMenu>
          <CDropdownItem as={NavLink} to="/buttons/buttons">
  Buttons
</CDropdownItem>
<CDropdownItem as={NavLink} to="/buttons/button-groups">
  Button groups
</CDropdownItem>
<CDropdownItem as={NavLink} to="/buttons/dropdowns">
  Dropdowns
</CDropdownItem>

        </CDropdownMenu>
      </CDropdown>

      {/* Forms */}
      <CDropdown variant="nav-item">
        <CDropdownToggle color="link">
          <CIcon icon={cilNotes} className="me-1" /> Forms
        </CDropdownToggle>
        <CDropdownMenu>
          <CDropdownItem as={NavLink} to="/forms/checks-radios">
  Checks & Radios
</CDropdownItem>
<CDropdownItem as={NavLink} to="/forms/floating-labels">
  Floating Labels
</CDropdownItem>
<CDropdownItem as={NavLink} to="/forms/form-control">
  Form Control
</CDropdownItem>
<CDropdownItem as={NavLink} to="/forms/input-group">
  Input Group
</CDropdownItem>
<CDropdownItem as={NavLink} to="/forms/range">
  Range
</CDropdownItem>
<CDropdownItem as={NavLink} to="/forms/select">
  Select
</CDropdownItem>
<CDropdownItem as={NavLink} to="/forms/layout">
  Layout
</CDropdownItem>
<CDropdownItem as={NavLink} to="/forms/validation">
  Validation
</CDropdownItem>

        </CDropdownMenu>
      </CDropdown>

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

      {/* Notifications */}
      <CDropdown variant="nav-item">
        <CDropdownToggle color="link">
          <CIcon icon={cilBell} className="me-1" /> Notifications
        </CDropdownToggle>
        <CDropdownMenu>
         <CDropdownItem as={NavLink} to="/notifications/alerts">
  Alerts
</CDropdownItem>
<CDropdownItem as={NavLink} to="/notifications/badges">
  Badges
</CDropdownItem>
<CDropdownItem as={NavLink} to="/notifications/modals">
  Modal
</CDropdownItem>
<CDropdownItem as={NavLink} to="/notifications/toasts">
  Toasts
</CDropdownItem>

        </CDropdownMenu>
      </CDropdown>

      {/* Widgets */}
      <CNavItem>
        <CNavLink to="/widgets" as={NavLink}>
          <CIcon icon={cilCalculator} className="me-1" /> Widgets
        </CNavLink>
      </CNavItem>

     

      {/* Docs */}
      <CNavItem>
        <CNavLink
          href="https://coreui.io/react/docs/templates/installation/"
          target="_blank"
        >
          <CIcon icon={cilDescription} className="me-1" /> Docs
        </CNavLink>
      </CNavItem>

     
        </CHeaderNav>
         <CHeaderNav className="ms-auto">
          <CNavItem>
            <CNavLink href="#">
              <CIcon icon={cilBell} size="lg" />
            </CNavLink>
          </CNavItem>
          <CNavItem>
            <CNavLink href="#">
              <CIcon icon={cilList} size="lg" />
            </CNavLink>
          </CNavItem>
          <CNavItem>
            <CNavLink href="#">
              <CIcon icon={cilEnvelopeOpen} size="lg" />
            </CNavLink>
          </CNavItem>
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
