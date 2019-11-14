// @flow
import { connect } from "react-redux";
import Notification from "../components/Notification";
import { updateNotification, getNotificationSettings } from "../actions/userAction";
import { bindActionCreators } from 'redux';

export function mapStateToProps(state) {
  return {
    notificationSettings: state.userActions.notification_settings,
  };
}

export function mapDispatchToProps(dispatch) {
  return {
    getNotificationSettings: bindActionCreators(getNotificationSettings, dispatch),
    updateNotification: bindActionCreators(updateNotification, dispatch),
  };
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Notification);
