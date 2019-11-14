import React, { Component } from 'react';
import PropTypes from 'prop-types';
import actions from '../../../../actions';
import { userConstants } from '../../../../constants/app';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';
import LoadingPage from '../../../LoadingPage';
import ActiveStatus from '../../../ActiveStatus';
import FunctionContextInput from '../../../FunctionContextInput';
import JobHistoryTable from './JobHistoryTable'
import { FormGroup, FormControl, Form, Col, Tabs, Tab, Alert } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { formConstants } from '../../../../constants/form';
import { handleInputByName, runningTimeMessage, validatedSubmit } from '../../../../helper';
import { iconsImages } from '../../../../constants/icons_images'
import ToolBar from '../../../ToolBar';

class FaaSDetailPanel extends Component {
  static propTypes = {
    dispatch: PropTypes.func,
    killJob: PropTypes.func,
    getJobLog: PropTypes.func,
    history: PropTypes.object,
    functionInstance: PropTypes.object,
    changeFunctionInstances: PropTypes.object,
    restartFunctionInstance: PropTypes.object,
    killJobInstance: PropTypes.object,
    functionInstanceLog: PropTypes.string,
    appInstanceTypeSettings: PropTypes.array,
    appFunctionSettings: PropTypes.array,
    jobInstances: PropTypes.array,
    jobInstanceLog: PropTypes.string,
    instanceName: PropTypes.string,
    trigger: PropTypes.string,
  }
  constructor(props) {
    super(props);
    this.state = {
      validated: '',
      failureMessage: '',
      successMessage: '',
      instanceNumber: 1,
      functionContext: {
        Code: '',
        GitBranch: '',
        GitEntrypoint: '',
        GitRepo: '',
        Requirement: '',
        ZipEntrypoint: '',
        ZipFileData: '',
        ZipFileName: '',
      },
      tabKey: 'information',
      jobInstances: [],
    }
  }

