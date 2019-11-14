
import React, {Component} from 'react';
import ToolBar from '../../../ToolBar';
import Table from '../../../Table';
import FunctionForm from './FunctionForm';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { formConstants } from '../../../../constants/form';
import { adminConstants } from '../../../../constants/admin';
import actions from '../../../../actions';

class FunctionPanel extends Component{
  static propTypes = {
    functionSettings: PropTypes.array,
    dispatch: PropTypes.func,
    changeFunctionSettings: PropTypes.object
  }
  constructor(props) {
    super(props)
    const { dispatch } = this.props
    dispatch(actions.fetchResource(adminConstants.GET_FUNCTION_SETTINGS_REQUEST))
  }
  componentDidUpdate() {
    const { action } = this.props.changeFunctionSettings
    if(action){
      const { dispatch } = this.props;
      dispatch(actions.clearResourceAction(adminConstants.CLEAR_ADMIN_REQUEST))
      dispatch(actions.fetchResource(adminConstants.GET_FUNCTION_SETTINGS_REQUEST))
    }
  }
  render (){
    const { functionSettings } = this.props
    const { dispatch } = this.props
    return (
      <div className="main-context">
        <ToolBar title="function">
          <ToolBar.AddNew title="New function" url="/function/new"/>
        </ToolBar>
        <div>
          <Table data={functionSettings}>
            <Table.Column width="5%" dataField="ID" isKey={true} dataSort={true}>ID</Table.Column>
            <Table.Column width="15%" dataField="Name" dataSort={true}>Name</Table.Column>
            <Table.Column dataField="Trigger" >Trigger</Table.Column>
            <Table.Column width="20%" dataField="Description" >Description</Table.Column>
            <Table.Column dataField="AccessibleUsers">Users</Table.Column>
            <Table.Column dataField="AccessibleGroups">Groups</Table.Column>
            <Table.Column dataField="Public" dataFormat={
              (cell) => {
                const bgIconColor =  cell?'bg-info':'bg-warning '
                return(<div>
                  <div className={`d-inline-block w-1 p-1 mr-2 rounded-circle ${bgIconColor}`}></div>
                  {cell?'Public':'Private'}
                </div>)
              }
            }>Status</Table.Column>
            <Table.Column 
              dataField="ID" 
              dataFormat={Table.actionFomatter(
                (cell) => `/function/edit/${cell}`, // EditPage URL
                (cell) => {
                  if(window.confirm(`Are you want to delete #${cell}`)){
                    dispatch(actions.executeResourceAction(
                      adminConstants.DELETE_FUNCTION_SETTING_REQUEST,
                      {'ID':cell}))
                  }
                } //DeleteButton Action
              )}>
            Action
            </Table.Column>
          </Table>
        </div>
      </div>
    )
  }
}


//Wrap form to avoid react router v4 infinite loop
const NewFunctionForm = () => {
  return (
    <FunctionForm formMode={formConstants.NEW_MODE}/>
  )
}

//Wrap form to avoid react router v4 infinite loop
const EditFunctionForm = () => {
  return (
    <FunctionForm formMode={formConstants.EDIT_MODE}/>
  )
}

FunctionPanel.NewFunctionForm = NewFunctionForm
FunctionPanel.EditFunctionForm = EditFunctionForm

export default connect((state) => { 
  return  {
    functionSettings: state.functionSettings.functionSettings,
    changeFunctionSettings: state.changeFunctionSettings,
  }
})(FunctionPanel)