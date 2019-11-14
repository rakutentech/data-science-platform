import React, { Component } from 'react';
import { FormGroup, FormControl, Form, Col, Alert } from 'react-bootstrap';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';
import Select from 'react-select';
import TagsInput from '../../../TagsInput';
import FunctionContextInput from '../../../FunctionContextInput';
import { userConstants } from '../../../../constants/app';
import actions from '../../../../actions';
import { validatedSubmit, handleInputByName } from '../../../../helper';
import { formConstants } from '../../../../constants/form';
import { iconsImages } from '../../../../constants/icons_images'

class FaaSForm extends Component {
  static propTypes = {
    changeFunctionInstances: PropTypes.object,
    dispatch: PropTypes.func,
    appFunctionSettings: PropTypes.array,
    appInstanceTypeSettings: PropTypes.array,
    history: PropTypes.object
  }

  constructor(props) {
    super(props);
    this.state = {
      validated: '',
      instanceTypeOptions: [],
      functionName: '',
      instanceName: '',
      instanceTypeName: '',
      instanceNumber: 1,
      ingressPath: '',
      contextType: formConstants.INLINE_FUNCTION,
      functionContext: {},
      programLanguage: 'text',
      trigger: formConstants.HTTP_TRIGGER,
      tags: {}
    }
  }
  handleFunctionContext = (contextType, functionContext) => {
    this.setState({
      contextType: contextType,
      functionContext: functionContext
    })
  }
  handleSubmit = () => {
    const { dispatch } = this.props;
    const data = {
      FunctionName: this.state.functionName,
      Name: this.state.instanceName,
      Trigger: this.state.trigger,
      InstanceTypeName: this.state.instanceTypeName,
      InstanceNumber: parseInt(this.state.instanceNumber),
      IngressPath: this.state.ingressPath,
      FunctionContextType: this.state.contextType,
      FunctionContext: this.state.functionContext,
      Tags: this.state.tags
    }
    dispatch(actions.executeResourceAction(userConstants.ADD_FUNCTION_INSTANCE_REQUEST, data))
  }

  handleMultiSelect = (stateKey) => {
    return (newValue) => {
      this.setState({
        [stateKey]: newValue.map(option => option.value)
      })
    }
  }

  handleTagInput = (tags) => {
    this.setState({
      tags: tags
    })
  }

  initOptions = () => {
    const { appInstanceTypeSettings } = this.props
    const instanceTypeOptions = appInstanceTypeSettings.map(instanceTypeSetting => {
      return { label: `${instanceTypeSetting.Name} (${instanceTypeSetting.Description})`, value: instanceTypeSetting.Name, group: instanceTypeSetting.Group }
    })
    const instanceTypeOption = this.state.instanceTypeName ?
      instanceTypeOptions.filter(instanceTypeSetting => instanceTypeSetting.Name == this.state.instanceTypeName)[0]
      : instanceTypeOptions[0]
    if (instanceTypeOption && this.state.instanceTypeName === '') {
      this.setState({
        instanceTypeName: instanceTypeOption.value,
        instanceTypeOptions: instanceTypeOptions
      })
    }
  }

  componentDidMount() {
    this.initOptions()
    this.initTriggerOptions(formConstants.HTTP_TRIGGER)
  }

  componentDidUpdate(prevProps) {
    this.initOptions()
    const { action, failure, message } = this.props.changeFunctionInstances
    if (action) {
      const { dispatch } = this.props;
      dispatch(actions.clearResourceAction(userConstants.CLEAR_APP_REQUEST))
      if (!failure) {
        this.props.history.push('/function')
      } else {
        this.setState({
          failureMessage: message
        })
      }
    }
    // Init trigger at first loaded
    if (prevProps.appFunctionSettings &&
      prevProps.appFunctionSettings.length != this.props.appFunctionSettings.length) {
      this.initTriggerOptions(formConstants.HTTP_TRIGGER)
    }
  }
  handleFunctionChange = (e) => {
    const { appFunctionSettings } = this.props
    const { name } = e.target;
    const value = e.target.value
    const selectedFunction = appFunctionSettings.filter(setting => setting.Name == value)[0]
    if (selectedFunction) {
      this.setState({
        [name]: value,
        programLanguage: selectedFunction.ProgramLanguage,
        functionContext: {
          Code: selectedFunction.DefaultFunction,
          Requirement: selectedFunction.DefaultRequirement
        }
      });
    }
  }