  handleAction = (state, onSuccess) => {
    const { action, failure, message } = state
    if (action) {
      const { dispatch } = this.props;
      dispatch(actions.clearResourceAction(userConstants.CLEAR_APP_REQUEST))
      if (!failure) {
        onSuccess(this, action)
      } else {
        this.setState({
          failureMessage: message
        })
      }
    }
  }
  async componentDidMount() {
    const { dispatch, instanceName, trigger } = this.props
    await dispatch(actions.fetchResourceByPath(
      userConstants.GET_FUNCTION_INSTANCE_REQUEST, `/function/instances/${trigger}/${instanceName}`))
    await dispatch(actions.fetchResourceByPath(
      userConstants.GET_FUNCTION_INSTANCE_LOG_REQUEST, `/function/instances/${trigger}/${instanceName}/log`))
    if (this.props.functionInstance.InstanceNumber && this.props.functionInstance.FunctionContext) {
      this.setState({
        instanceNumber: this.props.functionInstance.InstanceNumber,
        functionContext: this.props.functionInstance.FunctionContext,
      })
    }
  }
  componentDidUpdate(prevProps) {
    const { dispatch } = this.props
    this.handleAction(this.props.changeFunctionInstances, (obj, action) => {
      if (action.startsWith(userConstants.UPDATE_FUNCTION_INSTANCE_REQUEST)) {
        obj.setState({ successMessage: 'Instance have been updated' })
      } else {
        obj.props.history.push('/function')
      }
    })
    this.handleAction(this.props.restartFunctionInstance, (obj) => { obj.setState({ successMessage: 'Instance have been restarted' }) })
    this.handleAction(this.props.killJobInstance, () => {
      dispatch(actions.fetchResourceByPath(
        userConstants.GET_JOB_INSTANCES_REQUEST, `/function/instances/${formConstants.EVENT_TRIGGER}/${this.props.functionInstance.Name}/jobs`))
    })

    if (prevProps.functionInstance &&
      (prevProps.functionInstance.InstanceNumber != this.props.functionInstance.InstanceNumber ||
        FunctionContextInput.shouldUpdate(prevProps.functionInstance.FunctionContext, this.props.functionInstance.FunctionContext)
      )) {
      this.setState({
        instanceNumber: this.props.functionInstance.InstanceNumber,
        functionContext: this.props.functionInstance.FunctionContext,
      })
    }

    if (prevProps.functionInstance != this.props.functionInstance &&
      this.props.functionInstance.Trigger == formConstants.EVENT_TRIGGER) {
      dispatch(actions.fetchResourceByPath(
        userConstants.GET_JOB_INSTANCES_REQUEST, `/function/instances/${formConstants.EVENT_TRIGGER}/${this.props.functionInstance.Name}/jobs`))
    }
    if (this.props.jobInstances !== this.state.jobInstances) {
      this.setState({ jobInstances: this.props.jobInstances })
    }
  }
  delete = (e, id) => {
    e.preventDefault();
    e.stopPropagation();
    const { dispatch } = this.props
    if (window.confirm(`Are you want to delete #${id}`)) {
      dispatch(actions.executeResourceAction(userConstants.DELETE_FUNCTION_INSTANCE_REQUEST, {
        ID: id
      }))
    }
  }
  restart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const { dispatch, instanceName, trigger } = this.props
    dispatch(actions.executeResourceActionByPath(
      userConstants.RESTART_FUNCTION_INSTANCE_REQUEST, `/function/instances/${trigger}/${instanceName}/restart`))
    this.setState({
      'successMessage': ''
    })
  }
  refresh = (e) => {
    this.setState({ jobInstances: [] })
    const { dispatch } = this.props
    dispatch(actions.fetchResourceByPath(
      userConstants.GET_JOB_INSTANCES_REQUEST, `/function/instances/${formConstants.EVENT_TRIGGER}/${this.props.functionInstance.Name}/jobs`))
    e.preventDefault();
    e.stopPropagation();
  }
  handleFunctionContext = (contextType, functionContext) => {
    this.setState({
      contextType: contextType,
      functionContext: functionContext
    })
  }
  handleSubmit = () => {
    const { dispatch, functionInstance } = this.props
    let updatedInstance = {
      ID: functionInstance.ID,
      InstanceNumber: parseInt(this.state.instanceNumber),
      FunctionContext: this.state.functionContext
    }
    dispatch(actions.executeResourceAction(userConstants.UPDATE_FUNCTION_INSTANCE_REQUEST, updatedInstance))
    this.setState({
      'successMessage': ''
    })
  }
  render() {
    const { appInstanceTypeSettings, functionInstance, appFunctionSettings } = this.props
    const isEventTrigger = functionInstance.Trigger == formConstants.EVENT_TRIGGER
    const functionSetting = appFunctionSettings ?
      appFunctionSettings.filter(setting => setting.Name == functionInstance.FunctionName).length > 0 ?
        appFunctionSettings.filter(setting => setting.Name == functionInstance.FunctionName)[0] : {} : {}
    const instanceTypes = appInstanceTypeSettings.length > 0 ? appInstanceTypeSettings.reduce((map, obj) => {
      map[obj.Name] = {
        usage: `${obj.CPU} CPU / ${obj.Memory} ${obj.MemoryScale} Memory` + (obj.GPU > 0 ? ` / ${obj.GPU} GPU` : '')
      }
      return map
    }, {}) : []
    const jobInstances = this.state.jobInstances
    return <div>
      <div>
        {
          this.state.failureMessage ?
            <Alert dismissible variant='danger' className="alert_message">
              Backend error: {this.state.failureMessage}
            </Alert>
            : ''
        }
        {
          this.state.successMessage ?
            <Alert dismissible variant='success' className="alert_message">
              {this.state.successMessage}
            </Alert>
            : ''
        }

        {functionInstance.Name ?
          <form onSubmit={(e) => e.preventDefault()} className={`needs-validation ${this.state.validated}`} noValidate>
            <div className="bg-white p-3 datalab-wrapper">
              <div className="border-bottom">
                <Form.Row className="pb-3">
                  <Col md={8}>
                    <img className="icon-image" src={functionInstance.Trigger === 'http' ? iconsImages.FUNC_HTTP_ICON : iconsImages.FUNC_EVENT_ICON} />
                    <div className="header-title-wrapper">
                      <h2 className="datalab-title">{functionInstance.Name}</h2>
                      <div className="datalab-submessage">
                        {`${functionInstance.FunctionName} · ${instanceTypes.length > 0 && 'usage' in instanceTypes[functionInstance.InstanceTypeName] ? instanceTypes[functionInstance.InstanceTypeName].usage : ''}· Instance Type: ${functionInstance.InstanceTypeName}`}
                      </div>
                    </div>
                  </Col>
                  <Col md={4} className="text-right datalab-submessage">
                    Created by <span className="datalab-link">{functionInstance.Owner} </span>
                    <br />
                    {`on ${new Date(functionInstance.CreateAt * 1000).toLocaleString()}`}
                  </Col>
                </Form.Row>
              </div>
              <div className="border-bottom mt-2 mb-3 pb-2">
                <Form.Row>
                  <Col md={8} className="pl-5">
                    <Form.Row>
                      <Col className="bold" md={6}>Status:
                        <span className="datalab-delimiter">
                          <ActiveStatus isRunning={true} />
                          {functionInstance.RunningInstances} Running
                        </span>
                        <span className="datalab-delimiter">
                          <ActiveStatus isRunning={false} />
                          {functionInstance.PendingInstances} Pending
                        </span>
                      </Col>
                      <Col className="bold">Age:
                        <span className="datalab-delimiter">
                          {runningTimeMessage(functionInstance)}
                        </span>
                      </Col>
                      <Col className="bold">Restarts:
                        <span className="datalab-delimiter">
                          {functionInstance.Restarts}
                        </span>
                      </Col>
                    </Form.Row>
                  </Col>
                  <div className="detail-btns-right">
                    {
                      (isEventTrigger) ?
                        <React.Fragment>
                          <Link to="#" onClick={this.refresh} className="refresh-button-faas">
                            <img className="m-1" src="../../../assets/static/images/toolbar/Refresh.svg"></img>
                            Refresh
                          </Link>
                          <Link target="_blank" rel="noopener noreferrer" className={functionInstance.URL ? 'datalab-link mr-2 faas-detail-link' : 'd-none'} to={functionInstance.URL}>
                            <img className="m-1" src="../../../../../assets/static/images/toolbar/Open.svg"></img>Open</Link>
                        </React.Fragment>
                        :
                        <a target="_blank" rel="noopener noreferrer" className={functionInstance.URL ? 'datalab-link mr-2 faas-detail-link' : 'd-none'} href={functionInstance.URL}>
                          <img className="m-1" src="../../../../../assets/static/images/toolbar/Open.svg"></img>Open</a>
                    }
                    <a className={isEventTrigger ? 'd-none' : 'datalab-link mr-2 faas-detail-link'} href="#" onClick={this.restart}>
                      <img className="m-1" src="../../../../../assets/static/images/toolbar/Refresh.svg"></img>Restart</a>
                    <a className="datalab-delete faas-detail-link" href="#" onClick={(e) => this.delete(e, functionInstance.ID)}>
                      <img className="m-1" src="../../../../../assets/static/images/toolbar/Delete.svg"></img>Delete</a>
                  </div>
                </Form.Row>
              </div>
              <div className="faas-form-tabs">
                <Tabs
                  className={isEventTrigger ? '' : 'faas-only-history'}
                  id="controlled-tab-example"
                  activeKey={this.state.tabKey}
                  onSelect={tabKey => this.setState({ tabKey })}>
                  <Tab eventKey="information" title="Information">
                    <div className="mt-3 pb-3 datalab-body pl-5 pr-5">
                      <Form.Row className="mb-1">
                        <h2>UUID:</h2>
                        <span className="datalab-submessage ml-2">{functionInstance.UUID}</span>
                      </Form.Row>
                      <Form.Row className="mb-1">
                        <h2>Internal Endpoints:</h2>
                        <span className="datalab-submessage ml-2">{functionInstance.InternalEndpoints.join(', ')}</span>
                      </Form.Row>
                      <Form.Row className={isEventTrigger ? 'd-none' : 'mb-1'}>
                        <h2>IngressPath:</h2>
                        <span className="datalab-submessage ml-2">{functionInstance.IngressPath}</span>
                      </Form.Row>
                      {(Object.keys(functionInstance.Tags).length) ?
                        (
                          <Form.Row className="mb-5">
                            <h2>Tags:</h2>
                            <span className="datalab-submessage ml-2 pt-1">
                              <table>
                                <tbody>
                                  {Object.keys(functionInstance.Tags).map(key => {
                                    return <tr key={key} className="datalab-tag-row">
                                      <td className="p-2">{key}:</td>
                                      <td className="p-2">{functionInstance.Tags[key]}</td>
                                    </tr>
                                  })}
                                </tbody>
                              </table>
                            </span>
                          </Form.Row>
                        ) : ''
                      }
                      <Form.Row className={isEventTrigger ? 'd-none' : ''}>
                        <FormGroup controlId="instanceNumber">
                          <h2>Instance Number</h2>
                          <FormControl
                            name="instanceNumber"
                            type="text"
                            value={this.state.instanceNumber}
                            onChange={handleInputByName(this)}
                            className="datalab-input mt-2"
                            placeholder="#instance"
                            pattern="[0-9]{0,3}"
                          />
                          <div className="invalid-feedback">
                            Please provide a number.
                          </div>
                        </FormGroup>
                      </Form.Row>
                      <Form.Row className="mb-2 datalab-faas-form-tabs">
                        <FunctionContextInput
                          functionContext={this.state.functionContext}
                          mode={functionInstance.FunctionContextType}
                          onChange={this.handleFunctionContext}
                          programLanguage={functionSetting.ProgramLanguage} />
                      </Form.Row>
                      <Form.Row className="mb-5">
                        <button onClick={validatedSubmit(this, this.handleSubmit)} type="button" className="submit-button mt-0">Save Change</button>
                      </Form.Row>
                      <Form.Row className={isEventTrigger ? 'd-none' : ''}>
                        <h2>Deployment Log:</h2>
                      </Form.Row>
                      <Form.Row className={isEventTrigger ? 'd-none' : ''}>
                        <Form.Control rows={10} className="deployment-log mt-1" as="textarea" width="60vw" disabled value={this.props.functionInstanceLog} />
                      </Form.Row>
                    </div>
                  </Tab>
                  {isEventTrigger ?
                    <Tab eventKey="job" title="Job History">
                      <JobHistoryTable
                        instanceName={functionInstance.Name}
                        jobInstances={jobInstances}
                        jobInstanceLog={this.props.jobInstanceLog}
                        killJob={this.props.killJob}
                        getJobLog={this.props.getJobLog}></JobHistoryTable>
                    </Tab>
                    :
                    <div></div>
                  }

                </Tabs>
              </div>

            </div>
          </form>
          :
          <LoadingPage />
        }
      </div>
    </div>
  }
}


