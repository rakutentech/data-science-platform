import React, { Component } from 'react';
import { Checkbox, Button, Header } from 'semantic-ui-react'
import { userConstants } from '../constants/userConstants';

const CheckboxElement = (props) => <Checkbox {...props} />
var saved_timeout;

class Notification extends Component {
  constructor() {
    super();
    this.state = {
      postNotif: false,
      commentNotif: false,
      saved: false
    }
    this.handleClick = this.handleClick.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.handleChange2 = this.handleChange2.bind(this);
    if (!localStorage.getItem(userConstants.KEY_ACCESS_TOKEN)) {
      window.location.assign(process.env.REACT_APP_KH_HOST)
    }
  }

  async componentDidMount() {
    const userName = localStorage.getItem(userConstants.KEY_USER_NAME_DISPLAY)
    const userId = localStorage.getItem(userConstants.KEY_USER_NAME)
    await this.props.getNotificationSettings(userId, userName);
    this.setState({
      postNotif: this.props.notificationSettings.postNotif,
      commentNotif: this.props.notificationSettings.commentNotif
    });
  }

  handleClick() {
    const userName = localStorage.getItem(userConstants.KEY_USER_NAME_DISPLAY)
    const userId = localStorage.getItem(userConstants.KEY_USER_NAME)
    const token = localStorage.getItem(userConstants.KEY_ACCESS_TOKEN)
    const update_data = {
      postNotif: this.state.postNotif,
      commentNotif: this.state.commentNotif
    }
    this.props.updateNotification(userId, userName, token, update_data);
    this.setState({ saved: true })
    clearTimeout(saved_timeout)
    saved_timeout = setTimeout(() => { this.setState({ saved: false }) }, 2000);
  }

  handleChange() {
    this.setState(state => ({
      postNotif: !state.postNotif
    }));
  }

  handleChange2() {
    this.setState(state => ({
      commentNotif: !state.commentNotif
    }));
  }

  render() {
    const { postNotif, commentNotif } = this.state
    return (
      <div className="padding_of_fixed_header container notification_page">
        {/* <div className="notification_page_left">
          <Button labelPosition='right' icon='right chevron' content='Notification' />
        </div> */}
        <div className="notification_page_right">
          <Header as='h3'>Setting</Header>
          <Header as='h3'>Notification</Header>
          <div>
            <div className="notification_page_sub_left">Email me when</div>
            <div className="notification_page_sub_right">
              <CheckboxElement onChange={this.handleChange} label='there is a new post on Knowledge Hub' checked={postNotif} name="postNotif" />
              <CheckboxElement onChange={this.handleChange2} label='someone comments on my post' checked={commentNotif} name="commentNotif" />
            </div>
          </div>
          <Button color='green' onClick={this.handleClick}>Save Changes</Button>
          <div className={this.state.saved ? 'saved_text' : 'display-none'}>Saved!</div>
        </div>
      </div>
    );
  }
}

export default Notification;