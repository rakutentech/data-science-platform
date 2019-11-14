
import React, { Component } from 'react';
import LoginPage from './LoginPage'
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { userConstants } from '../../../constants/app';
import actions  from '../../../actions';

class UserLoginPage extends Component {
    static propTypes = {
      failure: PropTypes.bool,
      history: PropTypes.object,
      login: PropTypes.func,
      appRoot: PropTypes.string
    }
    constructor(props) {
      super(props);
      if (localStorage.getItem(userConstants.USER_TOKEN)) {
        this.props.history.push('/')
      }
    }
    componentDidUpdate() {
      if (localStorage.getItem(userConstants.USER_TOKEN)) {
        this.props.history.push('/')
      }
    }
    
    render() {
      return (
        <LoginPage loginFailure={this.props.failure} welcome_text="Welcome" serverName="DataLab" login={this.props.login} />
      )
    }
}

function mapStateToProps(state) {
  return state.authentication
}

function mapDispatchToProps(dispatch) {
  return {
    login: (username, password, rememberMe) =>{
      dispatch(actions.login(userConstants.LOGIN_REQUEST, username, password, rememberMe));
    }
  }
}

const UserLogin = connect(mapStateToProps, mapDispatchToProps)(UserLoginPage)
export { UserLogin }