import React, { Component } from 'react';
import PropTypes from 'prop-types';
import CreatableSelect from 'react-select/lib/Creatable';
import { Row, Col, Form} from 'react-bootstrap'

export default class PermissionEditor extends Component{

  static propTypes = {
    users: PropTypes.array,
    groups: PropTypes.array,
    userOptions: PropTypes.array,
    groupOptions: PropTypes.array,
    onUserChange: PropTypes.func,
    onGroupChange: PropTypes.func
  }
  constructor(props) {
    super(props)
  }

  render() {
    return (
      <Row>
        <Col>
          <Form.Label className="new-datalab-sub-title">User Accress</Form.Label>
          <CreatableSelect
            isMulti
            isSearchable={true}
            className="select-form"
            defaultValue={this.props.users.map(user => {return {label:user, value:user}})}
            placeholder="Enter username..."
            onChange={this.props.onUserChange}
            options={this.props.userOptions.map(option =>  {return {label:option, value:option}})}
          />
        </Col>
        <Col>
          <Form.Label className="new-datalab-sub-title">Group Accress</Form.Label>
          <CreatableSelect
            isMulti
            isSearchable  
            className="select-form"
            defaultValue={this.props.groups.map(group => {return {label:group, value:group}})}
            placeholder="Enter group name..."
            onChange={this.props.onGroupChange}
            options={this.props.groupOptions.map(option =>  {return {label:option, value:option}})}
          />
        </Col>
        <Col></Col>
      </Row>
    );
  }
}