// @flow
import React from "react";
import { history } from '../helpers/history';
import { userActions } from "../actions/userAction";
import UserAvatar from "./UserInfoBlocks/UserAvatar"
import { Dropdown } from "semantic-ui-react"
import { userConstants } from '../constants/userConstants';
import { utils_general } from '../utils/general';

class LoginLogout extends React.Component {
  state = {
    token: null,
    userName: null
  };

  componentDidMount() {
  }

  handleLogout(e, token) {
    e.preventDefault();
    localStorage.removeItem(userConstants.KEY_ACCESS_TOKEN)
    localStorage.removeItem(userConstants.KEY_USER_NAME_DISPLAY)
    localStorage.removeItem(userConstants.KEY_USER_NAME)
    userActions.logout(token);
  }

  loginHandle = () => {
    let current_url = process.env.REACT_APP_KH_HOST + window.location.pathname.slice(1) + window.location.search
    current_url = current_url.split('/').filter(function (item, i, allItems) {
      return i === allItems.indexOf(item);
    }).join('/');
    localStorage.setItem('old_url', current_url)
  }

  getUserInfo = (token) => {
    const request = require("request");
    const header = { Authorization: "Bearer " + token };
    const options = {
      method: "GET",
      url: process.env.REACT_APP_USER_ACCOUNT_API_URL,
      headers: header
    };

    request(options, function (error, response, body) {
      if (response.statusCode !== 200) {
        console.log('call user account service error! ', response.statusCode, JSON.parse(body));
      } else {
        const userAccount = JSON.parse(body).oauth2_request.request_parameters.username;
        const options = {
          method: "GET",
          url: process.env.REACT_APP_USER_INFO_API_URL,
          qs: { name: userAccount },
          headers: header
        };
        request(options, function (error, response, body) {
          if (response.statusCode !== 200) {
            console.log('call user info service error! ', response.statusCode, JSON.parse(body));
          } else {
            let user_info = JSON.parse(body).data;
            const userName = user_info[userConstants.KEY_USER_NAME];

            localStorage.setItem(userConstants.KEY_USER_NAME, userName);
            localStorage.setItem(userConstants.KEY_USER_NAME_DISPLAY, user_info[userConstants.KEY_USER_NAME_DISPLAY]);
            this.props.setInitialAuthor(userName, user_info[userConstants.KEY_USER_NAME_DISPLAY], token)
            this.setState({ userName: userName });
            if (localStorage.getItem('old_url')) {
              let old_url = localStorage.getItem('old_url')
              localStorage.removeItem('old_url')
              window.location.assign(old_url)
            } else {
              history.push(process.env.PUBLIC_URL + '/')
            }
          }
        }.bind(this));
      }
    }.bind(this));
  }

  renderDropdown(token) {
    const trigger = (
      <UserAvatar authors={[localStorage.getItem(userConstants.KEY_USER_NAME_DISPLAY)]} disable_name />
    )
    const dd_options = [
      { key: 'My Posts', text: 'My Posts', url: 'userposts' },
      { key: 'Notification Settings', text: 'Settings', url: 'notification' },
    ]
    return (
      <Dropdown id="user-info-block" trigger={trigger} pointing='top right' icon={null}>
        <Dropdown.Menu>
          {dd_options.map(option => <Dropdown.Item onClick={(e) => window.location.assign(`${process.env.REACT_APP_KH_HOST}${option.url}`)} key={option.value} {...option} />)}
          <Dropdown.Divider />
          <Dropdown.Item key="Log Out" text="Log Out" onClick={(e) => this.handleLogout(e, token)} />
        </Dropdown.Menu>
      </Dropdown>
    );
  }

  render() {
    let token = utils_general.getQueryVariable(userConstants.KEY_ACCESS_TOKEN) || localStorage.getItem(userConstants.KEY_ACCESS_TOKEN);

    if (utils_general.getQueryVariable(userConstants.KEY_ACCESS_TOKEN)) {
      localStorage.setItem(userConstants.KEY_ACCESS_TOKEN, utils_general.getQueryVariable(userConstants.KEY_ACCESS_TOKEN))
      this.getUserInfo(localStorage.getItem(userConstants.KEY_ACCESS_TOKEN));
    }



    if (token === null || typeof (token) === 'undefined') {
      return (
        <a href={process.env.REACT_APP_LOGIN_API_URL} onClick={this.loginHandle} className="login_btn">
          Login via SSO
            </a>
      );
    }
    else {
      return this.renderDropdown(token);
    }
  }
}

export default LoginLogout 
