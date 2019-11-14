import React from 'react' 
import { BrowserRouter, Route, Switch } from 'react-router-dom'
/**
 * We don't import components from components/index.js due to we use webpacke to split code chunk
 * ``export`` command will output all file to chunk context 
 */
import { AdminHome } from '../components/Containers/Admin';
import { AdminLogin } from '../components/Containers/Login/AdminLogin';
import { adminConstants } from '../constants/admin';
import Auth from './auth';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import config from 'config'

const AdminAuthRouter = (props) =>{
  return (
  /* eslint react/no-children-prop: 0 */
    <Auth children={props.children} tokenName={adminConstants.ADMIN_TOKEN} />
  )
}
  
AdminAuthRouter.propTypes ={
  children: PropTypes.object
}

// Watch all state, when state be chaned, AuthRouter will trigger render() for checking logging state
const AuthRouter  = connect((state) => {return state})(AdminAuthRouter)

const AdminRouter = () =>{
  return (
    <div>
      <BrowserRouter basename={config.adminPath}>
        <Switch>
          <Route exact path='/login' component={AdminLogin} />
          <AuthRouter>
            <Route path='/' component={AdminHome} />
          </AuthRouter>
        </Switch>
      </BrowserRouter>
    </div>
  )
}

export default AdminRouter 
  
  