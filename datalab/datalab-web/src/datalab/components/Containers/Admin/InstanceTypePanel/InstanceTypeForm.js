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
import PermissionEditor from '../../../PermissionEditor'
import TagsInput from '../../../TagsInput'
import { validatedSubmit, handleInputByName } from '../../../../helper';

class InstanceTypeForm extends Component {
  static propTypes = {
    failureMessage: PropTypes.string,
    changeInstanceTypeSettings: PropTypes.object,
    formMode: PropTypes.string,
    dispatch: PropTypes.func,
    instanceTypeGroupSettings: PropTypes.array,
    instanceTypeSettings: PropTypes.array,
    userSettings: PropTypes.array,
    groupSettings: PropTypes.array,
    match: PropTypes.object,
    history: PropTypes.object
  }

  constructor(props) {
    super(props);
    const { dispatch } = this.props;
    dispatch(actions.fetchResource(adminConstants.GET_INSTANCE_TYPE_GROUP_SETTINGS_REQUEST))
    dispatch(actions.fetchResource(adminConstants.GET_USER_SETTINGS_REQUEST))
    dispatch(actions.fetchResource(adminConstants.GET_GROUP_SETTINGS_REQUEST))

    const { params } = this.props.match
    const { id } = params
    if (id) {
      dispatch(actions.fetchResource(adminConstants.GET_INSTANCE_TYPE_SETTINGS_REQUEST))
    }

    this.authOptions = [
      { value: 'Database', label: 'Database' },
      { value: 'LDAP', label: 'LDAP' }
    ]

    this.state = {
      id: id,
      name: '',
      description: '',
      group: '',
      cpu: 0,
      gpu: 0,
      memory: 0,
      memoryScale: 'MiB',
      accessibleUsers: [],
      accessibleGroups: [],
      tags: {},
      public: true,
      loaded: false,
      validated: '',
      failureMessage: ''
    };
  }

  handleTagInput = (tags) => {
    this.setState({
      tags: tags
    })
  }

  handleSubmit = () => {
    const { dispatch } = this.props;
    const instanceType = {
      ID: parseInt(this.state.id),
      Name: this.state.name,
      Description: this.state.description,
      Group: this.state.group,
      CPU: parseFloat(this.state.cpu),
      GPU: parseInt(this.state.gpu),
      Memory: parseInt(this.state.memory),
      MemoryScale: this.state.memoryScale,
      AccessibleUsers: this.state.accessibleUsers,
      AccessibleGroups: this.state.accessibleGroups,
      Tags: this.state.tags,
      Public: this.state.public,
    }
    dispatch(actions.executeResourceAction(
      this.props.formMode == formConstants.EDIT_MODE ?
        adminConstants.UPDATE_INSTANCE_TYPE_SETTING_REQUEST :
        adminConstants.ADD_INSTANCE_TYPE_SETTING_REQUEST
      ,
      instanceType))
  }

