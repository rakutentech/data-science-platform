
import React, { Component } from 'react';
import { Route, Switch } from 'react-router-dom'
import { connect } from 'react-redux';
import { userConstants } from '../../../constants/app';
import { withRouter } from 'react-router';
import actions from '../../../actions';
import PropTypes from 'prop-types';
import SideBar from '../../SideBar'
import NavBar from '../../NavBar'
import { NavDropdown } from 'react-bootstrap'
import NotFound from '../NotFound'
import HomePanel from './HomePanel'
import DataLabPanel from './DataLabPanel'
import FaaSPanel from './FaaSPanel'
import ProfilePanel from './ProfilePanel'
import { ResourceBar } from '../../ResourceChart'


class AppHome extends Component {
  static propTypes = {
    profile: PropTypes.object,
    resourceQuota: PropTypes.object,
    dispatch: PropTypes.func,
    appDataLabSettings: PropTypes.array,
    appFunctionSettings: PropTypes.array,
    appInstanceTypeSettings: PropTypes.array,
    appStorageSettings: PropTypes.array,
    history: PropTypes.object
  }
  constructor(props) {
    super(props);
    const { dispatch } = this.props;
    const localProfile = localStorage.getItem(userConstants.APP_USER) ?
      JSON.parse(localStorage.getItem(userConstants.APP_USER)) : {}
    if (!localProfile.Username) {
      dispatch(actions.fetchResource(userConstants.GET_APP_RROFILE_REQUEST))
    }
    dispatch(actions.fetchResource(userConstants.GET_APP_DATALAB_SETTINGS_REQUEST))
    dispatch(actions.fetchResource(userConstants.GET_APP_FUNCTION_SETTINGS_REQUEST))
    dispatch(actions.fetchResource(userConstants.GET_APP_RESOURCE_QUOTA_REQUEST))
    dispatch(actions.fetchResource(userConstants.GET_APP_INSTANCE_TYPE_SETTINGS_REQUEST))
    dispatch(actions.fetchResource(userConstants.GET_APP_STORAGE_SETTINGS_REQUEST))
    this.state = {
      profile: localProfile,
      resourceQuota: {},
      appDataLabSettings: [],
      appFunctionSettings: [],
      appInstanceTypeSettings: [],
      appStorageSettings: [],
    }
  }
  componentDidUpdate = (prevProps) => {
    const localProfile = localStorage.getItem(userConstants.APP_USER) ?
      JSON.parse(localStorage.getItem(userConstants.APP_USER)) : {}
    if (!localProfile.Username) {
      const { profile } = this.props
      if (profile && profile.Username) {
        localStorage.setItem(userConstants.APP_USER, JSON.stringify(profile))
        this.setState(
          { profile: profile }
        )
      }
    }
    const resourceQuota = this.props.resourceQuota
    const prevResourceQuota = prevProps.resourceQuota
    if (resourceQuota != prevResourceQuota) {
      this.setState({
        resourceQuota: resourceQuota
      })
    }
    const appDataLabSettings = this.props.appDataLabSettings
    const prevAppDataLabSettings = prevProps.appDataLabSettings
    if (appDataLabSettings != prevAppDataLabSettings) {
      this.setState({
        appDataLabSettings: appDataLabSettings
      })
    }
    const appInstanceTypeSettings = this.props.appInstanceTypeSettings
    const prevAppInstanceTypeSettings = prevProps.appInstanceTypeSettings
    if (appInstanceTypeSettings != prevAppInstanceTypeSettings) {
      this.setState({
        appInstanceTypeSettings: appInstanceTypeSettings
      })
    }
    const appStorageSettings = this.props.appStorageSettings
    const prevAppStorageSettings = prevProps.appStorageSettings
    if (appStorageSettings != prevAppStorageSettings) {
      this.setState({
        appStorageSettings: appStorageSettings
      })
    }
    const appFunctionSettings = this.props.appFunctionSettings
    const prevAppFunctionSettings = prevProps.appFunctionSettings
    if (appFunctionSettings != prevAppFunctionSettings) {
      this.setState({
        appFunctionSettings: appFunctionSettings
      })
    }
  }
  logout = () => {
    const { dispatch } = this.props;
    dispatch(actions.logout(userConstants.LOGOUT))
  }
  profile = () => {
    this.props.history.push('/profile')
  }
  withSettingsFaaSPanel = () => {
    return (
      <FaaSPanel
        appInstanceTypeSettings={this.state.appInstanceTypeSettings}
        appFunctionSettings={this.state.appFunctionSettings} />
    )
  }
  withSettingsDataLabPanel = () => {
    return (
      <DataLabPanel
        appInstanceTypeSettings={this.state.appInstanceTypeSettings}
        appDataLabSettings={this.state.appDataLabSettings}
        appStorageSettings={this.state.appStorageSettings} />
    )
  }
  render() {
    const resourceQuota = this.state.resourceQuota
    return (
      <div>
        <SideBar serverName="DataLab">
          <SideBar.Item href="/datalab" icon="../../assets/static/images/sidebar/Lab.svg" text="DataLabs" />
          <SideBar.Item href="/function" icon="../../assets/static/images/sidebar/FaaS.svg" text="Functions" />
          <SideBar.Bottom>
            <h2>Namespace Usage</h2>
            <span className="navbar-submessage">CPU</span>
            <ResourceBar
              usage={resourceQuota ? resourceQuota['CPUUsage'] : 0}
              total={resourceQuota ? resourceQuota['CPUTotal'] : 0}></ResourceBar>
            <span className="navbar-submessage">Memory</span>
            <ResourceBar
              usage={resourceQuota ? resourceQuota['MemoryUsage'] : 0}
              total={resourceQuota ? resourceQuota['MemoryTotal'] : 0}></ResourceBar>
            <span className="navbar-submessage">GPU</span>
            <ResourceBar
              usage={resourceQuota ? resourceQuota['GPUUsage'] : 0}
              total={resourceQuota ? resourceQuota['GPUTotal'] : 0}></ResourceBar>
            <SideBar.Copyright />
          </SideBar.Bottom>
        </SideBar>
        <div className="main-container">
          <NavBar
            left={
              <div>
                <span className="navbar-subtitle">Namespace</span>
                <div className="navbar-title">
                  {this.state.profile.Namespace}
                </div>
              </div>
            }
            right={
              <NavBar.UserMenu username={this.state.profile.Username}>
                <NavDropdown.Item href="#" onClick={this.profile}>Profile</NavDropdown.Item>
                <NavDropdown.Divider />
                <NavDropdown.Item href="#" onClick={this.logout}>Logout</NavDropdown.Item>
              </NavBar.UserMenu>
            }></NavBar>
          <Switch>
            <Route exact path='/' component={this.withSettingsDataLabPanel} />
            <Route exact path='/datalab' component={this.withSettingsDataLabPanel} />
            <Route exact path='/datalab/:typegroup/:typename' component={this.withSettingsDataLabPanel} />
            <Route exact path='/datalab/:typegroup/:typename/:instancename' component={this.withSettingsDataLabPanel} />
            <Route exact path='/datalab/new' component={this.withSettingsDataLabPanel} />
            <Route exact path='/function' component={this.withSettingsFaaSPanel} />
            <Route exact path='/function/new' component={this.withSettingsFaaSPanel} />
            <Route exact path='/function/:instancename/utilities' component={this.withSettingsFaaSPanel} />
            <Route exact path='/function/:trigger/:instancename' component={this.withSettingsFaaSPanel} />
            <Route exact path='/profile' component={() => <ProfilePanel
              profile={this.state.profile} />} />
            <Route component={NotFound} />
          </Switch>
        </div>
      </div>
    )
  }
}

function mapStateToProps(state) {
  return {
    profile: state.profile.profile,
    resourceQuota: state.resourceQuota.resourceQuota,
    appDataLabSettings: state.appDataLabSettings.appDataLabSettings,
    appFunctionSettings: state.appFunctionSettings.appFunctionSettings,
    appInstanceTypeSettings: state.appInstanceTypeSettings.appInstanceTypeSettings,
    appStorageSettings: state.appStorageSettings.appStorageSettings,
  };
}

const app = withRouter(connect(mapStateToProps)(AppHome))
export { app as AppHome } 
