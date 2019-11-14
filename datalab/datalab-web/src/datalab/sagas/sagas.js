import { fork, put, call, take } from 'redux-saga/effects'
import actions from '../actions';
import config from 'config';
import { adminConstants } from '../constants/admin';
import { userConstants } from '../constants/app';
import { adminService } from '../services/admin';
import { userService } from '../services/app';
import { withSuccessFailure } from '../helper'

function fetchResourceFlow(requestName, successName, failureName, service, ...params) {
  function* flow(){
    while (true) {
      try{
        yield take(requestName);
        const data = yield call(service, ...params);
        yield put(actions.fetchResourceSuccess(successName, data))
      }catch(error){
        if(typeof error === 'string'){
          yield put(actions.fetchResourceFailure(failureName, error))
        }else{
          yield put(actions.fetchResourceFailure(failureName, error.message))
        }
      }
    }
  }
  return flow
}

function fetchResourceByPathFlow(requestName, successName, failureName, service, url) {
  function* flow(){
    while (true) {
      try{
        const action = yield take(requestName);
        const data = yield call(service, `${url}${action.path}`);
        yield put(actions.fetchResourceSuccess(successName, data))
      }catch(error){
        if(typeof error === 'string'){
          yield put(actions.fetchResourceFailure(failureName, error))
        }else{
          yield put(actions.fetchResourceFailure(failureName, error.message))
        }
      }
    }
  }
  return flow
}

function executeResourceActionFlow(requestName, successName, failureName, service, ...params) {
  function* flow(){
    while (true) {
      try{
        const action = yield take(requestName);
        yield call(service, action.data, ...params);
        yield put(actions.executeResourceActionSuccess(successName))
      }catch(error){
        if(typeof error === 'string'){
          yield put(actions.executeResourceActionFailure(failureName, error))
        }else{
          yield put(actions.executeResourceActionFailure(failureName, error.message))
        }
      }
    }
  }
  return flow
}

function executeResourceByPathFlow(requestName, successName, failureName, service, url) {
  function* flow(){
    while (true) {
      try{
        const action = yield take(requestName);
        yield call(service, action.data, `${url}${action.path}`);
        yield put(actions.executeResourceActionSuccess(successName))
      }catch(error){
        if(typeof error === 'string'){
          yield put(actions.executeResourceActionFailure(failureName, error))
        }else{
          yield put(actions.executeResourceActionFailure(failureName, error.message))
        }
      }
    }
  }
  return flow
}


function loginFlow(requestName, successName, failureName, service){
  function* flow() {
    while (true) {
      try{
        const action = yield take(requestName);
        yield call(service, action.username, action.password, action.rememberMe);
        yield put(actions.loginSuccess(successName))
      }catch(error){
        yield put(actions.loginFailure(failureName, error))
      }
    }
  }
  return flow
}

function logoutFlow(requestName, service) {
  function* flow(){
    while (true) {
      yield take(requestName);
      yield call(service)
    }
  } 
  return flow
}