  componentDidUpdate(prevProps) {
    const instanceTypeSettings = this.props.instanceTypeSettings
    const prevInstanceTypeSettings = prevProps.instanceTypeSettings
    let failureMessage = this.props.failureMessage
    const { action, failure, message } = this.props.changeInstanceTypeSettings
    if (action) {
      const { dispatch } = this.props;
      dispatch(actions.clearResourceAction(adminConstants.CLEAR_ADMIN_REQUEST))
      if (!failure) {
        this.props.history.push('/instancetype')
      } else {
        this.setState({
          failureMessage: message
        })
      }
    }

    if (this.state.id) {
      if (instanceTypeSettings != prevInstanceTypeSettings) {
        const filterInstanceTypeSettings = instanceTypeSettings.filter(user => user['ID'] == this.state.id)
        if (filterInstanceTypeSettings.length == 1) {
          const instanceType = filterInstanceTypeSettings[0]
          this.setState({
            name: instanceType['Name'],
            description: instanceType['Description'],
            group: instanceType['Group'],
            cpu: instanceType['CPU'],
            gpu: instanceType['GPU'],
            memory: instanceType['Memory'],
            memoryScale: instanceType['MemoryScale'],
            accessibleUsers: instanceType['AccessibleUsers'],
            accessibleGroups: instanceType['AccessibleGroups'],
            tags: instanceType['Tags'],
            public: instanceType['Public'],
          })
        } else {
          failureMessage = failureMessage || `Cloud not find instanceType #${this.state.id}`
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

  handleMultiSelect = (stateKey) => {
    return (newValue) => {
      this.setState({
        [stateKey]: newValue.map(option => option.value)
      })
    }
  }

  render() {
    if (this.state.loaded) {
      const editMode = this.props.formMode == formConstants.EDIT_MODE ? true : false
      const message = `${this.props.formMode} Type ${this.state.id ? ': ' + this.state.name : ''}`
      const { instanceTypeGroupSettings } = this.props
      const { userSettings, groupSettings } = this.props
      const groupOptions = instanceTypeGroupSettings.map(group => { return { value: group['Name'], label: group['Name'] } })
      const groupOption = this.state.group ? { value: this.state.group, label: this.state.group } : undefined
      const scaleOptions = [
        { label: 'MiB', value: 'MiB' },
        { label: 'GiB', value: 'GiB' }
      ]
      const scaleOption = this.state.memoryScale ?
        { value: this.state.memoryScale, label: this.state.memoryScale } :
        scaleOptions[0]

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
                  <Form.Label className="new-datalab-sub-title">Name</Form.Label>
                  <FormControl
                    name="name"
                    autoFocus
                    type="text"
                    disabled={editMode}
                    value={this.state.name}
                    onChange={handleInputByName(this)}
                    placeholder="Instance type name"
                    required
                  />
                  <div className="invalid-feedback">
                    Please provide a Name.
                  </div>
                </FormGroup>
                <FormGroup controlId="cpu">
                  <Form.Label className="new-datalab-sub-title">CPU</Form.Label>
                  <FormControl
                    name="cpu"
                    autoFocus
                    type="text"
                    value={this.state.cpu}
                    onChange={handleInputByName(this)}
                    placeholder="#cpu"
                    pattern="([0-9]\.|[1-9])([0-9]{0,3})?"
                    required
                  />
                  <div className="invalid-feedback">
                    Please provide a number.
                  </div>
                </FormGroup>
                <FormGroup controlId="memory">
                  <Form.Label className="new-datalab-sub-title">Memory</Form.Label>
                  <FormControl
                    name="memory"
                    autoFocus
                    type="text"
                    value={this.state.memory}
                    onChange={handleInputByName(this)}
                    placeholder="#memory"
                    pattern="[1-9][0-9]{0,3}"
                    required
                  />
                  <div className="invalid-feedback">
                    Please provide a number.
                  </div>
                </FormGroup>
              </Col>
              <Col>
                <FormGroup controlId="description">
                  <Form.Label className="new-datalab-sub-title">Description</Form.Label>
                  <FormControl
                    name="description"
                    autoFocus
                    type="text"
                    value={this.state.description}
                    onChange={handleInputByName(this)}
                  />
                </FormGroup>
                <FormGroup controlId="gpu">
                  <Form.Label className="new-datalab-sub-title">GPU</Form.Label>
                  <FormControl
                    name="gpu"
                    autoFocus
                    type="text"
                    value={this.state.gpu}
                    onChange={handleInputByName(this)}
                    placeholder="#gpu"
                    pattern="[0-9][0-9]{0,3}"
                    required
                  />
                  <div className="invalid-feedback">
                    Please provide a number.
                  </div>
                </FormGroup>
                <Form.Group controlId="formGridGroup">
                  <Form.Label className="new-datalab-sub-title">MemoryScale</Form.Label>
                  <Select
                    onChange={(selected) => {
                      this.setState({ memoryScale: selected.value });
                    }}
                    className="select-form"
                    value={scaleOption}
                    options={scaleOptions}
                  />
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
            <div>
              <Form.Label className="new-datalab-sub-title">Tags
                <span className="faas-optional">optional</span>
              </Form.Label>
              <TagsInput tags={this.state.tags}
                onChange={this.handleTagInput} />
            </div>
            <FormGroup controlId="permissionCheckBox">
              <Form.Check
                inline
                className="checkbox check-box-h"
                label="Make it public"
                type='checkbox'
                checked={this.state.public}
                onChange={handleInputByName(this)}
                name="public" />
              <div className="invalid-feedback">
              </div>
            </FormGroup>
            <FormGroup controlId="permission" className={this.state.public ? 'd-none' : ''}>
              <PermissionEditor
                users={this.state.accessibleUsers}
                groups={this.state.accessibleGroups}
                onUserChange={this.handleMultiSelect('accessibleUsers')}
                onGroupChange={this.handleMultiSelect('accessibleGroups')}
                userOptions={userSettings.map(user => user['Username'])}
                groupOptions={groupSettings.map(group => group['Name'])}
              />
            </FormGroup>
            <div className="form-actions">
              <button className="submit-button">{this.props.formMode}</button>
              <button onClick={(e) => {
                e.preventDefault()
                window.history.back()
              }} className="discard-button">Discard</button>
            </div>
          </form>
        </div>
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
    instanceTypeGroupSettings: state.instanceTypeGroupSettings.instanceTypeGroupSettings,
    instanceTypeSettings: state.instanceTypeSettings.instanceTypeSettings,
    changeInstanceTypeSettings: state.changeInstanceTypeSettings,
    groupSettings: state.groupSettings.groupSettings,
    userSettings: state.userSettings.userSettings,
    failureMessage: state.userSettings.failure ? state.userSettings.message : '' +
      state.groupSettings.failure ? state.groupSettings.message : ''
  }
})(InstanceTypeForm))
