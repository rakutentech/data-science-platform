import React from 'react';
import LoginForm from './LoginForm'
import PropTypes from 'prop-types';
import { iconsImages } from '../../../constants/icons_images'

const LoginPage = (props) => {
  return (
    <div className="login-main" style={{ 'backgroundImage': `url(${props.serverName === 'DataLab' ? iconsImages.SIGNIN_BG : iconsImages.SIGNIN_ADMIN_BG})` }}>
      <nav className="">
        <LoginLogo serverName={props.serverName} />
      </nav>
      <div className="login ">
        <LoginForm welcome_text={props.welcome_text} loginFailure={props.loginFailure} login={props.login} />
      </div>
    </div>
  );
}

LoginPage.propTypes = {
  serverName: PropTypes.string,
  loginFailure: PropTypes.bool,
  login: PropTypes.func,
  welcome_text: PropTypes.string
}

const LoginLogo = (props) => {
  return (
    <div className="logo">
      <figure>
        <img
          className="logo--color"
          src={iconsImages.LOGO_PNG}
        />
      </figure>
      <div className="logo__name">
        <p className="logo__platform-name">DScP</p>
        <p className="logo__service-name">{props.serverName}</p>
      </div>
    </div>
  )
}

LoginLogo.propTypes = {
  serverName: PropTypes.string
}

export default LoginPage