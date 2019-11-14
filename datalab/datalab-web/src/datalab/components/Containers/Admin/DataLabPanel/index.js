
import React, {Component} from 'react';
import ToolBar from '../../../ToolBar';
import Table from '../../../Table';
import DataLabForm from './DataLabForm';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { formConstants } from '../../../../constants/form';
import { adminConstants } from '../../../../constants/admin';
import actions from '../../../../actions';
import GroupForm from '../../../GroupForm';
import { Modal } from 'react-bootstrap'

class DataLabPanel extends Component{
  static propTypes = {
    dataLabSettings: PropTypes.array,
    dataLabGroupSettings: PropTypes.array,
    dispatch: PropTypes.func,
    addGroup: PropTypes.func,
    updateGroup: PropTypes.func,
    deleteGroup: PropTypes.func,
    changeDataLabSettings: PropTypes.object,
    changeDataLabGroupSettings: PropTypes.object,
    failureMessage: PropTypes.string
  }
  constructor(props) {
    super(props)
    const { dispatch } = this.props
    dispatch(actions.fetchResource(adminConstants.GET_DATALAB_SETTINGS_REQUEST))
    dispatch(actions.fetchResource(adminConstants.GET_DATALAB_GROUP_SETTINGS_REQUEST))
    this.state = {
      showModalPanel: false
    }
  }
  componentDidUpdate() {
    const { dispatch } = this.props;
    const dataLabAction = this.props.changeDataLabSettings.action
    if(dataLabAction){
      dispatch(actions.fetchResource(adminConstants.GET_DATALAB_SETTINGS_REQUEST))
    }
    const groupAction = this.props.changeDataLabGroupSettings.action
    if(groupAction){
      dispatch(actions.fetchResource(adminConstants.GET_DATALAB_GROUP_SETTINGS_REQUEST))
    }
    dispatch(actions.clearResourceAction(adminConstants.CLEAR_ADMIN_REQUEST))
  }
  handleClose = () => {
    this.setState({ showModalPanel: false });
  }

  handleShow = () => {
    this.setState({ showModalPanel: true });
  }
  render (){
    const { dataLabSettings, dataLabGroupSettings } = this.props
    const { dispatch } = this.props
    return (
      <div className="main-context">
        <ToolBar title="DataLab">
          <ToolBar.AddNew title="New DataLab" url="/datalab/new"/>
          <ToolBar.Manage title="Manage Groups" onClick={this.handleShow}/>
        </ToolBar>
        <div>
          <Table data={dataLabSettings}>
            <Table.Column width="5%" dataField="ID" isKey={true} dataSort={true}>ID</Table.Column>
            <Table.Column dataField="Group">Group</Table.Column>
            <Table.Column width="15%" dataField="Name" dataSort={true}>Name</Table.Column>
            <Table.Column width="20%" dataField="Description" >Description</Table.Column>
            <Table.Column dataField="AccessibleUsers">Users</Table.Column>
            <Table.Column dataField="AccessibleGroups">User Groups</Table.Column>
            <Table.Column dataField="Public" dataFormat={
              (cell) => {
                const bgIconColor =  cell?'bg-info':'bg-warning'
                return(<div>
                  <div className={`d-inline-block w-1 p-1 mr-2 rounded-circle mb-0 ${bgIconColor}`}></div>
                  {cell?'Public':'Private'}
                </div>)
              }
            }>Status</Table.Column>
            <Table.Column 
              dataField="ID" 
              dataFormat={Table.actionFomatter(
                (cell) => `/datalab/edit/${cell}`, // EditPage URL
                (cell) => {
                  if(window.confirm(`Are you want to delete #${cell}`)){
                    dispatch(actions.executeResourceAction(
                      adminConstants.DELETE_DATALAB_SETTING_REQUEST,
                      {'ID':cell}))
                  }
                } //DeleteButton Action
              )}>
            Action
            </Table.Column>
          </Table>
        </div>
        <Modal className="admin-modal" show={this.state.showModalPanel} onHide={this.handleClose}>
          <Modal.Header closeButton>
            <Modal.Title>Manage Groups</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <GroupForm 
              groupSettings={dataLabGroupSettings} 
              onAdd={this.props.addGroup}
              onUpdate={this.props.updateGroup}
              onDelete={this.props.deleteGroup}
              failureMessage={this.props.failureMessage} />
          </Modal.Body>
        </Modal>
      </div>
    )
  }
}


//Wrap form to avoid react router v4 infinite loop
const NewDataLabForm = () => {
  return (
    <DataLabForm formMode={formConstants.NEW_MODE}/>
  )
}

//Wrap form to avoid react router v4 infinite loop
const EditDataLabForm = () => {
  return (
    <DataLabForm formMode={formConstants.EDIT_MODE}/>
  )
}


DataLabPanel.NewDataLabForm = NewDataLabForm
DataLabPanel.EditDataLabForm = EditDataLabForm


const mapDispatchToProps = (dispatch) => {
  return {
    addGroup: (name) => {
      dispatch(actions.executeResourceAction(adminConstants.ADD_DATALAB_GROUP_SETTING_REQUEST, {
        Name: name
      }))
    },
    updateGroup: (id, name) =>{
      dispatch(actions.executeResourceAction(adminConstants.UPDATE_DATALAB_GROUP_SETTING_REQUEST, {
        ID: id,
        Name: name
      }))
    },
    deleteGroup: (id) => {
      if(window.confirm(`Are you want to delete #${id}`)){
        dispatch(actions.executeResourceAction(adminConstants.DELETE_DATALAB_GROUP_SETTING_REQUEST, {
          ID: id
        }))
      }
    },
    dispatch: dispatch // keep dispatch as function
  }
}

export default connect((state) => { 
  return  {
    dataLabGroupSettings: state.dataLabGroupSettings.dataLabGroupSettings,
    dataLabSettings: state.dataLabSettings.dataLabSettings,
    changeDataLabSettings: state.changeDataLabSettings,
    changeDataLabGroupSettings: state.changeDataLabGroupSettings,
    failureMessage: state.changeDataLabGroupSettings.failure?state.changeDataLabGroupSettings.message:''
  }
}, mapDispatchToProps)(DataLabPanel)