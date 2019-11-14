
import React, { Component } from 'react'
import { connect } from 'react-redux';
import actions from '../../../../actions';
import { adminConstants } from '../../../../constants/admin';
import Table from '../../../Table';
import ToolBar from '../../../ToolBar';
import PropTypes from 'prop-types';
import InstanceTypeForm from './InstanceTypeForm';
import { Link } from 'react-router-dom';
import { FormGroup, FormControl, Form, Col, Alert } from 'react-bootstrap';
import GroupForm from '../../../GroupForm';
import { formConstants } from '../../../../constants/form';
import { Modal, Button } from 'react-bootstrap';
import { handleInputByName, groupBy } from '../../../../helper';

class InstanceTypePanel extends Component {
  static propTypes = {
    instanceTypeSettings: PropTypes.array,
    instanceTypeGroupSettings: PropTypes.array,
    storageSettings: PropTypes.array,
    dispatch: PropTypes.func,
    addGroup: PropTypes.func,
    updateGroup: PropTypes.func,
    deleteGroup: PropTypes.func,
    changeInstanceTypeSettings: PropTypes.object,
    changeInstanceTypeGroupSettings: PropTypes.object,
    changeStorageSettings: PropTypes.object,
    changeInstanceTypeGroupFailureMessage: PropTypes.string,
    changeStorageFailureMessage: PropTypes.string
  }
  constructor(props) {
    super(props);
    const { dispatch } = this.props;
    dispatch(actions.fetchResource(adminConstants.GET_INSTANCE_TYPE_GROUP_SETTINGS_REQUEST))
    dispatch(actions.fetchResource(adminConstants.GET_INSTANCE_TYPE_SETTINGS_REQUEST))
    dispatch(actions.fetchResource(adminConstants.GET_STORAGE_SETTINGS_REQUEST))
    this.state = {
      showInstanceTypeGroupModalPanel: false,
      showStorageModalPanel: false,
      changeStorageFailureMessage: '',
      storageAction: formConstants.NEW_MODE,
      storageID: -1,
      storageLabel: '',
      storageValue: ''
    }
  }
  componentDidUpdate() {
    const instanceTypeAction = this.props.changeInstanceTypeSettings.action
    const { dispatch } = this.props;
    if (instanceTypeAction) {
      dispatch(actions.fetchResource(adminConstants.GET_INSTANCE_TYPE_SETTINGS_REQUEST))
    }
    const instanceTypeGroupAction = this.props.changeInstanceTypeGroupSettings.action
    if (instanceTypeGroupAction) {
      dispatch(actions.fetchResource(adminConstants.GET_INSTANCE_TYPE_GROUP_SETTINGS_REQUEST))
    }
    const changeStorageSettingsAction = this.props.changeStorageSettings.action
    if (changeStorageSettingsAction) {
      dispatch(actions.fetchResource(adminConstants.GET_STORAGE_SETTINGS_REQUEST))
    }
    if (this.props.changeStorageFailureMessage) {
      this.setState(
        { changeStorageFailureMessage: this.props.changeStorageFailureMessage }
      )
    }
    dispatch(actions.clearResourceAction(adminConstants.CLEAR_ADMIN_REQUEST))
  }

  handleClose = (target) => {
    this.setState({ [target]: false });
  }

  handleShow = (target) => {
    this.setState({ [target]: true });
  }

