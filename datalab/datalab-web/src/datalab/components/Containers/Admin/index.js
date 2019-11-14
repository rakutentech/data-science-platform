
import React, { Component } from 'react';
import { Route, Switch } from 'react-router-dom'
import { connect } from 'react-redux';
import actions from '../../../actions';
import PropTypes from 'prop-types';
import SideBar from '../../SideBar'
import NavBar from '../../NavBar'
import UserGroupPanel from './UserGroupPanel'
import DataLabPanel from './DataLabPanel'
import FunctionPanel from './FunctionPanel'
import DashboardPanel from './DashboardPanel'
import InstanceTypePanel from './InstanceTypePanel'
import NotFound from '../NotFound'
import { NavDropdown } from 'react-bootstrap'
import { adminConstants } from '../../../constants/admin';

class Admin extends Component {
  static propTypes = {
    dispatch: PropTypes.func
  }
  constructor(props) {
    super(props);
  }
  logout = () => {
    const { dispatch } = this.props;
    dispatch(actions.logout(adminConstants.LOGOUT))
  }
  render() {
    return (
      <div className="admin-page">
        <SideBar serverName="DataLab Admin">
          <SideBar.Item href="/" icon="../../assets/static/images/sidebar/Dashboard.svg" text="Dashboard" />
          <SideBar.Item href="/datalab" icon="../../assets/static/images/sidebar/DataLab.svg" text="DataLab" />
          <SideBar.Item href="/function" icon="../../assets/static/images/sidebar/Function.svg" text="Function" />
          <SideBar.Item href="/instancetype" icon="../../assets/static/images/sidebar/InstanceType.svg" text="InstanceType" />
          <SideBar.Item href="/usergroup/user" icon="../../assets/static/images/sidebar/User.svg" text="User & Groups" />
          <SideBar.Bottom>
            <SideBar.Copyright />
          </SideBar.Bottom>
        </SideBar>
        <div className="main-container">
          <NavBar right={
            <NavBar.UserMenu username="admin">
              <NavDropdown.Item href="#" onClick={this.logout}>Logout</NavDropdown.Item>
            </NavBar.UserMenu>
          }></NavBar>
          <Switch>
            <Route exact path='/' component={DashboardPanel} />
            <Route exact path='/datalab' component={DataLabPanel} />
            <Route exact path='/datalab/new' component={DataLabPanel.NewDataLabForm} />
            <Route exact path='/datalab/edit/:id' component={DataLabPanel.EditDataLabForm} />
            <Route exact path='/function' component={FunctionPanel} />
            <Route exact path='/function/new' component={FunctionPanel.NewFunctionForm} />
            <Route exact path='/function/edit/:id' component={FunctionPanel.EditFunctionForm} />
            <Route exact path='/instancetype' component={InstanceTypePanel} />
            <Route exact path='/instancetype/new' component={InstanceTypePanel.NewInstanceTypeForm} />
            <Route exact path='/instancetype/edit/:id' component={InstanceTypePanel.EditInstanceTypeForm} />
            <Route exact path='/usergroup/user' component={UserGroupPanel} />
            <Route exact path='/usergroup/user/new' component={UserGroupPanel.NewUserForm} />
            <Route exact path='/usergroup/user/edit/:id' component={UserGroupPanel.EditUserForm} />
            <Route component={NotFound} />
          </Switch>
        </div>
      </div>
    )
  }
}

const adminHome = connect()(Admin)
export { adminHome as AdminHome } 