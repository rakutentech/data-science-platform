// @flow
import React from "react";
import DetailContent from "./detailContent";
import { parse } from "query-string";
//import { publishComment } from "../../actions/comment";

type Props = {
  notebookDetail: Object,
  notebookMD: string,
  publsihNotebookReturn: String,
  deleteNotebookReturn: String,
  getNotebookDetail: Function,
  publishComment: Function,
  updateComment: Function,
  deleteComment: Function,
  publishNotebook: Function,
  deleteNotebook: Function,
  getNotebookMD: Function,
  getTagsList: Function
};

type State = {};

export default class DetailNotebookPage extends React.Component<Props, State> {
  render() {
    const { location } = this.props;
    const query = parse(location.search);
    return (
      <div>
        <DetailContent
          notebookId={query.notebookId ? query.notebookId : ""}
          notebookDetail={this.props.notebookDetail}
          notebookMD={this.props.notebookMD}
          publsihNotebookReturn={this.props.publsihNotebookReturn}
          deleteNotebookReturn={this.props.deleteNotebookReturn}
          getNotebookDetail={this.props.getNotebookDetail}
          publishComment={this.props.publishComment}
          publishNotebook={this.props.publishNotebook}
          deleteNotebook={this.props.deleteNotebook}
          getNotebookMD={this.props.getNotebookMD}
          getTagsList={this.props.getTagsList}
          updateComment={this.props.updateComment}
          deleteComment={this.props.deleteComment}
        />
      </div>
    );
  }
}
