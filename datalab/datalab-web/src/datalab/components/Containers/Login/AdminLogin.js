
import React, { Component } from 'react';
import LoginPage from './LoginPage'
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { adminConstants } from '../../../constants/admin';
import actions from '../../../actions';

class AdminLoginPage extends Component {
    static propTypes = {
      failure: PropTypes.bool,
      history: PropTypes.object,
      login: PropTypes.func,
      appRoot: PropTypes.string
    }
    constructor(props) {
      super(props);
      if (localStorage.getItem(adminConstants.ADMIN_TOKEN)) {
        this.props.history.push('/')
      }
    }
    componentDidUpdate() {
      if (localStorage.getItem(adminConstants.ADMIN_TOKEN)) {
        this.props.history.push('/')
      }
    }
    
    render() {
      return (
        <LoginPage loginFailure={this.props.failure} welcome_text="Welcome, administrator" serverName="DataLab Admin" login={this.props.login} />
      )
    }
}

function mapStateToProps(state) {
  return state.authenticationAdmin
}

function mapDispatchToProps(dispatch) {
  return {
    login: (username, password, rememberMe) =>{
      dispatch(actions.login(adminConstants.LOGIN_REQUEST, username, password, rememberMe));
    }
  }
}

const AdminLogin = connect(mapStateToProps, mapDispatchToProps)(AdminLoginPage)
export { AdminLogin }