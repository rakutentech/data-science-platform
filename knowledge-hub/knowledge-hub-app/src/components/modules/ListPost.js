import React from "react";

class ListPost extends React.Component {
  render() {
    function getPostIndex(index) {
      index = index + 1;
      if (index < 10) {
        return 0 + index.toString();
      }
      return index.toString();
    }
    const { index, title, time, viewCount, id, authors } = this.props;   
    let lngth = this.props.authors.length 
    const num_author_shown = 3;
    const extra_abbr = lngth > num_author_shown ? <span className="avatar_extra">and {lngth-num_author_shown} more</span>: '';
    return (
      <div className="popular_post">
        <div className="popular_post_counter">{getPostIndex(index)}</div>
        <div className="popular_post_info">
          <a className="popular_post_title" href={process.env.PUBLIC_URL + `/detail?notebookId=${id.notebookId}`}>{title}</a>
          <div className="popular_post_author">
            {authors.slice(0,num_author_shown).map((author, i) =>
              <a key={i} href={process.env.PUBLIC_URL + `/userposts?username=${author}`}>{author}</a>
            )}
            {extra_abbr}
          </div>
          <div className="popular_post_date">{time} · {viewCount} views</div>
        </div>
      </div>
    );
  }
};

export default ListPost;
