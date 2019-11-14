import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { FormGroup, FormControl, Alert } from 'react-bootstrap';
import { validatedSubmit, handleInputByName } from '../../../helper';
import SideBar from '../../SideBar'

class LoginForm extends Component {
  static propTypes = {
    loginFailure: PropTypes.bool,
    login: PropTypes.func,
    welcome_text: PropTypes.string
  }
  constructor(props) {
    super(props);

    this.state = {
      username: '',
      password: '',
      rememberMe: false,
      validated: ''
    };
  }

  handleSubmit = () => {
    const { username, password, rememberMe } = this.state;
    if (username && password) {
      this.props.login(username, password, rememberMe);
    }
  }

  render() {
    return (
      <div className="login__form">
        <p className="login__message">{this.props.welcome_text}</p>
        <form onSubmit={validatedSubmit(this, this.handleSubmit)} className={`needs-validation ${this.state.validated}`} noValidate>
          <FormGroup controlId="username">
            <FormControl
              name="username"
              autoFocus
              type="text"
              value={this.state.username}
              onChange={handleInputByName(this)}
              placeholder="User name"
              required
            />
            <div className="invalid-feedback">
              Please provide a username.
            </div>
          </FormGroup>
          <FormGroup controlId="password">
            <FormControl
              name="password"
              value={this.state.password}
              onChange={handleInputByName(this)}
              type="password"
              placeholder="Password"
              autoComplete="password"
              required
            />
            <div className="invalid-feedback">
              Please provide a password.
            </div>
          </FormGroup>
          <div className="form-actions">
            <div className="form-checkbox">
              <input className="checkbox" type="checkbox" id="remember-me" name="rememberMe" onChange={handleInputByName(this)} />
              <label htmlFor="remember-me">Remember me</label>
            </div>
            <button className="button--large--round">Login</button>
          </div>
          {
            this.props.loginFailure ?
              <Alert dismissible variant="danger" className="mt-3">
                Sorry, your username and password are incorrect - please try again.
              </Alert>
              : ''
          }
        </form>
        <SideBar.Copyright />
      </div>
    );
  }
}

export default LoginForm