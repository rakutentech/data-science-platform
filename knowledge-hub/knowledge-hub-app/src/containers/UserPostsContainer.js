// @flow
import { connect } from "react-redux";
import UserPosts from "../components/UserPosts";
import { searchNotebookListByAuthor } from "../actions/notebook";
import { bindActionCreators } from 'redux';

export function mapStateToProps(state) {
  return {
    notebookInfo: state.notebook.notebookInfo,
  };
}

export function mapDispatchToProps(dispatch) {
  return {
    searchNotebookListByAuthor: bindActionCreators(searchNotebookListByAuthor, dispatch),
  };
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(UserPosts);
