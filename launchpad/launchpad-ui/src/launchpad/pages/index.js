import React, {Component} from 'react';
import {connect} from 'react-redux';
import '../../assets/styles/pages/index.scss'
import SideBar from '../components/Sidebar/index';
import NavBar from '../components/Navbar/index'
import {Redirect, Route, Switch} from 'react-router-dom';
import NotFound from './exception/notFound'
import BadRequest from './exception/400'
import ServerError from './exception/500'
import Model from './model/modelList'
import VersionList from './model/versionList'
import ModelDetail from './model/modelDetail'
import API from './api/apiList'
import APICreate from './api/apiCreate'
import APISpecificCreate from './api/apiSpecificCreate'
import APIEdit from './api/apiEdit'

class Index extends Component {
  static propTypes = {

  };

  constructor(props) {
    super(props);
  }

  render() {
    return (
      <div>
        <SideBar serverName="Launchpad">
          {/*<SideBar.Item href="/dashboard" icon="../../assets/static/images/sidebar/Icon.svg" text="Dashboard" />*/}
          <SideBar.Item href="/models" icon="../../assets/static/images/sidebar/Icon.svg" text="Models" />
          <SideBar.Item href="/apis" icon="../../assets/static/images/sidebar/Icon.svg" text="API Library" />
        </SideBar>
        <div className="main-container">
          <NavBar
            /* right={
              <NavBar.UserMenu username={'admin'}>
                <NavDropdown.Item href="#" onClick={this.profile}>Profile</NavDropdown.Item>
                <NavDropdown.Divider />
                <NavDropdown.Item href="#" onClick={this.logout}>Logout</NavDropdown.Item>
              </NavBar.UserMenu>
            } */>
          </NavBar>
          <Switch>
            {/*<Route path='/dashboard' active exact component={Dashboard} />*/}
            <Route path='/models' exact component={Model} />
            <Route path='/model_versions/:modelId' exact component={VersionList} />
            <Route path='/model_detail/:modelId/:modelName/:username/:uuid/:versionName?' exact
                   component={ModelDetail}/>
            <Route path='/apis' exact component={API} />
            <Route path='/apis/create' exact component={APICreate} />
            <Route path='/apis/specific_create/:modelId/:username/:uuid' exact component={APISpecificCreate} />
            <Route path='/apis/edit/:apiId' exact component={APIEdit} />
            <Route path='/400' exact component={BadRequest} />
            <Route path='/404' exact component={NotFound} />
            <Route path='/500' exact component={ServerError} />
            <Redirect path="/" exact to={{pathname: '/models'}} />
            <Route component={NotFound} />
          </Switch>
        </div>
      </div>
    )
  }
}

const mapStateToProps = () => {
  return {};
};

const mapDispatchToProps = () => {
  return {};
};

export default connect(mapStateToProps, mapDispatchToProps)(Index);
