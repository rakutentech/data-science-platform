import React from 'react' 
import { BrowserRouter, Route, Switch } from 'react-router-dom'
/**
 * We don't import components from components/index.js due to we use webpacke to split code chunk
 * ``export`` command will output all file to chunk context 
 */
import { AppHome } from '../components/Containers/DataLab';
import { UserLogin } from '../components/Containers/Login/UserLogin';
import Auth from './auth';
import { userConstants } from '../constants/app';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';


const UserAuthRouter = (props) =>{
  return (
    /* eslint react/no-children-prop: 0 */
    <Auth children={props.children} tokenName={userConstants.USER_TOKEN} />
  )
}

UserAuthRouter.propTypes ={
  children: PropTypes.object
}

// Watch all state, when state be chaned, AuthRouter will trigger render() for checking logging state
const AuthRouter  = connect((state) => {return state})(UserAuthRouter)

const AppRouter = () =>{
  return (
    <div>
      <BrowserRouter basename="/">
        <Switch>
          <Route exact path='/login' component={UserLogin} />
          <AuthRouter>
            <div>
              <Route path='/' component={AppHome} />
            </div>
          </AuthRouter>
        </Switch>
      </BrowserRouter>
    </div>
  )
}

export default AppRouter