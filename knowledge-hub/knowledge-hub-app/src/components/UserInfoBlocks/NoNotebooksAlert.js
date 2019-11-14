import React, { Component } from 'react';
import { userConstants } from '../../constants/userConstants';

class NoNotebooksAlert extends Component {
  render() {
    const { userName, searchKeyword } = this.props
    const myName = localStorage.getItem(userConstants.KEY_USER_NAME_DISPLAY)
    const user_text = userName === myName ? 'You have' : `${userName} has`
    let no_post_text = <div className="notebook_list_no_posts_name">{user_text} no post</div>
    let no_results_sub_text = <span>Create your instance and publish the notebook from<a href="http://datalab.com" target="_blank" rel="noopener noreferrer">DataLab</a></span>
    if (searchKeyword !== '') {
      no_post_text = <div className="notebook_list_no_posts_name">No result for keyword “<span className='searchKeyword'>{searchKeyword}</span>”</div>
      no_results_sub_text = 'Please try other keywords or browse the popular tags on the sidebar.'
    } else if (userName === undefined) {
      no_post_text = <div className="notebook_list_no_posts_name">Loading ...</div>
      no_results_sub_text = ''
    }

    return (
      <div className="notebook_list_no_posts">
        {no_post_text}
        <div className="notebook_list_no_posts_create">
          {no_results_sub_text}
        </div>
      </div>
    );
  }
}

export default NoNotebooksAlert;