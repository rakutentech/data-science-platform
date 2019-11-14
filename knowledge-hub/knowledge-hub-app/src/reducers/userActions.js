import {
  SET_INITIAL_AUTHOR_BEGIN,
  SET_INITIAL_AUTHOR_SUCCESS,
  SET_INITIAL_AUTHOR_FAILURE,
  UPDATE_NOTIFICATION_BEGIN,
  UPDATE_NOTIFICATION_SUCCESS,
  UPDATE_NOTIFICATION_FAILURE,
  GET_NOTIFICATION_SETTINGS_BEGIN,
  GET_NOTIFICATION_SETTINGS_SUCCESS,
  GET_NOTIFICATION_SETTINGS_FAILURE
} from "../actions/userAction";

const initalState = {
  isFetching: false,
};

const notificationSettings = (state = initalState, action) => {
  switch (action.type) {
    case SET_INITIAL_AUTHOR_BEGIN:
      return Object.assign({}, state, {
        isFetching: true
      });
    case SET_INITIAL_AUTHOR_SUCCESS:
      return Object.assign({}, state, {
        isFetching: false,
      });
    case SET_INITIAL_AUTHOR_FAILURE:
      return Object.assign({}, state, {
        isFetching: false,
        error: action.error
      });
    case UPDATE_NOTIFICATION_BEGIN:
      return Object.assign({}, state, {
        isFetching: true
      });
    case UPDATE_NOTIFICATION_SUCCESS:
      return Object.assign({}, state, {
        isFetching: false,
      });
    case UPDATE_NOTIFICATION_FAILURE:
      return Object.assign({}, state, {
        isFetching: false,
        error: action.error
      });
    case GET_NOTIFICATION_SETTINGS_BEGIN:
      return Object.assign({}, state, {
        isFetching: true
      });
    case GET_NOTIFICATION_SETTINGS_SUCCESS:
      return Object.assign({}, state, {
        isFetching: false,
        notification_settings: action.notification_settings
      });
    case GET_NOTIFICATION_SETTINGS_FAILURE:
      return Object.assign({}, state, {
        isFetching: false,
        error: action.error
      });
    default:
      return state;
  }
};

export default notificationSettings;
