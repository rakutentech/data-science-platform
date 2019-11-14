import React, { Component } from 'react';
import { FormGroup, FormControl, Form, Col, Alert } from 'react-bootstrap';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';
import Select from 'react-select';
import LoadingPage from '../../../LoadingPage';
import { formConstants } from '../../../../constants/form';
import { adminConstants } from '../../../../constants/admin';
import actions from '../../../../actions';
import { validatedSubmit, handleInputByName, handleCodeEditorByName } from '../../../../helper';
import CodeEditor from '../../../CodeEditor'
import PermissionEditor from '../../../PermissionEditor'

class DataLabForm extends Component {
  static propTypes = {
    failureMessage: PropTypes.string,
    changeDataLabSettings: PropTypes.object,
    formMode: PropTypes.string,
    dispatch: PropTypes.func,
    dataLabSettings: PropTypes.array,
    userSettings: PropTypes.array,
    groupSettings: PropTypes.array,
    dataLabGroupSettings: PropTypes.array,
    match: PropTypes.object,
    history: PropTypes.object
  }

  constructor(props) {
    super(props);
    const { dispatch } = this.props
    const { params } = this.props.match
    const { id } = params
    if (id) {
      dispatch(actions.executeResourceAction(adminConstants.GET_DATALAB_SETTINGS_REQUEST))
    }

    dispatch(actions.executeResourceAction(adminConstants.GET_USER_SETTINGS_REQUEST))
    dispatch(actions.executeResourceAction(adminConstants.GET_GROUP_SETTINGS_REQUEST))
    dispatch(actions.executeResourceAction(adminConstants.GET_DATALAB_GROUP_SETTINGS_REQUEST))

    this.state = {
      id: id,
      name: '',
      group: '',
      loadBalancer: '',
      description: '',
      deploymentTemplate: '',
      serviceTemplate: '',
      ingressTemplate: '',
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
    const dataLabSetting = {
      ID: parseInt(this.state.id),
      Name: this.state.name,
      LoadBalancer: this.state.loadBalancer,
      Group: this.state.group,
      Description: this.state.description,
      DeploymentTemplate: this.state.deploymentTemplate,
      ServiceTemplate: this.state.serviceTemplate,
      IngressTemplate: this.state.ingressTemplate,
      Public: this.state.public,
      AccessibleUsers: this.state.accessibleUsers,
      AccessibleGroups: this.state.accessibleGroups,
    }
    dispatch(actions.executeResourceAction(
      this.props.formMode == formConstants.EDIT_MODE ?
        adminConstants.UPDATE_DATALAB_SETTING_REQUEST :
        adminConstants.ADD_DATALAB_SETTING_REQUEST
      ,
      dataLabSetting))
  }


  handleMultiSelect = (stateKey) => {
    return (newValue) => {
      this.setState({
        [stateKey]: newValue.map(option => option.value)
      })
    }
  }

  componentDidUpdate(prevProps) {
    const dataLabSettings = this.props.dataLabSettings
    const prevDataLabSettings = prevProps.dataLabSettings
    let failureMessage = this.props.failureMessage
    const { action, failure, message } = this.props.changeDataLabSettings
    if (action) {
      const { dispatch } = this.props;
      dispatch(actions.clearResourceAction(adminConstants.CLEAR_ADMIN_REQUEST))
      if (!failure) {
        this.props.history.push('/datalab')
      } else {
        this.setState({
          failureMessage: message
        })
      }
    }
    if (this.state.id) {
      if (dataLabSettings != prevDataLabSettings) {
        const filterDataLabs = dataLabSettings.filter(user => user['ID'] == this.state.id)
        if (filterDataLabs.length == 1) {
          const dataLab = filterDataLabs[0]
          this.setState({
            name: dataLab['Name'],
            loadBalancer: dataLab['LoadBalancer'],
            group: dataLab['Group'],
            description: dataLab['Description'],
            deploymentTemplate: dataLab['DeploymentTemplate'],
            serviceTemplate: dataLab['ServiceTemplate'],
            ingressTemplate: dataLab['IngressTemplate'],
            public: dataLab['Public'],
            accessibleUsers: dataLab['AccessibleUsers'],
            accessibleGroups: dataLab['AccessibleGroups'],
          })
        } else {
          failureMessage = failureMessage || `Cloud not find DataLab #${this.state.id}`
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
      const message = `${this.props.formMode} DataLab ${this.state.id ? ':' + this.state.name : ''}`
      const editMode = this.props.formMode == formConstants.EDIT_MODE ? true : false
      const { userSettings, groupSettings, dataLabGroupSettings } = this.props
      const groupOptions = dataLabGroupSettings.map(group => { return { value: group['Name'], label: group['Name'] } })
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
                <FormGroup controlId="name">
                  <Form.Label className="new-datalab-sub-title">Give the lab a name</Form.Label>
                  <FormControl
                    name="name"
                    autoFocus
                    type="text"
                    value={this.state.name}
                    onChange={handleInputByName(this)}
                    placeholder="lab name"
                    disabled={editMode}
                    required
                  />
                  <div className="invalid-feedback">
                    Please provide a name.
                  </div>
                </FormGroup>
                <FormGroup controlId="formGridAuthType">
                  <Form.Label className="new-datalab-sub-title">Group</Form.Label>
                  <Select
                    onChange={(selected) => {
                      this.setState({ group: selected.value });
                    }}
                    className="select-form"
                    value={groupOption}
                    options={groupOptions}
                  />
                </FormGroup>
                <FormGroup controlId="loadBalancer">
                  <Form.Label className="new-datalab-sub-title">LoadBalancer</Form.Label>
                  <FormControl
                    name="loadBalancer"
                    autoFocus
                    type="text"
                    value={this.state.loadBalancer}
                    onChange={handleInputByName(this)}
                    placeholder="http://"
                    required
                  />
                  <div className="invalid-feedback">
                    Please provide a load balancer.
                  </div>
                </FormGroup>
              </Col>
              <Col className="ml-2 mr-2">
                <FormGroup controlId="description">
                  <Form.Label className="new-datalab-sub-title">Description</Form.Label>
                  <FormControl
                    name="description"
                    value={this.state.description}
                    onChange={handleInputByName(this)}
                    as="textarea"
                    style={{ height: '194px' }}
                    placeholder="Add some description"
                  />
                  <div className="invalid-feedback">
                  </div>
                </FormGroup>
              </Col>
              <Col>
              </Col>
            </Form.Row>
            <Form.Row>
              <Col>
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
              <Col className="ml-2 mr-2">
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
              <Col>
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
            </Form.Row>
            <FormGroup controlId="password">
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
    dataLabSettings: state.dataLabSettings.dataLabSettings,
    dataLabGroupSettings: state.dataLabGroupSettings.dataLabGroupSettings,
    groupSettings: state.groupSettings.groupSettings,
    userSettings: state.userSettings.userSettings,
    changeDataLabSettings: state.changeDataLabSettings,
    failureMessage: state.dataLabSettings.failure ? state.dataLabSettings.message : ''
  }
})(DataLabForm))