const CRUDList = [
  {
    create: adminConstants.ADD_USER_SETTING_REQUEST,
    read: adminConstants.GET_USER_SETTINGS_REQUEST,
    update: adminConstants.UPDATE_USER_SETTING_REQUEST,
    delete: adminConstants.DELETE_USER_SETTING_REQUEST,
    service: adminService,
    url: `${config.apiUrl}${config.adminPath}/users`
  },
  {
    create: adminConstants.ADD_GROUP_SETTING_REQUEST,
    read: adminConstants.GET_GROUP_SETTINGS_REQUEST,
    update: adminConstants.UPDATE_GROUP_SETTING_REQUEST,
    delete: adminConstants.DELETE_GROUP_SETTING_REQUEST,
    service: adminService,
    url: `${config.apiUrl}${config.adminPath}/groups`
  },
  {
    create: adminConstants.ADD_DATALAB_SETTING_REQUEST,
    read: adminConstants.GET_DATALAB_SETTINGS_REQUEST,
    update: adminConstants.UPDATE_DATALAB_SETTING_REQUEST,
    delete: adminConstants.DELETE_DATALAB_SETTING_REQUEST,
    service: adminService,
    url: `${config.apiUrl}${config.adminPath}/datalab`
  },
  {
    create: adminConstants.ADD_DATALAB_GROUP_SETTING_REQUEST,
    read: adminConstants.GET_DATALAB_GROUP_SETTINGS_REQUEST,
    update: adminConstants.UPDATE_DATALAB_GROUP_SETTING_REQUEST,
    delete: adminConstants.DELETE_DATALAB_GROUP_SETTING_REQUEST,
    service: adminService,
    url: `${config.apiUrl}${config.adminPath}/datalabgroups`
  },
  {
    create: adminConstants.ADD_FUNCTION_SETTING_REQUEST,
    read: adminConstants.GET_FUNCTION_SETTINGS_REQUEST,
    update: adminConstants.UPDATE_FUNCTION_SETTING_REQUEST,
    delete: adminConstants.DELETE_FUNCTION_SETTING_REQUEST,
    service: adminService,
    url: `${config.apiUrl}${config.adminPath}/function`
  },
  {
    create: adminConstants.ADD_INSTANCE_TYPE_GROUP_SETTING_REQUEST,
    read: adminConstants.GET_INSTANCE_TYPE_GROUP_SETTINGS_REQUEST,
    update: adminConstants.UPDATE_INSTANCE_TYPE_GROUP_SETTING_REQUEST,
    delete: adminConstants.DELETE_INSTANCE_TYPE_GROUP_SETTING_REQUEST,
    service: adminService,
    url: `${config.apiUrl}${config.adminPath}/instancetypegroups`
  },
  {
    create: adminConstants.ADD_INSTANCE_TYPE_SETTING_REQUEST,
    read: adminConstants.GET_INSTANCE_TYPE_SETTINGS_REQUEST,
    update: adminConstants.UPDATE_INSTANCE_TYPE_SETTING_REQUEST,
    delete: adminConstants.DELETE_INSTANCE_TYPE_SETTING_REQUEST,
    service: adminService,
    url: `${config.apiUrl}${config.adminPath}/instancetypes`
  },
  {
    create: adminConstants.ADD_STORAGE_SETTING_REQUEST,
    read: adminConstants.GET_STORAGE_SETTINGS_REQUEST,
    update: adminConstants.UPDATE_STORAGE_SETTING_REQUEST,
    delete: adminConstants.DELETE_STORAGE_SETTING_REQUEST,
    service: adminService,
    url: `${config.apiUrl}${config.adminPath}/storages`
  },
  {
    create: userConstants.ADD_DATALAB_INSTANCE_REQUEST,
    read: userConstants.GET_DATALAB_INSTANCES_REQUEST,
    update: userConstants.UPDATE_DATALAB_INSTANCE_REQUEST,
    delete: userConstants.DELETE_DATALAB_INSTANCE_REQUEST,
    service: userService,
    url: `${config.apiUrl}/datalab/instances`
  },
  {
    create: userConstants.ADD_FUNCTION_INSTANCE_REQUEST,
    read: userConstants.GET_FUNCTION_INSTANCES_REQUEST,
    update: userConstants.UPDATE_FUNCTION_INSTANCE_REQUEST,
    delete: userConstants.DELETE_FUNCTION_INSTANCE_REQUEST,
    service: userService,
    url: `${config.apiUrl}/function/instances`
  }
]

