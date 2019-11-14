import React from 'react';
import PropTypes from 'prop-types';
import {  Navbar as RootNavBar, Nav, NavDropdown } from 'react-bootstrap'

const NavBar = (props) => {
  return (
    <RootNavBar expand="lg" className="navbar">
      <RootNavBar.Toggle aria-controls="basic-navbar-nav" />
      <RootNavBar.Collapse id="basic-navbar-nav">
        <Nav className="mr-auto">
          {props.left?props.left:<div></div>}
        </Nav>
        <div>
          {props.right?props.right:<div></div>}
        </div>
      </RootNavBar.Collapse>
    </RootNavBar>
  )
}

NavBar.propTypes ={
  left: PropTypes.any,
  right: PropTypes.any
}

const UserMenu = (props) => {
  return (
    <NavDropdown title={
      props.username?
        <span>
          <span className="header-user-name mr-3">{props.username}</span> 
          <p className="btn btn-success rounded-circle">{props.username.substring(0, 2)}</p>
        </span>
        :
        <span></span>
    } id="basic-nav-dropdown" alignRight >
      {props.children}
    </NavDropdown>
  )
}

UserMenu.propTypes = {
  username: PropTypes.string,
  children: PropTypes.any
}

NavBar.UserMenu = UserMenu


export default NavBar