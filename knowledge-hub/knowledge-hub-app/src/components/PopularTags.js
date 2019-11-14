import React, { Component } from 'react';
import { history } from "../helpers/history";
import { userConstants } from '../constants/userConstants';
class ButtonTag extends Component {
  constructor(props) {
    super(props);
    this.state = {
      active: this.props.status,
      name: this.props.text
    };
  }
  toggleClass() {
    this.props.handler(this.props.text)
  };

  render() {
    // let { name, active } = this.state
    let name = this.props.text
    let active = this.props.status
    return (
      <div key={this.props.idx}
        id={`popular_tag_${name.split(' ').join('_')}`}
        className={`popular_tag ${active ? 'active' : ''}`}
        onClick={this.toggleClass.bind(this)}
      >{name}</div>
    )
  }
}

class PopularTags extends Component {
  constructor(props) {
    super(props)
    this.handler = this.handler.bind(this)
  }

  handler(tag_name) {
    const url = process.env.PUBLIC_URL + '/'
    let tag = null;
    let elem = document.getElementById(`popular_tag_${tag_name.split(' ').join('_')}`)
    if (elem.classList.contains('active')) {
      elem.classList.remove('active');
      history.push(url, {})
    } else {
      document.getElementById("search").value = ""
      let elems = document.querySelectorAll(".popular_tag");
      [].forEach.call(elems, function (el) {
        el.classList.remove("active");
      });
      elem.classList.add('active');
      tag = tag_name
    }
    let pageNo = 1,
      pageRecordCnt = 12,
      userId = localStorage.getItem(userConstants.KEY_USER_NAME),
      userName = localStorage.getItem(userConstants.KEY_USER_NAME_DISPLAY)
    if (tag) {
      this.props.setHistoryState(tag)
    }
    this.props.getNotebooklist(userConstants.RECORD_STATUS, pageNo, pageRecordCnt, userId, userName, tag);
    history.push(`${process.env.PUBLIC_URL}`)
  }

  render() {
    return (
      <div className="popular_PopularTags_wrapper">
        <div className="right_side_title">
          POPULAR TAGS
                </div>
        <div className="right_side_divider"></div>
        <div className="Buttons">
          {this.props.popularTags.map((popularTag, idx) => {
            return (
              <ButtonTag
                handler={this.handler}
                status={this.props.tags_status[popularTag]}
                text={popularTag}
                key={idx}
                getNotebooklist={this.props.getNotebooklist}
                idx={idx} />
            );
          })}
        </div>
      </div>
    );
  }
}

export default PopularTags;