import { combineReducers } from 'redux';
import { adminConstants } from '../constants/admin';
import { userConstants } from '../constants/app';
import { withSuccessFailure } from '../helper';

/**
 * AuthRouter/Login works when authentication status chaned
 */
function authentication(loginName, successName, failureName, logoutName) {
  const reducer = (state={}, action) => {
    switch (action.type) {
    case loginName:
      return state;
    case successName:
      return {
        loggedIn: true,
        failure: false,
        logout: false
      };
    case failureName:
      return {
        loggedIn: false,
        failure: true,
        logout: false
      };
    case logoutName:
      return {
        loggedIn: false,
        failure: false,
        logout: true
      };
    default:
      return state
    }
  }
  return reducer
}



function fetchReducer(resourceName, requestName, successName, failureName, initResource=[]) {
  const initState = {[resourceName]: initResource, failure: false}
  const reducer = (state=initState, action) => {
    switch (action.type) {
    case requestName:
      return state;
    case successName:
      return {
        [resourceName]: action.data,
        failure: false
      };
    case failureName:
      return {
        dataLabSettings: [], 
        failure: true,
        message: action.message
      };
    default:
      return state
    }
  }
  return reducer
}

function executeReducer(request, success, failure, clearRequest){
  const initState = { action: '', failure: false}
  const reducer = (state=initState, action) => {
    switch (action.type) {
    case request:
      return state;
    case success:
      return {
        action: success,
        failure: false
      };
    case failure:
      return {
        action: failure,
        failure: true,
        message: action.message
      };
    case clearRequest:
      return initState
    default:
      return state
    }
  }
  return reducer
}

function changeReducer(
  addRequest,
  addSuccess,
  addFailure,
  updateRequest,
  updateSuccess,
  updateFailure,
  deleteRequest,
  deleteSuccess,
  deleteFailure,
  clearRequest) {
  const initState = { action: '', failure: false}
  const reducer = (state=initState, action) => {
    switch (action.type) {
    case addRequest:
      return state;
    case addSuccess:
      return {
        action: addSuccess,
        failure: false
      };
    case addFailure:
      return {
        action: addFailure,
        failure: true,
        message: action.message
      };
    case updateRequest:
      return state;
    case updateSuccess:
      return {
        action: updateSuccess,
        failure: false
      };
    case updateFailure:
      return {
        action: updateFailure,
        failure: true,
        message: action.message
      };
    case deleteRequest:
      return state;
    case deleteSuccess:
      return {
        action: deleteSuccess,
        failure: false
      };
    case deleteFailure:
      return {
        action: deleteFailure,
        failure: true,
        message: action.message
      };
    case clearRequest:
      return initState
    default:
      return state
    }
  }
  return reducer
}

