import React, { Component } from 'react';
import UserAvatar from './UserAvatar';
import { Mail } from "../assets";
import axios from 'axios'

class UserPostsInfo extends Component {
  constructor() {
    super();
    this.state = {
      authorId: '',
    }
  }

  componentDidMount() {
    const { userName } = this.props
    axios.get(`${process.env.REACT_APP_KH_API_URL}authors?authorName=${userName}`)
      .then(response => {
        this.setState({ authorId: response.data.data.authorId })
      })
  }

  render() {
    const { userName } = this.props
    const { authorId } = this.state
    return (
      <div className="user_posts_user_info">
        <UserAvatar avatar_size={64} authors={[userName]} />
        <div className="user_posts_user_email">
          <Mail />
          {authorId + '@rakuten.com'}
        </div>
      </div>
    );
  }
}

export default UserPostsInfo;