export default function* rootSaga() {
  // User flow
  yield fork(loginFlow(
    ...withSuccessFailure(userConstants.LOGIN_REQUEST),
    userService.login
  ));
  yield fork(logoutFlow(
    userConstants.LOGOUT,
    userService.logout
  ));
  yield fork(fetchResourceFlow(
    ...withSuccessFailure(userConstants.GET_APP_DATALAB_SETTINGS_REQUEST),
    userService.fetchResource,
    `${config.apiUrl}/datalab`
  ));
  yield fork(fetchResourceFlow(
    ...withSuccessFailure(userConstants.GET_APP_FUNCTION_SETTINGS_REQUEST),
    userService.fetchResource,
    `${config.apiUrl}/function`
  ));
  yield fork(fetchResourceByPathFlow(
    ...withSuccessFailure(userConstants.GET_DATALAB_INSTANCE_REQUEST),
    userService.fetchResource,
    `${config.apiUrl}`
  ));
  yield fork(fetchResourceByPathFlow(
    ...withSuccessFailure(userConstants.GET_DATALAB_INSTANCE_LOG_REQUEST),
    userService.fetchResource,
    `${config.apiUrl}`
  ));
  yield fork(fetchResourceByPathFlow(
    ...withSuccessFailure(userConstants.GET_FUNCTION_INSTANCE_REQUEST),
    userService.fetchResource,
    `${config.apiUrl}`
  ));
  yield fork(fetchResourceByPathFlow(
    ...withSuccessFailure(userConstants.GET_FUNCTION_INSTANCE_LOG_REQUEST),
    userService.fetchResource,
    `${config.apiUrl}`
  ));
  yield fork(executeResourceByPathFlow(
    ...withSuccessFailure(userConstants.RESTART_FUNCTION_INSTANCE_REQUEST),
    userService.addResource,
    `${config.apiUrl}`
  ));
  yield fork(fetchResourceByPathFlow(
    ...withSuccessFailure(userConstants.GET_JOB_INSTANCES_REQUEST),
    userService.fetchResource,
    `${config.apiUrl}`
  ));
  yield fork(fetchResourceByPathFlow(
    ...withSuccessFailure(userConstants.GET_JOB_INSTANCE_REQUEST),
    userService.fetchResource,
    `${config.apiUrl}`
  ));
  yield fork(fetchResourceByPathFlow(
    ...withSuccessFailure(userConstants.GET_JOB_INSTANCE_LOG_REQUEST),
    userService.fetchResource,
    `${config.apiUrl}`
  ));
  yield fork(executeResourceByPathFlow(
    ...withSuccessFailure(userConstants.KILL_JOB_INSTANCE_REQUEST),
    userService.deleteResource,
    `${config.apiUrl}`
  ));
  yield fork(fetchResourceFlow(
    ...withSuccessFailure(userConstants.GET_APP_INSTANCE_TYPE_SETTINGS_REQUEST),
    userService.fetchResource,
    `${config.apiUrl}/instancetypes`
  ));
  yield fork(fetchResourceFlow(
    ...withSuccessFailure(userConstants.GET_APP_STORAGE_SETTINGS_REQUEST),
    userService.fetchResource,
    `${config.apiUrl}/storages`
  ));
  yield fork(fetchResourceFlow(
    ...withSuccessFailure(userConstants.GET_APP_RROFILE_REQUEST),
    userService.fetchResource,
    `${config.apiUrl}/profile`
  ));
  yield fork(fetchResourceFlow(
    ...withSuccessFailure(userConstants.GET_APP_RESOURCE_QUOTA_REQUEST),
    userService.fetchResource,
    `${config.apiUrl}/resourcequota`
  ));
  //Admin flow
  yield fork(loginFlow(
    ...withSuccessFailure(adminConstants.LOGIN_REQUEST),
    adminService.login
  ));
  yield fork(logoutFlow(
    adminConstants.LOGOUT,
    adminService.logout
  ));
  yield fork(fetchResourceFlow(
    ...withSuccessFailure(adminConstants.GET_CLUSTER_INFO_REQUEST),
    adminService.fetchResource,
    `${config.apiUrl}${config.adminPath}/clusterinfo`
  ));
  // Resource CRUD flow
  for(let i=0;i<CRUDList.length;i++){
    const resourceAction = CRUDList[i]
    yield fork(fetchResourceFlow(
      ...withSuccessFailure(resourceAction.read),
      resourceAction.service.fetchResource,
      resourceAction.url
    ));
    yield fork(executeResourceActionFlow(
      ...withSuccessFailure(resourceAction.create),
      resourceAction.service.addResource,
      resourceAction.url
    ));
    yield fork(executeResourceActionFlow(
      ...withSuccessFailure(resourceAction.update),
      resourceAction.service.updateResource,
      resourceAction.url
    ));
    yield fork(executeResourceActionFlow(
      ...withSuccessFailure(resourceAction.delete),
      resourceAction.service.deleteResource,
      resourceAction.url
    ));
  }
}