const rootReducer = combineReducers({
  // User reducer
  authentication: authentication(
    ...withSuccessFailure(userConstants.LOGIN_REQUEST),
    userConstants.LOGOUT
  ),
  profile: fetchReducer(
    'profile',
    ...withSuccessFailure(userConstants.GET_APP_RROFILE_REQUEST),
    {}
  ),
  resourceQuota: fetchReducer(
    'resourceQuota',
    ...withSuccessFailure(userConstants.GET_APP_RESOURCE_QUOTA_REQUEST),
    {}
  ),
  appDataLabSettings: fetchReducer(
    'appDataLabSettings',
    ...withSuccessFailure(userConstants.GET_APP_DATALAB_SETTINGS_REQUEST),
  ),
  appFunctionSettings: fetchReducer(
    'appFunctionSettings',
    ...withSuccessFailure(userConstants.GET_APP_FUNCTION_SETTINGS_REQUEST),
  ),
  appInstanceTypeSettings: fetchReducer(
    'appInstanceTypeSettings',
    ...withSuccessFailure(userConstants.GET_APP_INSTANCE_TYPE_SETTINGS_REQUEST),
  ),
  appStorageSettings: fetchReducer(
    'appStorageSettings',
    ...withSuccessFailure(userConstants.GET_APP_STORAGE_SETTINGS_REQUEST),
  ),
  dataLabInstance: fetchReducer(
    'dataLabInstance',
    ...withSuccessFailure(userConstants.GET_DATALAB_INSTANCE_REQUEST),
    {}
  ),
  dataLabInstanceLog: fetchReducer(
    'dataLabInstanceLog',
    ...withSuccessFailure(userConstants.GET_DATALAB_INSTANCE_LOG_REQUEST),
    ''
  ),
  dataLabInstances: fetchReducer(
    'dataLabInstances',
    ...withSuccessFailure(userConstants.GET_DATALAB_INSTANCES_REQUEST),
  ),
  changeDataLabInstances: changeReducer(
    ...withSuccessFailure(userConstants.ADD_DATALAB_INSTANCE_REQUEST),
    ...withSuccessFailure(userConstants.UPDATE_DATALAB_INSTANCE_REQUEST),
    ...withSuccessFailure(userConstants.DELETE_DATALAB_INSTANCE_REQUEST),
    userConstants.CLEAR_APP_REQUEST
  ),
  functionInstance: fetchReducer(
    'functionInstance',
    ...withSuccessFailure(userConstants.GET_FUNCTION_INSTANCE_REQUEST),
    {}
  ),
  restartFunctionInstance: executeReducer(
    ...withSuccessFailure(userConstants.RESTART_FUNCTION_INSTANCE_REQUEST),
    userConstants.CLEAR_APP_REQUEST
  ),
  functionInstanceLog: fetchReducer(
    'functionInstanceLog',
    ...withSuccessFailure(userConstants.GET_FUNCTION_INSTANCE_LOG_REQUEST),
    ''
  ),
  functionInstances: fetchReducer(
    'functionInstances',
    ...withSuccessFailure(userConstants.GET_FUNCTION_INSTANCES_REQUEST),
  ),
  changeFunctionInstances: changeReducer(
    ...withSuccessFailure(userConstants.ADD_FUNCTION_INSTANCE_REQUEST),
    ...withSuccessFailure(userConstants.UPDATE_FUNCTION_INSTANCE_REQUEST),
    ...withSuccessFailure(userConstants.DELETE_FUNCTION_INSTANCE_REQUEST),
    userConstants.CLEAR_APP_REQUEST
  ),
  jobInstance: fetchReducer(
    'jobInstance',
    ...withSuccessFailure(userConstants.GET_JOB_INSTANCE_REQUEST),
    {}
  ),
  killJobInstance: executeReducer(
    ...withSuccessFailure(userConstants.KILL_JOB_INSTANCE_REQUEST),
    userConstants.CLEAR_APP_REQUEST
  ),
  jobInstanceLog: fetchReducer(
    'jobInstanceLog',
    ...withSuccessFailure(userConstants.GET_JOB_INSTANCE_LOG_REQUEST),
    ''
  ),
  jobInstances: fetchReducer(
    'jobInstances',
    ...withSuccessFailure(userConstants.GET_JOB_INSTANCES_REQUEST),
  ),
  // Admin reducer
  authenticationAdmin: authentication(
    ...withSuccessFailure(adminConstants.LOGIN_REQUEST),
    adminConstants.LOGOUT
  ),
  clusterInfo: fetchReducer(
    'clusterInfo',
    ...withSuccessFailure(adminConstants.GET_CLUSTER_INFO_REQUEST),
    {}
  ),
  userSettings: fetchReducer(
    'userSettings',
    ...withSuccessFailure(adminConstants.GET_USER_SETTINGS_REQUEST),
  ),
  changeUserSettings: changeReducer(
    ...withSuccessFailure(adminConstants.ADD_USER_SETTING_REQUEST),
    ...withSuccessFailure(adminConstants.UPDATE_USER_SETTING_REQUEST),
    ...withSuccessFailure(adminConstants.DELETE_USER_SETTING_REQUEST),
    adminConstants.CLEAR_ADMIN_REQUEST
  ),
  groupSettings: fetchReducer(
    'groupSettings',
    ...withSuccessFailure(adminConstants.GET_GROUP_SETTINGS_REQUEST),
  ),
  changeGroupSettings: changeReducer(
    ...withSuccessFailure(adminConstants.ADD_GROUP_SETTING_REQUEST),
    ...withSuccessFailure(adminConstants.UPDATE_GROUP_SETTING_REQUEST),
    ...withSuccessFailure(adminConstants.DELETE_GROUP_SETTING_REQUEST),
    adminConstants.CLEAR_ADMIN_REQUEST
  ),
  instanceTypeSettings: fetchReducer(
    'instanceTypeSettings',
    ...withSuccessFailure(adminConstants.GET_INSTANCE_TYPE_SETTINGS_REQUEST),
  ),
  changeInstanceTypeSettings: changeReducer(
    ...withSuccessFailure(adminConstants.ADD_INSTANCE_TYPE_SETTING_REQUEST),
    ...withSuccessFailure(adminConstants.UPDATE_INSTANCE_TYPE_SETTING_REQUEST),
    ...withSuccessFailure(adminConstants.DELETE_INSTANCE_TYPE_SETTING_REQUEST),
    adminConstants.CLEAR_ADMIN_REQUEST
  ),
  instanceTypeGroupSettings: fetchReducer(
    'instanceTypeGroupSettings',
    ...withSuccessFailure(adminConstants.GET_INSTANCE_TYPE_GROUP_SETTINGS_REQUEST),
  ),
  changeInstanceTypeGroupSettings: changeReducer(
    ...withSuccessFailure(adminConstants.ADD_INSTANCE_TYPE_GROUP_SETTING_REQUEST),
    ...withSuccessFailure(adminConstants.UPDATE_INSTANCE_TYPE_GROUP_SETTING_REQUEST),
    ...withSuccessFailure(adminConstants.DELETE_INSTANCE_TYPE_GROUP_SETTING_REQUEST),
    adminConstants.CLEAR_ADMIN_REQUEST
  ),
  storageSettings: fetchReducer(
    'storageSettings',
    ...withSuccessFailure(adminConstants.GET_STORAGE_SETTINGS_REQUEST),
  ),
  changeStorageSettings: changeReducer(
    ...withSuccessFailure(adminConstants.ADD_STORAGE_SETTING_REQUEST),
    ...withSuccessFailure(adminConstants.UPDATE_STORAGE_SETTING_REQUEST),
    ...withSuccessFailure(adminConstants.DELETE_STORAGE_SETTING_REQUEST),
    adminConstants.CLEAR_ADMIN_REQUEST
  ),
  dataLabSettings: fetchReducer(
    'dataLabSettings',
    ...withSuccessFailure(adminConstants.GET_DATALAB_SETTINGS_REQUEST),
  ),
  changeDataLabSettings: changeReducer(
    ...withSuccessFailure(adminConstants.ADD_DATALAB_SETTING_REQUEST),
    ...withSuccessFailure(adminConstants.UPDATE_DATALAB_SETTING_REQUEST),
    ...withSuccessFailure(adminConstants.DELETE_DATALAB_SETTING_REQUEST),
    adminConstants.CLEAR_ADMIN_REQUEST
  ),
  dataLabGroupSettings: fetchReducer(
    'dataLabGroupSettings',
    ...withSuccessFailure(adminConstants.GET_DATALAB_GROUP_SETTINGS_REQUEST),
  ),
  changeDataLabGroupSettings: changeReducer(
    ...withSuccessFailure(adminConstants.ADD_DATALAB_GROUP_SETTING_REQUEST),
    ...withSuccessFailure(adminConstants.UPDATE_DATALAB_GROUP_SETTING_REQUEST),
    ...withSuccessFailure(adminConstants.DELETE_DATALAB_GROUP_SETTING_REQUEST),
    adminConstants.CLEAR_ADMIN_REQUEST
  ),
  functionSettings: fetchReducer(
    'functionSettings',
    ...withSuccessFailure(adminConstants.GET_FUNCTION_SETTINGS_REQUEST),
  ),
  changeFunctionSettings: changeReducer(
    ...withSuccessFailure(adminConstants.ADD_FUNCTION_SETTING_REQUEST),
    ...withSuccessFailure(adminConstants.UPDATE_FUNCTION_SETTING_REQUEST),
    ...withSuccessFailure(adminConstants.DELETE_FUNCTION_SETTING_REQUEST),
    adminConstants.CLEAR_ADMIN_REQUEST
  )
});

export default rootReducer;