

import React from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';

const ToolBar = (props) =>{
  return (
    <div className="toolbar">
      <h2>{props.title}</h2>
      {props.children}
    </div>
  )
}

ToolBar.propTypes ={
  title: PropTypes.string,
  children: PropTypes.any
}

const AddNewButton = (props) => {
  return (
    <Link to={props.url} className="add-button" onClick={props.onClick}>
      <span className="plus"></span>
      {props.title}
    </Link>
  )
}

AddNewButton.propTypes ={
  title: PropTypes.string,
  url: PropTypes.string,
  onClick: PropTypes.func
}

const ManageButton = (props) => {
  return (
    <Link to="#" onClick={(e) => {
      e.preventDefault();
      e.stopPropagation();
      props.onClick(e);
    }} className="manage-button">
      {props.title}
    </Link>
  )
}

ManageButton.propTypes = {
  title: PropTypes.string,
  onClick: PropTypes.func
}

const RefreshButton = (props) => {
  return (
    <Link to="#" onClick={(e) => {
      e.preventDefault();
      e.stopPropagation();
      props.onClick(e);
    }} className="refresh-button">
      <img src="../../../assets/static/images/toolbar/Refresh.svg"></img>
      Refresh
    </Link>
  )
}

RefreshButton.propTypes = {
  onClick: PropTypes.func
}

ToolBar.AddNew = AddNewButton
ToolBar.Manage = ManageButton
ToolBar.Refresh = RefreshButton

export default ToolBar