  render() {
    const { instanceTypeSettings, instanceTypeGroupSettings, storageSettings } = this.props
    const { dispatch } = this.props
    const instanceTypeDict = groupBy(['Group'], instanceTypeSettings)
    return (
      <div className="main-context">
        {
          this.state.failureMessage ?
            <Alert dismissible variant="danger" className="alert_message">
              Backend error: {this.state.failureMessage}
            </Alert>
            : ''
        }
        <ToolBar title="Instance Type">
          <ToolBar.AddNew title="New Type" url="/instancetype/new" />
          <ToolBar.Manage title="Manage Group" onClick={
            () => this.handleShow('showInstanceTypeGroupModalPanel')} />
        </ToolBar>
        {
          Object.keys(instanceTypeDict).map(groupName => {
            return <div key={groupName} className="group-block mb-3">
              <span className="group-block__message mb-2">{groupName}</span>
              <div className="group-block__context">
                {instanceTypeDict[groupName].map(instanceType => {
                  return <div key={instanceType.Name} className="instance-block">
                    <div className="instance-header mb-2">{instanceType.Name}</div>
                    <div className="instance-block__message mb-4">
                      {instanceType.CPU} CPU / {instanceType.Memory} {instanceType.MemoryScale} / {instanceType.GPU} GPU
                    </div>
                    <div>
                      <Button
                        onClick={() => {
                          if (window.confirm(`Are you want to delete instance typw #${instanceType.ID}`)) {
                            dispatch(actions.executeResourceAction(adminConstants.DELETE_INSTANCE_TYPE_SETTING_REQUEST, {
                              ID: instanceType.ID
                            }))
                          }
                        }}
                        className="btn float-right instance-button instance-button__message"
                      >Delete</Button>
                      <Link to={`/instancetype/edit/${instanceType.ID}`}
                        className="btn float-right mr-2 instance-button instance-button__message"
                      >Edit</Link>
                    </div>
                  </div>
                })}
              </div>
            </div>
          })
        }
        <div className="mt-5"></div>
        <ToolBar title="Manage Storage">
          <ToolBar.AddNew title="New Size" url="#" onClick={
            (e) => {
              e.preventDefault();
              e.stopPropagation();
              this.setState({
                storageAction: formConstants.NEW_MODE,
                storageID: -1,
                storageLabel: '',
                storageValue: ''
              })
              this.handleShow('showStorageModalPanel')
            }} />
        </ToolBar>
        <div>
          <Table data={storageSettings}>
            <Table.Column width="5%" dataField="ID" isKey={true} dataSort={true}>ID</Table.Column>
            <Table.Column dataField="Label" dataSort={true}>Label</Table.Column>
            <Table.Column dataField="Value" dataSort={true}>Value</Table.Column>
            <Table.Column
              dataField="ID"
              dataFormat={Table.actionFomatter(
                undefined,
                (cell) => {
                  if (window.confirm(`Are you want to delete #${cell}`)) {
                    dispatch(actions.executeResourceAction(
                      adminConstants.DELETE_STORAGE_SETTING_REQUEST,
                      { 'ID': cell }))
                  }
                },
                (cell, row) => {
                  this.setState({
                    storageAction: formConstants.EDIT_MODE,
                    storageID: cell,
                    storageLabel: row.Label,
                    storageValue: row.Value
                  })
                  this.handleShow('showStorageModalPanel')
                }
              )}>
              Action
            </Table.Column>
          </Table>
        </div>
        <Modal className="admin-modal" show={this.state.showInstanceTypeGroupModalPanel}
          onHide={() => this.handleClose('showInstanceTypeGroupModalPanel')}>
          <Modal.Header closeButton>
            <Modal.Title>Manage Group</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <GroupForm
              groupSettings={instanceTypeGroupSettings}
              onAdd={this.props.addGroup}
              onUpdate={this.props.updateGroup}
              onDelete={this.props.deleteGroup}
              failureMessage={this.props.changeInstanceTypeGroupFailureMessage} />
          </Modal.Body>
        </Modal>
        <Modal className="admin-modal" show={this.state.showStorageModalPanel} onHide={() => this.handleClose('showStorageModalPanel')}>
          <Modal.Header closeButton>
            <Modal.Title>{this.state.storageAction} size option</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <div>
              <Form.Row className="mb-2"><h2>Size Option (GiB)</h2></Form.Row>
              <Form.Row>
                <Col>
                  <FormGroup controlId="storageID" className="d-none">
                    <FormControl
                      readOnly
                      name="storageID"
                      autoFocus
                      type="text"
                      value={this.state.storageID}
                      onChange={handleInputByName(this)}
                    />
                  </FormGroup>
                  <FormGroup controlId="storageLabel">
                    <FormControl
                      name="storageLabel"
                      autoFocus
                      type="text"
                      value={this.state.storageLabel}
                      onChange={handleInputByName(this)}
                      placeholder="Enter a label"
                    />
                  </FormGroup>
                </Col>
                <Col>
                  <FormGroup controlId="storageValue">
                    <FormControl
                      name="storageValue"
                      autoFocus
                      type="text"
                      value={this.state.storageValue}
                      onChange={handleInputByName(this)}
                      placeholder="Enter a value"
                    />
                  </FormGroup>
                </Col>
              </Form.Row>
            </div>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" className="btn-success" onClick={() => {
              this.setState(
                { changeStorageFailureMessage: '' }
              )
              if (this.state.storageAction == formConstants.NEW_MODE) {
                dispatch(actions.executeResourceAction(adminConstants.ADD_STORAGE_SETTING_REQUEST, {
                  Label: this.state.storageLabel,
                  Value: parseInt(this.state.storageValue)
                }))
              } else {
                dispatch(actions.executeResourceAction(adminConstants.UPDATE_STORAGE_SETTING_REQUEST, {
                  ID: this.state.storageID,
                  Label: this.state.storageLabel,
                  Value: parseInt(this.state.storageValue)
                }))
              }
              this.handleClose('showStorageModalPanel')
            }}>
              Save
            </Button>
            <Button variant="secondary" onClick={() => this.handleClose('showStorageModalPanel')}>
              Close
            </Button>
          </Modal.Footer>
        </Modal>
      </div>
    )
  }
}



