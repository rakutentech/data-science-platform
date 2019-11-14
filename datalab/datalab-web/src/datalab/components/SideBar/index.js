import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { iconsImages } from '../../constants/icons_images'

const SideBar = (props) => {
  return (
    <div className="sidebar">
      <SideBarLogo serverName={props.serverName} />
      <SideBarItems>
        {props.children}
      </SideBarItems>
    </div>
  )
}

SideBar.propTypes = {
  serverName: PropTypes.string,
  children: PropTypes.any
}

const SideBarItems = (props) => {
  return (
    <div className="sidebar-items">
      {props.children}
    </div>
  )
}

SideBarItems.propTypes = {
  children: PropTypes.any
}

const SideBarItem = (props) => {
  let ind_path = window.location.pathname.includes('admin') ? 2 : 1
  let ind_href = window.location.pathname.includes('admin') ? 1 : 1
  let pathname = window.location.pathname.split('/')[ind_path]
  let className = `sidebar-item-wrapper ${pathname === props.href.split('/')[ind_href] ? 'active' : ''}`
  return (
    <Link to={props.href} className={className}>
      <div className="sidebar-item">
        <img src={props.icon} />{props.text}
      </div>
    </Link>
  )
}

SideBarItem.propTypes = {
  href: PropTypes.string,
  text: PropTypes.string,
  icon: PropTypes.string
}

const BottomBlock = (props) => {
  return (
    <div className="sidebar-bottom-block">
      {props.children}
    </div>
  )
}

BottomBlock.propTypes = {
  children: PropTypes.any
}

const SideBarLogo = (props) => {
  return (
    <div className="sidebar-logo">
      <Link to="/">
        <figure>
          <img
            src={iconsImages.LOGO_SVG}
          />
        </figure>
        <div className="sidebar-logo__name">
          <p className="sidebar-logo__rakuten-name">Rakuten</p>
          <p className="sidebar-logo__service-name">{props.serverName}</p>
        </div>
      </Link>
    </div>
  )
}

SideBarLogo.propTypes = {
  serverName: PropTypes.string
}

const SubSideBar = (props) => {
  return (
    <div className="sub-sidebar">
      {props.children}
    </div>
  )
}

SubSideBar.propTypes = {
  children: PropTypes.any
}

const SubSideBarItem = (props) => {
  let pathname = window.location.pathname.split('/').join('')
  let is_homepage = pathname === '' && props.href.split('/').join('') === 'datalab'
  let className = `sub-sidebar-item ${pathname === props.href.split('/').join('') || is_homepage ? 'active' : ''}`
  return (
    <Link to={props.href} className={className}>
      <img src={props.icon} className="icon-sidebar" />
      <img src={props.active_icon} className="icon-sidebar-active" />
      {props.text}</Link>
  )
}

SubSideBarItem.propTypes = {
  href: PropTypes.string,
  text: PropTypes.string,
  icon: PropTypes.string,
  active_icon: PropTypes.string
}

const SubSideBarHeader = (props) => {
  return (
    <div className="sub-sidebar-header">
      {props.children}
    </div>
  )
}

SubSideBarHeader.propTypes = {
  children: PropTypes.any
}

const SubSideBarCopyright = () => {
  return (
    <div className="sub-sidebar-copyright">
      <img alt=""
        src={iconsImages.RAKUTEN_LOGO}
      />
      <div>© 2018 DScP Team</div>
    </div>
  )
}

SideBar.Item = SideBarItem
SideBar.Bottom = BottomBlock
SideBar.SubSideBar = SubSideBar
SideBar.SubSideBar.Header = SubSideBarHeader
SideBar.SubSideBar.Item = SubSideBarItem
SideBar.Copyright = SubSideBarCopyright

export default SideBar