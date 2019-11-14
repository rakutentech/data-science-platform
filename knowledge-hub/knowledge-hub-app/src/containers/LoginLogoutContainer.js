// @flow
import { connect } from "react-redux";
import LoginLogout from "../components/LoginLogout";
import { initialAuthor } from "../actions/userAction";
import { bindActionCreators } from 'redux';

export function mapStateToProps(state) {
  return {
  };
}

export function mapDispatchToProps(dispatch) {
  return {
    setInitialAuthor: bindActionCreators(initialAuthor, dispatch),
  };
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(LoginLogout);

