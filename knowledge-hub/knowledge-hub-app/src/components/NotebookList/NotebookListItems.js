import React, { Component } from 'react';
import moment from "moment";
import ListItem from "../ListItem";
import Pagination from "../Pagination";
import NoNotebooksAlert from '../UserInfoBlocks/NoNotebooksAlert';

class NotebookListItems extends Component {

  render() {
    const {
      pageNo,
      limit,
      totalPages,
      totalCount,
      notebookList,
    } = this.props.notebookInfo;

    const no_tags = this.props.no_tags || false;

    const makeTotalText = () => {
      if (totalCount !== undefined && totalCount !== null) {
        const page = pageNo ? pageNo - 1 : 0;
        const from = page * limit + 1;
        const to =
          (page + 1) * limit < totalCount ? (page + 1) * limit : totalCount;
        return `${from}-${to} of over ${totalCount} notebooks`;
      } else {
        return `0-0 of over 0 notebooks`;
      }
    };

    const searchKeyword = this.props.searchKeyword || ''

    if (notebookList === undefined || notebookList.length === 0) {
      return <NoNotebooksAlert is_main_page searchKeyword={searchKeyword} userName={this.props.userName} />
    } else {
      return (
        <div className="listItems">
          <div className="listCount"> {makeTotalText()} </div>
          {notebookList &&
            notebookList.map((list, idx) => {
              const idxKey = `CardInfo${idx}`;

              return (
                <ListItem
                  setHistoryState={this.props.setHistoryState}
                  key={idxKey}
                  no_tags={no_tags}
                  title={list.title}
                  href={process.env.PUBLIC_URL + `/detail?notebookId=${list.notebookId}`}
                  time={moment(list.updatedTime).format("MMM DD, YYYY")}
                  viewCount={list.pageView ? list.pageView : 0}
                  tags={list.tags}
                  authors={list.authors}
                  getNotebooklist={this.props.getNotebooklist}
                />
              );
            })}
          <div className="pagination">
            <Pagination
              pageNo={pageNo}
              totalPages={totalPages}
              totalCount={totalCount}
              limit={limit}
              onPageChange={this.props.onPageChange}
            />
          </div>
        </div>
      );
    }
  }
}

export default NotebookListItems;