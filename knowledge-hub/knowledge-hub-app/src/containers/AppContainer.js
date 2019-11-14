// @flow
import { connect } from "react-redux";
import App from "../components/app";
import { simpleAction } from "../actions/simpleAction";

export function mapStateToProps(state) {
  return {
    ...state
  };
}

export function mapDispatchToProps(dispatch) {
  return {
    simpleAction: () => dispatch(simpleAction())
  };
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(App);
