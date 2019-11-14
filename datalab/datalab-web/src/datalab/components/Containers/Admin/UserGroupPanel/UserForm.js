import React, { Component } from 'react';
import { FormGroup, FormControl, Form, Col, Alert } from 'react-bootstrap';
import PropTypes from 'prop-types';
import Select from 'react-select';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';
import LoadingPage from '../../../LoadingPage';
import { formConstants } from '../../../../constants/form';
import { adminConstants } from '../../../../constants/admin';
import actions from '../../../../actions';
import { validatedSubmit, handleInputByName } from '../../../../helper';

class UserForm extends Component {
  static propTypes = {
    failureMessage: PropTypes.string,
    changeUserSettings: PropTypes.object,
    formMode: PropTypes.string,
    dispatch: PropTypes.func,
    groupSettings: PropTypes.array,
    userSettings: PropTypes.array,
    match: PropTypes.object,
    history: PropTypes.object
  }

  constructor(props) {
    super(props);
    const { dispatch } = this.props;
    dispatch(actions.fetchResource(adminConstants.GET_GROUP_SETTINGS_REQUEST))

    const { params } = this.props.match
    const { id } = params
    if (id) {
      dispatch(actions.fetchResource(adminConstants.GET_USER_SETTINGS_REQUEST))
    }

    this.authOptions = [
      { value: 'Database', label: 'Database' },
      { value: 'LDAP', label: 'LDAP' }
    ]

    this.state = {
      id: id,
      username: '',
      authType: 'Database',
      password: '',
      group: '',
      namespace: '',
      loaded: false,
      validated: '',
      failureMessage: ''
    };
  }

  handleSubmit = () => {
    const { dispatch } = this.props;
    const userSetting = {
      ID: parseInt(this.state.id),
      Username: this.state.username,
      AuthType: this.state.authType,
      Password: this.state.password,
      Group: this.state.group,
      Namespace: this.state.namespace,
    }
    dispatch(actions.executeResourceAction(
      this.props.formMode == formConstants.EDIT_MODE ?
        adminConstants.UPDATE_USER_SETTING_REQUEST :
        adminConstants.ADD_USER_SETTING_REQUEST
      ,
      userSetting))
  }

  componentDidUpdate(prevProps) {
    const userSettings = this.props.userSettings
    const prevUserSettings = prevProps.userSettings
    let failureMessage = this.props.failureMessage
    const { action, failure, message } = this.props.changeUserSettings
    if (action) {
      const { dispatch } = this.props;
      dispatch(actions.clearResourceAction(adminConstants.CLEAR_ADMIN_REQUEST))
      if (!failure) {
        this.props.history.push('/usergroup/user')
      } else {
        this.setState({
          failureMessage: message
        })
      }
    }

    if (this.state.id) {
      if (userSettings != prevUserSettings) {
        const filterUsers = userSettings.filter(user => user['ID'] == this.state.id)
        if (filterUsers.length == 1) {
          const user = filterUsers[0]
          this.setState({
            username: user['Username'],
            authType: user['AuthType'],
            password: user['Password'],
            group: user['Group'],
            namespace: user['Namespace']
          })
        } else {
          failureMessage = failureMessage || `Cloud not find user #${this.state.id}`
        }
        this.setState({
          loaded: true,
          failureMessage: failureMessage
        })
      }
    } else {
      // Avoid always do setState, it lead to infinite loop
      if (!this.state.loaded) {
        this.setState({
          loaded: true,
          failureMessage: failureMessage
        })
      }
    }
  }

  render() {
    if (this.state.loaded) {
      const editMode = this.props.formMode == formConstants.EDIT_MODE ? true : false
      const message = `${this.props.formMode} User ${this.state.id ? ':' + this.state.username : ''}`
      const { groupSettings } = this.props
      const groupOptions = groupSettings.map(group => { return { value: group['Name'], label: group['Name'] } })
      const authOption = { value: this.state.authType, label: this.state.authType }
      const groupOption = this.state.group ? { value: this.state.group, label: this.state.group } : undefined
      return (
        <div className="main-context">
          {
            this.state.failureMessage ?
              <Alert dismissible variant="danger" className="alert_message">
                Backend error: {this.state.failureMessage}
              </Alert>
              : ''
          }
          <div className="title-7-panel mb-3">{message}</div>
          <form onSubmit={validatedSubmit(this, this.handleSubmit)} className={`needs-validation ${this.state.validated}`} noValidate>
            <Form.Row>
              <Col>
                <FormGroup controlId="username">
                  <Form.Label className="new-datalab-sub-title">Username</Form.Label>
                  <FormControl
                    name="username"
                    autoFocus
                    type="text"
                    disabled={editMode}
                    value={this.state.username}
                    onChange={handleInputByName(this)}
                    placeholder="username"
                    required
                  />
                  <div className="invalid-feedback">
                    Please provide a username.
                  </div>
                </FormGroup>
                <FormGroup controlId="formGridAuthType">
                  <Form.Label className="new-datalab-sub-title">AuthType</Form.Label>
                  <Select
                    onChange={(selected) => {
                      this.setState({ authType: selected.value });
                    }}
                    className="select-form"
                    value={authOption}
                    options={this.authOptions}
                  />
                </FormGroup>
              </Col>
              <Col>
                <FormGroup controlId="password">
                  <Form.Label className="new-datalab-sub-title">Password</Form.Label>
                  <FormControl
                    name="password"
                    value={this.state.password}
                    onChange={handleInputByName(this)}
                    type="password"
                    placeholder="Password"
                    autoComplete="password"
                  />
                  <div className="invalid-feedback">
                  </div>
                </FormGroup>
                <Form.Group controlId="formGridNamespace">
                  <Form.Label className="new-datalab-sub-title">Namespace</Form.Label>
                  <Form.Control
                    name="namespace"
                    type="text"
                    required
                    value={this.state.namespace}
                    onChange={handleInputByName(this)}
                    placeholder="User namespace" />
                </Form.Group>
              </Col>
              <Col>
                <Form.Group controlId="formGridGroup">
                  <Form.Label className="new-datalab-sub-title">Group</Form.Label>
                  <Select
                    onChange={(selected) => {
                      this.setState({ group: selected.value });
                    }}
                    className="select-form"
                    value={groupOption}
                    options={groupOptions}
                  />
                </Form.Group>
              </Col>
            </Form.Row>
            <div className="form-actions">
              <button className="submit-button">{this.props.formMode}</button>
              <button onClick={(e) => {
                e.preventDefault()
                window.history.back()
              }} className="discard-button">Discard</button>
            </div>
          </form>
        </div >
      )
    } else {
      return (
        <div className="main-context"><LoadingPage /></div>
      )
    }
  }
}

export default withRouter(connect((state) => {
  return {
    groupSettings: state.groupSettings.groupSettings,
    userSettings: state.userSettings.userSettings,
    changeUserSettings: state.changeUserSettings,
    failureMessage: state.userSettings.failure ? state.userSettings.message : '' +
      state.groupSettings.failure ? state.groupSettings.message : ''
  }
})(UserForm))
