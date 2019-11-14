import React from 'react';
import PropTypes from 'prop-types';
import '../../../assets/styles/component/navbar.scss';
import {DropdownButton, Nav, Navbar as RootNavBar} from 'react-bootstrap'

const NavBar = (props) => {
  return (
    <RootNavBar bg="light" expand="lg" className="navbar">
      <RootNavBar.Toggle aria-controls="basic-navbar-nav" />
      <RootNavBar.Collapse id="basic-navbar-nav">
        <Nav className="mr-auto">
          {props.left ? props.left : <div/>}
        </Nav>
        <div>
          {props.right ? props.right : <div/>}
        </div>
      </RootNavBar.Collapse>
    </RootNavBar>
  )
};

NavBar.propTypes ={
  left: PropTypes.any,
  right: PropTypes.any
};

const UserMenu = (props) => {
  return (
    <div>
      <span>
        <DropdownButton title={
          props.username?
            <span className="navbar-title">
              {props.username}
            </span>
            :
            <span/>
        } id="dropdown-basic-button" alignRight >
          {props.children}
        </DropdownButton>
      </span>
    </div>
  )
};

UserMenu.propTypes = {
  username: PropTypes.string,
  children: PropTypes.any
};

NavBar.UserMenu = UserMenu;


export default NavBar