  initTriggerOptions = (trigger) => {
    const { appFunctionSettings } = this.props
    const selectedFunction = appFunctionSettings.filter(setting => setting.Trigger == trigger)[0]
    if (selectedFunction) {
      this.setState({
        trigger: trigger,
        functionName: selectedFunction.Name,
        programLanguage: selectedFunction.ProgramLanguage,
        functionContext: {
          Code: selectedFunction.DefaultFunction,
          Requirement: selectedFunction.DefaultRequirement
        }
      });
    }
  }

  handleTriggerChange = (e) => {
    this.initTriggerOptions(e.target.value)
  }

  render() {
    const { appFunctionSettings } = this.props
    const instanceTypeOption = this.state.instanceTypeName ?
      this.state.instanceTypeOptions.filter(option => option.value == this.state.instanceTypeName)[0]
      : this.state.instanceTypeOptions[0]

    let is_not_EVENT_TRIGGER = this.state.trigger != formConstants.EVENT_TRIGGER
    let temp_options = {}
    this.state.instanceTypeOptions.forEach(option => {
      if (!temp_options[option.group]) {
        temp_options[option.group] = []
      }
      temp_options[option.group].push(option)
    })
    let size_options = []
    Object.keys(temp_options).map(key => (
      size_options.push({
        label: key,
        options: temp_options[key]
      })
    ))
    return (
      <div className="datalab-body">
        {
          this.state.failureMessage ?
            <Alert dismissible variant="danger" className="alert_message">
              Backend error: {this.state.failureMessage}
            </Alert>
            : ''
        }
        <p className="title-content">Create a new instance</p>
        <p className="datalab-submessage">Choose the options below to create a new instance</p>
        <br />
        <form onSubmit={validatedSubmit(this, this.handleSubmit)} className={`needs-validation ${this.state.validated}`} noValidate>
          <Form.Row>
            <Col>
              <FormGroup>
                <h2 className="mb-2">Choose the function type</h2>
                <div>
                  <Form.Check
                    className={`datalab-radio col-md-3 ${this.state.trigger === formConstants.HTTP_TRIGGER ? 'active' : ''}`}
                    required
                    type="radio"
                    hidden
                    value={formConstants.HTTP_TRIGGER}
                    checked={this.state.trigger === formConstants.HTTP_TRIGGER}
                    onChange={this.handleTriggerChange}
                    label={
                      <div>
                        <img className="float-left" src={iconsImages.FUNC_HTTP_ICON}></img>
                        <div className="float-left ml-2">
                          <div>HTTP</div>
                          <div className="datalab-submessage">
                            HTTP Endpoint Trigger
                          </div>
                        </div>
                      </div>
                    }
                    name="trigger"
                    id={formConstants.HTTP_TRIGGER}
                  />
                  <Form.Check
                    className={`datalab-radio col-md-3 ${this.state.trigger === formConstants.EVENT_TRIGGER ? 'active' : ''}`}
                    required
                    type="radio"
                    hidden
                    value={formConstants.EVENT_TRIGGER}
                    checked={this.state.trigger === formConstants.EVENT_TRIGGER}
                    onChange={this.handleTriggerChange}
                    label={
                      <div>
                        <img className="float-left" src={iconsImages.FUNC_EVENT_ICON}></img>
                        <div className="float-left ml-2">
                          <div>Event</div>
                          <div className="datalab-submessage">
                            Restful API Trigger
                          </div>
                        </div>
                      </div>
                    }
                    name="trigger"
                    id={formConstants.EVENT_TRIGGER}
                  />
                </div>
              </FormGroup>
            </Col>
          </Form.Row>
          <Form.Row>
            <Col>
              <FormGroup controlId="functionName">
                <h2 className="mb-2">Choose the function base</h2>
                <div>
                  {appFunctionSettings
                    .filter(instance => instance.Trigger == this.state.trigger)
                    .map(instance => {
                      return <Form.Check
                        className={`datalab-radio col-md-3 ${this.state.functionName === instance.Name ? 'active' : ''}`}
                        required
                        key={instance.Name}
                        type="radio"
                        hidden
                        value={instance.Name}
                        checked={this.state.functionName === instance.Name}
                        onChange={this.handleFunctionChange}
                        label={instance.Name}
                        name="functionName"
                        id={instance.Name}
                      />
                    })}
                  <div className="invalid-feedback">
                    Please select a image.
                  </div>
                </div>
              </FormGroup>
            </Col>
          </Form.Row>
          <Form.Row>
            <Col>
              <FormGroup controlId="instanceTypeOption">
                <h2 className="mb-2">Choose a size</h2>
                <Select
                  onChange={(selected) => {
                    this.setState({ instanceTypeName: selected.value });
                  }}
                  classNamePrefix="datalab-select"
                  className="datalab-select"
                  value={instanceTypeOption}
                  options={size_options}
                />
                <div className="invalid-feedback">
                  Please provide a size.
                </div>
              </FormGroup>
            </Col>
            <Col></Col>
            <Col></Col>
          </Form.Row>
          <Form.Row>
            <Col className={is_not_EVENT_TRIGGER ? '' : 'd-none'}>
              <FormGroup controlId="instanceNumber">
                <h2 className="mb-2">#Instance</h2>
                <FormControl
                  name="instanceNumber"
                  type="text"
                  value={this.state.instanceNumber}
                  onChange={handleInputByName(this)}
                  className="datalab-input"
                  placeholder="#instance"
                  pattern="[0-9]{0,3}"
                />
                <div className="invalid-feedback">
                  Please provide a number.
                </div>
              </FormGroup>
            </Col>
            <Col className={is_not_EVENT_TRIGGER ? '' : 'd-none'}>
              <FormGroup controlId="ingressPath">
                <h2 className="mb-2">IngressPath</h2>
                <FormControl
                  name="ingressPath"
                  type="text"
                  value={this.state.ingressPath}
                  onChange={handleInputByName(this)}
                  className="datalab-input"
                  placeholder="Endiopoint: /$user/$ingressPath"
                />
                <div className="invalid-feedback">
                  Please provide a path.
                </div>
              </FormGroup>
            </Col>
            <Col>
              <FormGroup controlId="instanceName">
                <h2 className="mb-2">Give the instance a name</h2>
                <FormControl
                  name="instanceName"
                  autoFocus
                  type="text"
                  value={this.state.instanceName}
                  onChange={handleInputByName(this)}
                  className="datalab-input"
                  placeholder="instance name"
                  pattern="[a-z0-9-]{3,20}"
                  required
                />
                <div className="invalid-feedback">
                  Allow a~z,0~9 and -
                  <br />
                  Allow length: 3~20
                </div>
              </FormGroup>
            </Col>
            <Col className={is_not_EVENT_TRIGGER ? 'd-none' : ''}></Col>
            <Col className={is_not_EVENT_TRIGGER ? 'd-none' : ''}></Col>
          </Form.Row>
          <Form.Row className="mb-2 datalab-faas-form-tabs">
            <FunctionContextInput
              functionContext={this.state.functionContext}
              onChange={this.handleFunctionContext}
              programLanguage={this.state.programLanguage} />
          </Form.Row>
          <Form.Row>
            <Col>
              <h2 className="mb-2 mt-3">Tags
                <span className="faas-optional">optional</span>
              </h2>
              <Form.Row>
                <Col>
                  <div className="datalab-submessage mb-3">
                    Tags allows you to classify and search for instances based on these specific keywords.
                    You can assign multiple tags to a single instance.
                  </div>
                </Col>
                <Col>
                </Col>
              </Form.Row>
              <TagsInput tags={this.state.tags}
                onChange={this.handleTagInput} />
            </Col>
          </Form.Row>
          <div className="form-actions">
            <button className="submit-button">Create</button>
            <button onClick={(e) => {
              e.preventDefault()
              window.history.back()
            }} className="discard-button">Discard</button>
          </div>
        </form>
      </div>
    )
  }
}

export default withRouter(connect((state) => {
  return {
    changeFunctionInstances: state.changeFunctionInstances
  }
})(FaaSForm))
