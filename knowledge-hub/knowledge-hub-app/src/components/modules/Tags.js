import React, { Component } from 'react';
import { userConstants } from '../../constants/userConstants';
import { history } from "../../helpers/history";

class Tags extends Component {

  handleTag(tag) {
    let pageNo = 1,
      pageRecordCnt = 12,
      userId = localStorage.getItem(userConstants.KEY_USER_NAME),
      userName = localStorage.getItem(userConstants.KEY_USER_NAME_DISPLAY)
    this.props.setHistoryState(tag)
    this.props.getNotebooklist(userConstants.RECORD_STATUS, pageNo, pageRecordCnt, userId, userName, tag);
    history.push(`${process.env.PUBLIC_URL}`)
  }

  render() {
    return (
      <React.Fragment>
        {(
          this.props.tags.map((tag, index) => {
            return (
              <div key={index} onClick={this.handleTag.bind(this, tag)} className="tag">{tag}</div>
            )
          }
          )
        )}
      </React.Fragment>
    );
  }
}

export default Tags;