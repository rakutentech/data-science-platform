// @flow
import { connect } from "react-redux";
import DetailNotebookPage from "../components/detailNotebookPage";
import { getNotebookDetail, getTagsList } from "../actions/notebook";
import { publishComment, updateComment, deleteComment, getNotebookMD, publishNotebook, deleteNotebook } from "../actions/notebookDetail";
import { bindActionCreators } from 'redux';

export function mapStateToProps(state) {
  return {
    notebookDetail: state.notebook.notebookDetail,
    notebookMD: state.detailContent.notebookMD,
    publishNotebookReturn: state.detailContent.publishNotebookReturn,
    deleteNotebookReturn: state.detailContent.deleteNotebookReturn
  };
}

export function mapDispatchToProps(dispatch) {
  return {
    getTagsList: bindActionCreators(getTagsList, dispatch),
    getNotebookDetail: bindActionCreators(getNotebookDetail, dispatch),
    publishComment: bindActionCreators(publishComment, dispatch),
    updateComment: bindActionCreators(updateComment, dispatch),
    deleteComment: bindActionCreators(deleteComment, dispatch),
    publishNotebook: bindActionCreators(publishNotebook, dispatch),
    deleteNotebook: bindActionCreators(deleteNotebook, dispatch),
    getNotebookMD: bindActionCreators(getNotebookMD, dispatch),
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(DetailNotebookPage);
