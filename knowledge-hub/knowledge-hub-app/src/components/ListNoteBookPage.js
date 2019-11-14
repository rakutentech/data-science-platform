import React, { Component } from "react";
import PopularTags from "./PopularTags";
import PopularPosts from "./PopularPosts";
import { utils_general } from '../utils/general';
import { userConstants } from '../constants/userConstants';
import NotebookListItems from "./NotebookList/NotebookListItems";
import axios from "axios";

const pageRecordCnt = 12;
let pageNo = 1;

export default class ListNotebookPage extends Component {
  constructor() {
    super();
    this.state = {
      userId: '',
      selected_tag: null
    }
    pageNo = utils_general.getQueryVariable('page') || 1
  }

  handlePublishNotebook() {
    let update_data = JSON.parse(localStorage.getItem('old_action_data'))
    let formData = new FormData();
    for (var key in update_data) {
      if (!update_data.hasOwnProperty(key)) continue;
      formData.append(key, update_data[key])
    }

    var userId = this.state.userId
    var userName = this.state.userName
    var token = this.state.token
    localStorage.removeItem('old_action')
    localStorage.removeItem('old_action_data')

    var config = {
      headers: {
        'Authorization': "Bearer " + token,
        "content-Type": 'multipart/form-data',
        'userId': userId,
        'userName': userName
      }
    };
    axios.put(
      `${process.env.REACT_APP_KH_API_URL}notebooks/` + formData.notebookId.i,
      formData,
      config
    )
      .then(res => {

        if (res.data.data.includes(`doesn't have privilege`)) {
          alert(`Sorry, only the author can modify this post.`)
        } else {
          localStorage.setItem('notification_status', 'updated_success')
        }
      })
      .catch(err => {
        console.log(err)
      })
  }

  handleDeleteNotebook() {
    const notebook_ID = localStorage.getItem('old_action_data')
    var userId = this.state.userId
    var userName = this.state.userName
    var token = this.state.token
    localStorage.removeItem('old_action')
    localStorage.removeItem('old_action_data')

    var config = {
      headers: {
        "Authorization": "Bearer " + token,
        "userId": userId,
        'userName': userName
      }
    };

    axios.delete(
      `${process.env.REACT_APP_KH_API_URL}notebooks/${notebook_ID}`,
      config
    )
      .then(res => {
        this.props.getNotebooklist(userConstants.RECORD_STATUS, pageNo, pageRecordCnt, userId, userName, null)
        if (res.data.data.includes(`doesn't have privilege`)) {
          alert(`Sorry, only the author can modify this post.`)
        }
      })
      .catch(err => {
        console.log(err)
      })
  }

  async componentDidMount() {
    await this.getUserInfo()
    const userName = this.state.userName
    const userId = this.state.userId

    if (this.props.selected_tag) {
      this.props.getNotebooklist(userConstants.RECORD_STATUS, pageNo, pageRecordCnt, userId, userName, this.props.selected_tag);
    } else if (localStorage.getItem('old_action') === 'delete_notebook') {
      this.handleDeleteNotebook()
    } else if (localStorage.getItem('old_action') === 'publish_notebook') {
      this.handlePublishNotebook()
    } else {
      this.props.getNotebooklist(userConstants.RECORD_STATUS, pageNo, pageRecordCnt, userId, userName, null, this.props.searchKeyword);
    }

    this.props.getPopularTags(userId);
    this.props.getPopularNotebooks(userId);
  }

  getUserInfo() {
    const token = localStorage.getItem(userConstants.KEY_ACCESS_TOKEN)
    const userName = localStorage.getItem(userConstants.KEY_USER_NAME_DISPLAY)
    const userId = localStorage.getItem(userConstants.KEY_USER_NAME)
    if (token !== undefined && token !== null) {
      this.setState({ token: token })
    }
    if (userId !== undefined && userId !== null) {
      this.setState({ userId: userId })
    }
    if (userName !== undefined && userName !== null) {
      this.setState({ userName: userName })
    }
  }

  getNoteBookSearch = () => {
    const userName = localStorage.getItem(userConstants.KEY_USER_NAME_DISPLAY)
    const userId = localStorage.getItem(userConstants.KEY_USER_NAME)
    this.props.getNotebooklist(userConstants.RECORD_STATUS, pageNo, pageRecordCnt, userId, userName, this.props.selected_tag, this.props.searchKeyword === '%' ? null : this.props.searchKeyword);
    let elems = document.querySelectorAll(".popular_tag");
    [].forEach.call(elems, function (el) {
      el.classList.remove("active");
    });
  }

  onPageChange = pageNo => {
    localStorage.setItem('searchKeyword', this.props.searchKeyword)
    if (this.props.selected_tag !== null)
      localStorage.setItem('selected_tag', this.props.selected_tag)
    window.location.assign(`${process.env.REACT_APP_KH_HOST}?page=${pageNo}`)
  };

  render() {

    const { notebookInfo, searchKeyword, selected_tag } = this.props;
    const { popularTags } = this.props.popularTags;
    const { popularPosts } = this.props.popularPosts;

    if (selected_tag && !popularTags.includes(selected_tag)) {
      popularTags.push(selected_tag)
    }
    let tags_status = {} //Array(popularTags.length).fill(false)
    popularTags.forEach((v, i) => {
      let sts = false
      if (v === selected_tag)
        sts = true
      tags_status[v] = sts
    })
    return (
      <div className="padding_of_fixed_header container">
        <NotebookListItems setHistoryState={this.props.setHistoryState} searchKeyword={searchKeyword} onPageChange={this.onPageChange} notebookInfo={notebookInfo} getNotebooklist={this.props.getNotebooklist} />

        <div id="side-bar">
          <PopularTags
            tags_status={tags_status}
            popularTags={popularTags}
            setHistoryState={this.props.setHistoryState}
            getNotebooklist={this.props.getNotebooklist} />
          <PopularPosts
            popularPosts={popularPosts}
            getNotebooklist={this.props.getNotebooklist} />
        </div>
      </div>
    );
  }
}