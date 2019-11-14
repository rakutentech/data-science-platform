import React from 'react';
import '../../../assets/styles/component/sidebar.scss'
import PropTypes from 'prop-types';
import {Link} from 'react-router-dom';

const SideBar = (props) => {
  return (
    <div className="sidebar">
      <SideBarLogo serverName={props.serverName} />
      <SideBarItems>
        {props.children}
      </SideBarItems>
    </div>
  )
};

SideBar.propTypes ={
  serverName: PropTypes.string,
  children: PropTypes.any
};

const SideBarItems = (props) =>{
  return (
    <div className="sidebar-items">
      {props.children}
    </div>
  )
};

SideBarItems.propTypes ={
  children: PropTypes.any
};

const SideBarItem = (props) => {
  return (
    <Link to={props.href} className="sidebar-item"><img src={props.icon} alt="sidebar-icon"/><span
      className="sidebar-text">{props.text}</span></Link>
  )
};

SideBarItem.propTypes ={
  href: PropTypes.string,
  text: PropTypes.string,
  icon: PropTypes.string
};

const BottomBlock = (props) => {
  return (
    <div className="sidebar-bottom-block">
      {props.children}
    </div>
  )
};

BottomBlock.propTypes ={
  children: PropTypes.any
};

const SideBarLogo = (props) => {
  return (
    <div className="sidebar-logo">
      <Link to="/">
        <figure>
          <img
            src="../../../assets/static/images/logo.svg"
            alt="logo"
          />
        </figure>
        <div className="sidebar-logo__name">
          <p className="sidebar-logo__service-name">{props.serverName}</p>
        </div>
      </Link>
    </div>
  )
};

SideBarLogo.propTypes ={
  serverName: PropTypes.string
};

const SubSideBar = (props) => {
  return (
    <div className="sub-sidebar">
      {props.children}
    </div>
  )
};

SubSideBar.propTypes ={
  children: PropTypes.any
};

const SubSideBarItem = (props) => {
  return (
    <Link to={props.href} className="sub-sidebar-item"><img src={props.icon} alt="sub-sidebar-icon"/>{props.text}</Link>
  )
};

SubSideBarItem.propTypes ={
  href: PropTypes.string,
  text: PropTypes.string,
  icon: PropTypes.string
};

const SubSideBarHeader = (props) => {
  return (
    <div className="sub-sidebar-header">
      {props.children}
    </div>
  )
};

SubSideBarHeader.propTypes ={
  children: PropTypes.any
};


SideBar.Item = SideBarItem;
SideBar.Bottom = BottomBlock;
SideBar.SubSideBar = SubSideBar;
SideBar.SubSideBar.Header = SubSideBarHeader;
SideBar.SubSideBar.Item = SubSideBarItem;

export default SideBar
