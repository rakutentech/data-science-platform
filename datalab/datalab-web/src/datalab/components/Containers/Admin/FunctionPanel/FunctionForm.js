import React, { Component } from 'react';
import { FormGroup, FormControl, Form, Col, Alert } from 'react-bootstrap';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';
import LoadingPage from '../../../LoadingPage';
import Select from 'react-select';
import { formConstants } from '../../../../constants/form';
import { adminConstants } from '../../../../constants/admin';
import actions from '../../../../actions';
import { validatedSubmit, handleInputByName, handleCodeEditorByName } from '../../../../helper';
import CodeEditor from '../../../CodeEditor'
import PermissionEditor from '../../../PermissionEditor'

class FunctionForm extends Component {
  static propTypes = {
    failureMessage: PropTypes.string,
    changeFunctionSettings: PropTypes.object,
    formMode: PropTypes.string,
    dispatch: PropTypes.func,
    functionSettings: PropTypes.array,
    userSettings: PropTypes.array,
    groupSettings: PropTypes.array,
    match: PropTypes.object,
    history: PropTypes.object
  }

  constructor(props) {
    super(props);
    const { dispatch } = this.props
    const { params } = this.props.match
    const { id } = params
    if (id) {
      dispatch(actions.fetchResource(adminConstants.GET_FUNCTION_SETTINGS_REQUEST))
    }

    dispatch(actions.fetchResource(adminConstants.GET_USER_SETTINGS_REQUEST))
    dispatch(actions.fetchResource(adminConstants.GET_GROUP_SETTINGS_REQUEST))

    this.state = {
      id: id,
      name: '',
      loadBalancer: '',
      description: '',
      trigger: 'http',
      programLanguage: '',
      defaultFunction: '',
      defaultRequirement: '',
      deploymentTemplate: '',
      serviceTemplate: '',
      ingressTemplate: '',
      jobTemplate: '',
      public: true,
      accessibleUsers: [],
      accessibleGroups: [],
      loaded: id === undefined,
      validated: '',
      failureMessage: ''
    };
  }

  handleSubmit = () => {
    const { dispatch } = this.props;
    const functionSetting = {
      ID: parseInt(this.state.id),
      Name: this.state.name,
      LoadBalancer: this.state.loadBalancer,
      Description: this.state.description,
      Trigger: this.state.trigger,
      DefaultFunction: this.state.defaultFunction,
      DefaultRequirement: this.state.defaultRequirement,
      ProgramLanguage: this.state.programLanguage,
      DeploymentTemplate: this.state.deploymentTemplate,
      ServiceTemplate: this.state.serviceTemplate,
      IngressTemplate: this.state.ingressTemplate,
      JobTemplate: this.state.jobTemplate,
      Public: this.state.public,
      AccessibleUsers: this.state.accessibleUsers,
      AccessibleGroups: this.state.accessibleGroups,
    }
    dispatch(actions.executeResourceAction(
      this.props.formMode == formConstants.EDIT_MODE ?
        adminConstants.UPDATE_FUNCTION_SETTING_REQUEST :
        adminConstants.ADD_FUNCTION_SETTING_REQUEST
      ,
      functionSetting))
  }

  isEventTrigger = () => { return this.state.trigger == formConstants.EVENT_TRIGGER }

  handleMultiSelect = (stateKey) => {
    return (newValue) => {
      this.setState({
        [stateKey]: newValue.map(option => option.value)
      })
    }
  }

