import React, { Component } from 'react';
import { FormGroup, FormControl, Form, Col, Alert } from 'react-bootstrap';
import PropTypes from 'prop-types';
import { handleInputByName } from '../../helper';

class GroupForm extends Component {
  static propTypes = {
    failureMessage: PropTypes.string,
    onAdd: PropTypes.func,
    onUpdate: PropTypes.func,
    onDelete: PropTypes.func,
    groupSettings: PropTypes.array
  }

  constructor(props) {
    super(props);
    this.initState = {
      newGroupName: '',
      groupName: '',
      selectedID: 0,
      failureMessage: ''
    }
    this.state = this.initState
  }
  componentDidUpdate() {
    if (this.props.failureMessage) {
      this.setState({
        failureMessage: this.props.failureMessage
      })
    }
  }

  render() {
    const { groupSettings } = this.props
    return (
      <div className="">
        {
          this.state.failureMessage ?
            <Alert dismissible variant="danger" className="alert_message">
              Backend error: {this.state.failureMessage}
            </Alert>
            : ''
        }
        <h2 className="mb-2">Groups</h2>
        <div className="mb-1">
          {groupSettings.map(group => {
            return (<Form.Row key={group.Name}>
              <Col md={8}>
                <FormGroup controlId="groupName">
                  {
                    group.ID != this.state.selectedID ?
                      <div className="modal__item">{group.Name}</div>
                      :
                      <FormGroup controlId="groupName">
                        <FormControl
                          name="groupName"
                          autoFocus
                          type="text"
                          value={this.state.groupName}
                          onChange={handleInputByName(this)}
                          placeholder="New instance group"
                        />
                      </FormGroup>
                  }
                </FormGroup>
              </Col>
              <Col md={4}>
                <FormGroup controlId="groupName">
                  {
                    group.ID != this.state.selectedID ?
                      <button className="modal-button__normal" onClick={() => {
                        this.setState(this.initState)
                        this.setState({
                          selectedID: group.ID,
                          groupName: group.Name
                        }
                        )
                      }}>Edit</button>
                      :
                      <button className="modal-button__normal" onClick={() => {
                        this.setState(this.initState)
                        this.props.onUpdate(group.ID, this.state.groupName)
                        this.setState({
                          selectedID: -1,
                          groupName: ''
                        })
                      }}>Save</button>
                  }
                  <button className="modal-button__delete" onClick={() => {
                    this.setState(this.initState)
                    this.props.onDelete(group.ID)
                  }}>Delete</button>
                </FormGroup>
              </Col>
            </Form.Row>)
          }
          )}
        </div>
        <h2 className="mb-2">New Group</h2>
        <Form.Row>
          <Col md={8}>
            <FormGroup controlId="newGroupName">
              <FormControl
                name="newGroupName"
                autoFocus
                type="text"
                value={this.state.newGroupName}
                onChange={handleInputByName(this)}
                placeholder="New instance group"
              />
            </FormGroup>
          </Col>
          <Col md={4}><button className="add-gray-button" onClick={() => {
            this.setState(this.initState)
            this.props.onAdd(this.state.newGroupName)
          }}>Add</button></Col>
        </Form.Row>
        <div className="form-actions">
        </div>
      </div>
    )
  }
}

export default GroupForm
