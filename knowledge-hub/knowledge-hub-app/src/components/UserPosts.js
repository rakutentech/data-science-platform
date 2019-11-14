import React, { Component } from "react";
import { utils_general } from '../utils/general';
import { userConstants } from '../constants/userConstants';
import NotebookListItems from "./NotebookList/NotebookListItems";
import UserPostsInfo from "./UserInfoBlocks/UserPostsInfo";
import { Tab } from 'semantic-ui-react'

const recordStatus = 0;
let pageNo = 1
let limit = 12

export default class UserPosts extends Component {
  constructor() {
    super();
    let user_name = utils_general.getQueryVariable('username') || localStorage.getItem(userConstants.KEY_USER_NAME_DISPLAY)
    if (user_name === 'undefined' || user_name === null) {
      window.location.assign(`${process.env.REACT_APP_KH_HOST}`)
    }

    pageNo = utils_general.getQueryVariable('page') || 1

    this.state = {
      author: user_name,
    }
  }

  componentDidMount() {
    const userName = localStorage.getItem(userConstants.KEY_USER_NAME_DISPLAY)
    const userId = localStorage.getItem(userConstants.KEY_USER_NAME)
    const author = this.state.author
    this.props.searchNotebookListByAuthor(recordStatus, author, userId, userName, pageNo, limit);
  }

  onPageChange = pageNo => {
    window.location.assign(`${process.env.REACT_APP_KH_HOST}userposts?page=${pageNo}&username=${this.state.author}`)
  };

  render() {
    const { notebookInfo } = this.props;
    const { notebookList } = notebookInfo
    const { author } = this.state;

    let panes = [
      { menuItem: `Published (${notebookList !== undefined ? notebookList.length : 0})`, render: () => <Tab.Pane><NotebookListItems no_tags userName={author} onPageChange={this.onPageChange} notebookInfo={notebookInfo} /></Tab.Pane> },
      { menuItem: 'Drafts (0)', render: () => <Tab.Pane></Tab.Pane> },
    ]

    return (
      <div className="padding_of_fixed_header container">
        <UserPostsInfo userName={author} />
        <Tab className="user_posts_tabs" panes={panes} />
      </div>
    );
  }
}