  componentDidUpdate(prevProps) {
    const functionSettings = this.props.functionSettings
    const prevFunctionSettings = prevProps.functionSettings
    let failureMessage = this.props.failureMessage
    const { action, failure, message } = this.props.changeFunctionSettings
    if (action) {
      const { dispatch } = this.props;
      dispatch(actions.clearResourceAction(adminConstants.CLEAR_ADMIN_REQUEST))
      if (!failure) {
        this.props.history.push('/function')
      } else {
        this.setState({
          failureMessage: message
        })
      }
    }
    if (this.state.id) {
      if (functionSettings != prevFunctionSettings) {
        const filterFunctions = functionSettings.filter(user => user['ID'] == this.state.id)
        if (filterFunctions.length == 1) {
          const _function = filterFunctions[0]
          this.setState({
            name: _function['Name'],
            loadBalancer: _function['LoadBalancer'],
            description: _function['Description'],
            trigger: _function['Trigger'],
            defaultFunction: _function['DefaultFunction'],
            defaultRequirement: _function['DefaultRequirement'],
            programLanguage: _function['ProgramLanguage'],
            deploymentTemplate: _function['DeploymentTemplate'],
            serviceTemplate: _function['ServiceTemplate'],
            ingressTemplate: _function['IngressTemplate'],
            jobTemplate: _function['JobTemplate'],
            public: _function['Public'],
            accessibleUsers: _function['AccessibleUsers'],
            accessibleGroups: _function['AccessibleGroups'],
          })
        } else {
          failureMessage = failureMessage || `Cloud not find Function #${this.state.id}`
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
      const message = `${this.props.formMode} Function ${this.state.id ? ':' + this.state.name : ''}`
      const { userSettings, groupSettings } = this.props
      const triggerOptions = [
        { label: 'HTTP (HTTP Endpoint Trigger)', value: formConstants.HTTP_TRIGGER },
        { label: 'Event (Restful API Trigger)', value: formConstants.EVENT_TRIGGER }
      ]
      const triggerOption = {
        value: this.state.trigger,
        label: triggerOptions.filter(trigger => trigger.value == this.state.trigger)[0].label
      }
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
                <FormGroup controlId="name">
                  <Form.Label className="new-datalab-sub-title">Give the function a name</Form.Label>
                  <FormControl
                    name="name"
                    autoFocus
                    type="text"
                    disabled={editMode}
                    value={this.state.name}
                    onChange={handleInputByName(this)}
                    placeholder="function name"
                    required
                  />
                  <div className="invalid-feedback">
                    Please provide a name.
                  </div>
                </FormGroup>
                <FormGroup controlId="loadBalancer" className={this.isEventTrigger() ? 'd-none' : ''}>
                  <Form.Label className="new-datalab-sub-title">LoadBalancer</Form.Label>
                  <FormControl
                    name="loadBalancer"
                    autoFocus
                    type="text"
                    value={this.state.loadBalancer}
                    onChange={handleInputByName(this)}
                    placeholder="http://"
                  />
                  <div className="invalid-feedback">
                    Please provide a load balancer.
                  </div>
                </FormGroup>

              </Col>
              <Col className="ml-2 mr-2">
                <FormGroup controlId="programLanguage">
                  <Form.Label className="new-datalab-sub-title">Language</Form.Label>
                  <FormControl
                    name="programLanguage"
                    autoFocus
                    type="text"
                    value={this.state.programLanguage}
                    onChange={handleInputByName(this)}
                    placeholder="python"
                    required
                  />
                  <div className="invalid-feedback">
                    Please provide a program language of brace.
                  </div>
                </FormGroup>
                <FormGroup controlId="loadBalancer">
                  <Form.Label className="new-datalab-sub-title">Trigger</Form.Label>
                  <Select
                    onChange={(selected) => {
                      this.setState({ trigger: selected.value });
                    }}
                    className="select-form"
                    value={triggerOption}
                    options={triggerOptions}
                  />
                  <div className="invalid-feedback">
                    Please provide a trigger.
                  </div>
                </FormGroup>
              </Col>
              <Col>
                <FormGroup controlId="description">
                  <Form.Label className="new-datalab-sub-title">Description</Form.Label>
                  <FormControl
                    name="description"
                    value={this.state.description}
                    onChange={handleInputByName(this)}
                    as="textarea"
                    style={{ height: '400px' }}
                    placeholder="Add some description"
                  />
                  <div className="invalid-feedback">
                  </div>
                </FormGroup>
              </Col>
            </Form.Row>
            <Form.Row>
              <Col>
                <FormGroup controlId="defaultFunction">
                  <Form.Label className="new-datalab-sub-title">Default Function</Form.Label>
                  <CodeEditor
                    mode="text"
                    rows={10}
                    value={this.state.defaultFunction}
                    width="100%"
                    onChange={handleCodeEditorByName(this, 'defaultFunction')}
                    name="defaultFunction"
                  />
                  <div className="invalid-feedback">
                  </div>
                </FormGroup>
              </Col>
              <Col>
                <FormGroup controlId="defaultRequirement">
                  <Form.Label className="new-datalab-sub-title">Default Requirement</Form.Label>
                  <CodeEditor
                    mode="text"
                    rows={10}
                    value={this.state.defaultRequirement}
                    width="100%"
                    onChange={handleCodeEditorByName(this, 'defaultRequirement')}
                    name="defaultRequirements"
                  />
                  <div className="invalid-feedback">
                  </div>
                </FormGroup>
              </Col>
            </Form.Row>
            <Form.Row>
              <Col className={this.isEventTrigger() ? 'd-none' : ''}>
                <FormGroup controlId="deploymentTemplate">
                  <Form.Label className="new-datalab-sub-title">Deployment Template</Form.Label>
                  <CodeEditor
                    mode="yaml"
                    rows={10}
                    value={this.state.deploymentTemplate}
                    width="100%"
                    onChange={handleCodeEditorByName(this, 'deploymentTemplate')}
                    name="deploymentTemplate"
                  />
                  <div className="invalid-feedback">
                  </div>
                </FormGroup>
              </Col>
              <Col className={this.isEventTrigger() ? 'd-none' : ''}>
                <FormGroup controlId="serviceTemplate">
                  <Form.Label className="new-datalab-sub-title">Service Template</Form.Label>
                  <CodeEditor
                    mode="yaml"
                    rows={10}
                    value={this.state.serviceTemplate}
                    width="100%"
                    onChange={handleCodeEditorByName(this, 'serviceTemplate')}
                    name="serviceTemplate"
                  />
                  <div className="invalid-feedback">
                  </div>
                </FormGroup>
              </Col>
              <Col className={this.isEventTrigger() ? 'd-none' : ''}>
                <FormGroup controlId="ingressTemplate">
                  <Form.Label className="new-datalab-sub-title">Ingress Template</Form.Label>
                  <CodeEditor
                    mode="yaml"
                    rows={10}
                    value={this.state.ingressTemplate}
                    width="100%"
                    onChange={handleCodeEditorByName(this, 'ingressTemplate')}
                    name="ingressTemplate"
                  />
                  <div className="invalid-feedback">
                  </div>
                </FormGroup>
              </Col>
              <Col className={!this.isEventTrigger() ? 'd-none' : ''}>
                <FormGroup controlId="jobTemplate">
                  <Form.Label className="new-datalab-sub-title">Job Template</Form.Label>
                  <CodeEditor
                    mode="yaml"
                    rows={10}
                    value={this.state.jobTemplate}
                    width="100%"
                    onChange={handleCodeEditorByName(this, 'jobTemplate')}
                    name="jobTemplate"
                  />
                  <div className="invalid-feedback">
                  </div>
                </FormGroup>
              </Col>
            </Form.Row>
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
    functionSettings: state.functionSettings.functionSettings,
    groupSettings: state.groupSettings.groupSettings,
    userSettings: state.userSettings.userSettings,
    changeFunctionSettings: state.changeFunctionSettings,
    failureMessage: state.functionSettings.failure ? state.functionSettings.message : ''
  }
})(FunctionForm))
