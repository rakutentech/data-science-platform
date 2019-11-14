import React, { Component } from 'react';
import PropTypes from 'prop-types';
import actions from '../../../../actions';
import { userConstants } from '../../../../constants/app';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';
import LoadingPage from '../../../LoadingPage';
import ActiveStatus from '../../../ActiveStatus';
import { Form, Col, Alert } from 'react-bootstrap';
import { isRunning, runningTimeMessage } from '../../../../helper'
import { iconsImages } from '../../../../constants/icons_images'

class DataLabDetailPanel extends Component {
  static propTypes = {
    dispatch: PropTypes.func,
    history: PropTypes.object,
    dataLabInstance: PropTypes.object,
    changeDataLabInstances: PropTypes.object,
    dataLabInstanceLog: PropTypes.string,
    appInstanceTypeSettings: PropTypes.array,
    typeName: PropTypes.string,
    typeGroup: PropTypes.string,
    instanceName: PropTypes.string,
  }
  constructor(props) {
    super(props);
    const { dispatch, typeName, typeGroup, instanceName } = this.props
    dispatch(actions.fetchResourceByPath(
      userConstants.GET_DATALAB_INSTANCE_REQUEST, `/datalab/instances/${typeGroup}/${typeName}/${instanceName}`))
    dispatch(actions.fetchResourceByPath(
      userConstants.GET_DATALAB_INSTANCE_LOG_REQUEST, `/datalab/instances/${typeGroup}/${typeName}/${instanceName}/log`))
    this.state = {
      failureMessage: ''
    }
  }
  componentDidUpdate() {
    const { action, failure, message } = this.props.changeDataLabInstances
    if (action) {
      const { dispatch } = this.props;
      dispatch(actions.clearResourceAction(userConstants.CLEAR_APP_REQUEST))
      if (!failure) {
        this.props.history.push('/datalab')
      } else {
        this.setState({
          failureMessage: message
        })
      }
    }
  }
  delete = (e, id) => {
    e.preventDefault();
    e.stopPropagation();
    const { dispatch } = this.props
    if (window.confirm(`Are you want to delete #${id}`)) {
      dispatch(actions.executeResourceAction(userConstants.DELETE_DATALAB_INSTANCE_REQUEST, {
        ID: id
      }))
    }
  }
  render() {
    const { appInstanceTypeSettings, typeName, dataLabInstance } = this.props
    const dataLab = dataLabInstance.Name ? dataLabInstance : undefined
    const instanceTypes = appInstanceTypeSettings.length > 0 ? appInstanceTypeSettings.reduce((map, obj) => {
      map[obj.Name] = {
        usage: `${obj.CPU} CPU / ${obj.Memory} ${obj.MemoryScale} Memory` + (obj.GPU > 0 ? ` / ${obj.GPU} GPU` : '')
      }
      return map
    }, {}) : []
    return <div>
      <div>
        {
          this.state.failureMessage ?
            <Alert dismissible variant="danger" className="alert_message">
              Backend error: {this.state.failureMessage}
            </Alert>
            : ''
        }
        {dataLab ?
          <div className="bg-white p-3 datalab-wrapper">
            <div className="border-bottom">
              <Form.Row className="pb-3">
                <Col md={8}>
                  <img className="icon-image" src={dataLab.active_icon || iconsImages.LAB_ICON} />
                  <div className="header-title-wrapper">
                    <h2 className="datalab-title">{dataLab.Name}</h2>
                    <div className="datalab-submessage mt-1">
                      {`${typeName} · ${instanceTypes.length > 0 && 'usage' in instanceTypes[dataLab.InstanceTypeName] ? instanceTypes[dataLab.InstanceTypeName].usage : ''}· Instance Type: ${dataLab.InstanceTypeName}`}
                    </div>
                  </div>
                </Col>
                <Col md={4} className="text-right datalab-submessage">
                  Created by <span className="datalab-link">{dataLab.Owner} </span>
                  <br />
                  {`on ${new Date(dataLab.CreateAt * 1000).toLocaleString()}`}
                </Col>
              </Form.Row>
            </div>
            <div className="border-bottom mt-2 mb-3 pb-2">
              <Form.Row>
                <Col md={8} className="pl-5">
                  <Form.Row>
                    <Col className="bold" md={4}>Status:
                      <span className="datalab-delimiter">
                        <ActiveStatus isRunning={isRunning(dataLab)} />
                        {isRunning(dataLab) ? 'Running' : 'Pending'}
                      </span>
                    </Col>
                    <Col className="bold">Age:
                      <span className="datalab-delimiter">
                        {runningTimeMessage(dataLab)}
                      </span>
                    </Col>
                    <Col className="bold">Restarts:
                      <span className="datalab-delimiter">
                        {dataLab.Restarts}
                      </span>
                    </Col>
                  </Form.Row>
                </Col>
                <Col md={1}>
                </Col>
                <div className="detail-btns-right">
                  <a target="_blank" rel="noopener noreferrer" className={dataLab.URL ? 'datalab-link mr-5' : 'd-none'} href={dataLab.URL}>
                    <img className="m-1" src="../../../../../assets/static/images/toolbar/Open.svg"></img>Open</a>
                  <a target="_blank" rel="noopener noreferrer" className="datalab-delete" href="#" onClick={(e) => this.delete(e, dataLab.ID)}>
                    <img className="m-1" src="../../../../../assets/static/images/toolbar/Delete.svg"></img>Delete</a>
                </div>
              </Form.Row>
            </div>
            <div className="mt-3 pb-3 datalab-body pl-5 pr-5">
              <Form.Row className="mb-2">
                <h2>UUID:</h2>
                <span className="datalab-submessage ml-2">{dataLab.UUID}</span>
              </Form.Row>
              <Form.Row className="mb-2">
                <h2>Internal Endpoints:</h2>
                <span className="datalab-submessage ml-2">{dataLab.InternalEndpoints.join(', ')}</span>
              </Form.Row>
              {(Object.keys(dataLab.Tags).length) ?
                (
                  <Form.Row className="mb-3">
                    <h2>Tags:</h2>
                    <span className="datalab-submessage ml-2">
                      <table>
                        <tbody>
                          {Object.keys(dataLab.Tags).map(key => {
                            return <tr key={key} className="datalab-tag-row">
                              <td className="p-2">{key}:</td>
                              <td className="p-2">{dataLab.Tags[key]}</td>
                            </tr>
                          })}
                        </tbody>
                      </table>
                    </span>
                  </Form.Row>
                ) : ''}

              <Form.Row>
                <h2>Deployment Log:</h2>
              </Form.Row>
              <Form.Row>
                <Form.Control rows={10} className="deployment-log mt-1" as="textarea" width="60vw" disabled value={this.props.dataLabInstanceLog} />
              </Form.Row>
            </div>
          </div>
          :
          <LoadingPage />
        }
      </div>
    </div>
  }
}

export default withRouter(connect((state) => {
  return {
    dataLabInstance: state.dataLabInstance.dataLabInstance,
    dataLabInstanceLog: state.dataLabInstanceLog.dataLabInstanceLog,
    changeDataLabInstances: state.changeDataLabInstances,
  }
})(DataLabDetailPanel))