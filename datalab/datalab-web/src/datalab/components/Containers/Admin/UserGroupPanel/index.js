
import React, {Component} from 'react'
import { connect } from 'react-redux';
import actions from '../../../../actions';
import { adminConstants } from '../../../../constants/admin';
import Table from '../../../Table'
import ToolBar from '../../../ToolBar';
import PropTypes from 'prop-types';
import UserForm from './UserForm';
import GroupForm from '../../../GroupForm';
import { formConstants } from '../../../../constants/form';
import { Modal } from 'react-bootstrap'

class UserGroupPanel extends Component{
  static propTypes = {
    userSettings: PropTypes.array,
    groupSettings: PropTypes.array,
    dispatch: PropTypes.func,
    addGroup: PropTypes.func,
    updateGroup: PropTypes.func,
    deleteGroup: PropTypes.func,
    changeUserSettings: PropTypes.object,
    changeGroupSettings: PropTypes.object,
    failureMessage: PropTypes.string
  }
  constructor(props) {
    super(props);
    const { dispatch } = this.props;
    dispatch(actions.fetchResource(adminConstants.GET_USER_SETTINGS_REQUEST))
    dispatch(actions.fetchResource(adminConstants.GET_GROUP_SETTINGS_REQUEST))
    this.state = {
      showModalPanel: false
    }
  }
  componentDidUpdate() {
    const userAction = this.props.changeUserSettings.action
    const { dispatch } = this.props;
    if(userAction){
      dispatch(actions.fetchResource(adminConstants.GET_USER_SETTINGS_REQUEST))
    }
    const groupAction = this.props.changeGroupSettings.action
    if(groupAction){
      dispatch(actions.fetchResource(adminConstants.GET_GROUP_SETTINGS_REQUEST))
    }
    dispatch(actions.clearResourceAction(adminConstants.CLEAR_ADMIN_REQUEST))
  }

  handleClose = () => {
    this.setState({ showModalPanel: false });
  }

  handleShow = () => {
    this.setState({ showModalPanel: true });
  }


  render(){
    const { userSettings, groupSettings } = this.props
    const { dispatch } = this.props
    return (
      <div className="main-context">
        <ToolBar title="User">
          <ToolBar.AddNew title="New User" url="/usergroup/user/new"/>
          <ToolBar.Manage title="Manage Groups" onClick={this.handleShow}/>
        </ToolBar>
        <div>
          <Table data={userSettings}>
            <Table.Column width="5%" dataField="ID" isKey={true} dataSort={true}>ID</Table.Column>
            <Table.Column dataField="Username" width="25vw" className="searchable-column" filter={{ type: 'TextFilter', delay: 100 }}  dataSort={true}>Username</Table.Column>
            <Table.Column dataField="AuthType">AuthType</Table.Column>
            <Table.Column dataField="Group">Group</Table.Column>
            <Table.Column dataField="Namespace">Namespace</Table.Column>
            <Table.Column 
              dataField="ID" 
              dataFormat={Table.actionFomatter(
                (cell) => `/usergroup/user/edit/${cell}`, // EditPage URL
                (cell) => {
                  if(window.confirm(`Are you want to delete #${cell}`)){
                    dispatch(actions.executeResourceAction(
                      adminConstants.DELETE_USER_SETTING_REQUEST,
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
              groupSettings={groupSettings} 
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
const NewUserForm = () => {
  return (
    <UserForm formMode={formConstants.NEW_MODE}/>
  )
}

//Wrap form to avoid react router v4 infinite loop
const EditUserForm = () => {
  return (
    <UserForm formMode={formConstants.EDIT_MODE}/>
  )
}

UserGroupPanel.NewUserForm = NewUserForm
UserGroupPanel.EditUserForm = EditUserForm

const mapStateToProps = (state) => {
  return  {
    groupSettings: state.groupSettings.groupSettings,
    userSettings: state.userSettings.userSettings,
    changeUserSettings: state.changeUserSettings,
    changeGroupSettings: state.changeGroupSettings,
    failureMessage: state.changeGroupSettings.failure?state.changeGroupSettings.message:''
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    addGroup: (name) => {
      dispatch(actions.executeResourceAction(adminConstants.ADD_GROUP_SETTING_REQUEST, {
        Name: name
      }))
    },
    updateGroup: (id, name) =>{
      dispatch(actions.executeResourceAction(adminConstants.UPDATE_GROUP_SETTING_REQUEST, {
        ID: id,
        Name: name
      }))
    },
    deleteGroup: (id) => {
      if(window.confirm(`Are you want to delete #${id}`)){
        dispatch(actions.executeResourceAction(adminConstants.DELETE_GROUP_SETTING_REQUEST, {
          ID: id
        }))
      }
    },
    dispatch: dispatch // keep dispatch as function
  }
}


export default connect(mapStateToProps, mapDispatchToProps)(UserGroupPanel)