//Wrap form to avoid react router v4 infinite loop
const NewInstanceTypeForm = () => {
  return (
    <InstanceTypeForm formMode={formConstants.NEW_MODE} />
  )
}

//Wrap form to avoid react router v4 infinite loop
const EditInstanceTypeForm = () => {
  return (
    <InstanceTypeForm formMode={formConstants.EDIT_MODE} />
  )
}

InstanceTypePanel.NewInstanceTypeForm = NewInstanceTypeForm
InstanceTypePanel.EditInstanceTypeForm = EditInstanceTypeForm

const mapStateToProps = (state) => {
  return {
    instanceTypeSettings: state.instanceTypeSettings.instanceTypeSettings,
    instanceTypeGroupSettings: state.instanceTypeGroupSettings.instanceTypeGroupSettings,
    storageSettings: state.storageSettings.storageSettings,
    changeInstanceTypeSettings: state.changeInstanceTypeSettings,
    changeInstanceTypeGroupSettings: state.changeInstanceTypeGroupSettings,
    changeStorageSettings: state.changeStorageSettings,
    changeInstanceTypeGroupFailureMessage:
      state.changeInstanceTypeGroupSettings.failure ? state.changeInstanceTypeGroupSettings.message : '',
    changeStorageFailureMessage:
      state.changeStorageSettings.failure ? state.changeStorageSettings.message : '',
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    addGroup: (name) => {
      dispatch(actions.executeResourceAction(adminConstants.ADD_INSTANCE_TYPE_GROUP_SETTING_REQUEST, {
        Name: name
      }))
    },
    updateGroup: (id, name) => {
      dispatch(actions.executeResourceAction(adminConstants.UPDATE_INSTANCE_TYPE_GROUP_SETTING_REQUEST, {
        ID: id,
        Name: name
      }))
    },
    deleteGroup: (id) => {
      if (window.confirm(`Are you want to delete storage #${id}`)) {
        dispatch(actions.executeResourceAction(adminConstants.DELETE_INSTANCE_TYPE_GROUP_SETTING_REQUEST, {
          ID: id
        }))
      }
    },
    dispatch: dispatch // keep dispatch as function
  }
}


export default connect(mapStateToProps, mapDispatchToProps)(InstanceTypePanel)