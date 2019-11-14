import React, { Component } from 'react';
import Avatar from 'react-avatar';

class UserAvatar extends Component {
  render() {
    const date_info = this.props.date_info ? (
      <span className='date_info'>{this.props.date_info}</span>
    ) : ''

    const avatar_size = this.props.avatar_size ? this.props.avatar_size : this.props.small ? 22 : 32
    let authors = this.props.authors
    let lngth = this.props.authors.length
    let avatar_photo = ''
    const no_photo = this.props.no_photo || false

    const num_author_shown = 3
    const extra_abbr = lngth > num_author_shown ? <span className="avatar_extra">and {lngth-num_author_shown} more</span>: ''
    const avatar_name = this.props.disable_name ? '' : (
      <span className="avatar_name">
        {authors.slice(0,num_author_shown).map((author, i) =>
            <a key={i} href={process.env.PUBLIC_URL + `/userposts?username=${author}`}>{author}</a>
        )}
        {date_info}
        {extra_abbr}
      </span>
    )     

    if (lngth > 1) {
      avatar_photo = <div style={{ display: 'inline', marginLeft: '15px' }} className="avatar_photo_wrapper">{authors.map((a, i) =>
        <Avatar key={i} style={{
          zIndex: lngth - i,
          marginLeft: '-15px',
          position: 'relative'
        }} className='avator_logo' size={avatar_size} round={true} name={a} />)}</div>
    } else {
      avatar_photo = <Avatar className='avator_logo' size={avatar_size} round={true} name={authors[0]} />
    }

    return (
      <span className="avatar">
        {no_photo ? '' : avatar_photo}
        {avatar_name}
      </span>
    );
  }
}

export default UserAvatar;