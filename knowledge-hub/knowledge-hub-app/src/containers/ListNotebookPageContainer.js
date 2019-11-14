// @flow
import { connect } from "react-redux";
import ListNotebookPage from "../components/ListNoteBookPage";
import { getNotebooklist } from "../actions/notebook";
import { getPopularTags } from "../actions/popularTags";
import { getPopularNotebooks } from "../actions/popularNotebooks"
import { bindActionCreators } from 'redux';

type notebook = {
  notebookId: string,
  title: string,
  author: string,
  likeCount: number,
  updatedUser: string,
  updatedTime: string
};

type notebookInfo = {
  pageNo: number,
  limit: number,
  totalPages: number,
  totalCount: number,
  notebookList: Array<notebook>
};

type State = {
  notebookInfo: notebookInfo,
  popularTags: popularTags,
  popularPosts: popularPosts,
  searchKeyword: searchKeyword,
};

export function mapStateToProps(state: State, props) {
  return {
    notebookInfo: state.notebook.notebookInfo,
    popularTags: state.popularTags,
    popularPosts: state.popularPosts,
    searchKeyword: props.searchKeyword,
  };
}

export function mapDispatchToProps(dispatch: Function) {
  return {
    getNotebooklist: bindActionCreators(getNotebooklist, dispatch),
    getPopularTags: bindActionCreators(getPopularTags, dispatch),
    getPopularNotebooks: bindActionCreators(getPopularNotebooks, dispatch)
  };
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ListNotebookPage);
