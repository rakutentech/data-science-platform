import React from "react";
import UserAvatar from "./UserInfoBlocks/UserAvatar";
import CardBlock from "./CardBlock";
import { userConstants } from '../constants/userConstants';
import { utils_general } from '../utils/general';
import Tags from "./modules/Tags";

class ListItem extends React.Component {

  relocationCard(href, e) {
    if (e.target.className !== 'tag') {
      window.location.assign(window.location.origin + href)
    }
  }

  handleChildClick(href, e) {
    e.stopPropagation();
    this.relocationCard(href.replace('detail', 'edit'), e)
  }

  EditPostBtn(href) {
    return (
      <div className="edit_post" onClick={this.handleChildClick.bind(this, href)}>
        <img src={process.env.PUBLIC_URL + '/edit_post.svg'} alt='' />
        <label>Edit Post</label>
      </div>
    )
  }

  render() {
    let is_my_posts = localStorage.getItem(userConstants.KEY_USER_NAME_DISPLAY) === utils_general.getQueryVariable('username') || window.location.search.length === 0
    let is_editable = window.location.href.includes('userposts') && is_my_posts
    const { title, href, time, authors, viewCount } = this.props;
    const no_tags = this.props.no_tags || false;
    //<CardBlock on_click={()=>this.relocationCard(href)}>
    return (
      <CardBlock on_click={this.relocationCard.bind(this, href)}>
        {/* <CardBlock> */}
        <React.Fragment>
          {/* <a href={href} className="card_item"> */}
          <div className="fb-800 fs-18 title">{title}</div>
          <div className="authors_n_date">
            <div className="meta">
              {time} · {viewCount} views · <UserAvatar no_photo small authors={authors}/>
            </div>
            <div className="tags">
              {no_tags || this.props.tags.length < 1 ? '' : <React.Fragment><img alt='' src={`${process.env.PUBLIC_URL}svg/Tag.svg`} /><Tags setHistoryState={this.props.setHistoryState} is_fragment tags={this.props.tags} getNotebooklist={this.props.getNotebooklist} /></React.Fragment>}
              {is_editable && this.EditPostBtn(href)}
            </div>
          </div>
          {/* </a> */}
        </React.Fragment>
      </CardBlock>
    );
  }
}

export default ListItem;
