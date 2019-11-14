import React, { Component } from 'react';
import ListPost from "./modules/ListPost"
import moment from "moment";

class PopularPosts extends Component {
    render() {
        return (
        <div className="popular_posts_wrapper">
            <div className="right_side_title">
              POPULAR POSTS
            </div>
            <div className="right_side_divider"></div>
            <div className="popular_posts_list">
              {this.props.popularPosts &&
                this.props.popularPosts.map((list, idx) => {
                  const idxKey = `CardInfo${idx}`;
                  return (
                    <ListPost
                      index={idx}
                      key={idxKey}
                      title={list.title}
                      id={list.id}
                      time={moment(list.createTime).format("MMM DD, YYYY")}
                      viewCount={list.pageView ? list.pageView : 0}
                      authors={list.authors}
                    />
                  );
                })}
            </div>
          </div>
        );
    }
}

export default PopularPosts;