const mapStateToProps = (state) => {
  return {
    functionInstance: state.functionInstance.functionInstance,
    functionInstanceLog: state.functionInstanceLog.functionInstanceLog,
    jobInstanceLog: state.jobInstanceLog.jobInstanceLog,
    changeFunctionInstances: state.changeFunctionInstances,
    restartFunctionInstance: state.restartFunctionInstance,
    jobInstances: state.jobInstances.jobInstances,
    killJobInstance: state.killJobInstance
  }
}

function mapDispatchToProps(dispatch) {
  return {
    dispatch: dispatch,
    killJob: (instanceName, jobID) => {
      if (window.confirm(`Are you want to kill #${jobID}`)) {
        dispatch(actions.executeResourceActionByPath(userConstants.KILL_JOB_INSTANCE_REQUEST,
          `/function/instances/${formConstants.EVENT_TRIGGER}/${instanceName}/jobs/${jobID}/kill`));
      }
    },
    getJobLog: (instanceName, jobID) => {
      dispatch(actions.fetchResourceByPath(userConstants.GET_JOB_INSTANCE_LOG_REQUEST,
        `/function/instances/${formConstants.EVENT_TRIGGER}/${instanceName}/jobs/${jobID}/log`));
    }
  }
}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(FaaSDetailPanel))