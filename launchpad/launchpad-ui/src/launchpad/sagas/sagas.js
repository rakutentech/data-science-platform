import {call, fork, put, take} from 'redux-saga/effects'
import actions from '../actions';
import config from 'config';
import {apiConstant, modelConstant} from '../constants/app';
import {userService} from '../services/app';
import {withSuccessFailure} from '../helper'
import {NotificationManager} from 'react-notifications';

function fetchResourceFlow(requestName, successName, failureName, service, ...params) {
  function* flow() {
    while (true) {
      try {
        yield take(requestName);
        const data = yield call(service, ...params);
        yield put(actions.fetchResourceSuccess(successName, data))
      } catch (error) {
        NotificationManager.error(error.message, error.error, 3000);
        if (typeof error === 'string') {
          yield put(actions.fetchResourceFailure(failureName, error))
        } else {
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
      try {
        const action = yield take(requestName);
        const data = yield call(service, `${url}${action.path}`);
        yield put(actions.fetchResourceSuccess(successName, data))
      } catch (error) {
        NotificationManager.error(error.message, error.error, 3000);
        if (typeof error === 'string') {
          yield put(actions.fetchResourceFailure(failureName, error))
        } else {
          yield put(actions.fetchResourceFailure(failureName, error.message))
        }
      }
    }
  }
  return flow
}

function multipleFetchResourceByIdFlow(requestName, successName, failureName, service, url1, url2) {
  function* flow() {
    while (true) {
      try {
        yield take(requestName);
        const res1 = yield call(service, url1);
        const secondRequest = url2.replace(/id/, `${res1.data[0].id}`);
        const res2 = yield call(service, secondRequest);
        const response = {res1: res1, res2: res2};
        yield put(actions.fetchResourceSuccess(successName, response))
      } catch (error) {
        NotificationManager.error(error.message, error.error, 3000);
        if (typeof error === 'string') {
          yield put(actions.fetchResourceFailure(failureName, error))
        } else {
          yield put(actions.fetchResourceFailure(failureName, error.message))
        }
      }
    }
  }
  return flow
}

function executeResourceActionFlow(requestName, successName, failureName, service, ...params) {
  function* flow() {
    while (true) {
      try {
        const action = yield take(requestName);
        yield call(service, action.data, ...params);
        yield put(actions.executeResourceActionSuccess(successName))
      } catch (error) {
        NotificationManager.error(error.message, error.error, 3000);
        if (typeof error === 'string') {
          yield put(actions.executeResourceActionFailure(failureName, error))
        } else {
          yield put(actions.executeResourceActionFailure(failureName, error.message))
        }
      }
    }
  }
  return flow
}

function executeResourceByPathFlow(requestName, successName, failureName, service, url) {
  function* flow() {
    while (true) {
      try {
        const action = yield take(requestName);
        yield call(service, action.data, `${url}${action.path}`);
        yield put(actions.executeResourceActionSuccess(successName))
      } catch (error) {
        NotificationManager.error(error.message, error.error, 3000);
        if (typeof error === 'string') {
          yield put(actions.executeResourceActionFailure(failureName, error))
        } else {
          yield put(actions.executeResourceActionFailure(failureName, error.message))
        }
      }
    }
  }
  return flow
}

export default function* rootSaga() {
  yield fork(fetchResourceFlow(
    ...withSuccessFailure(modelConstant.GET_MODEL_LIST),
    userService.fetchResource,
    `${config.apiUrl}/v1/models`
  ));
  yield fork(fetchResourceByPathFlow(
    ...withSuccessFailure(modelConstant.GET_MODEL_INFO),
    userService.fetchResource,
    `${config.apiUrl}/v1/models/`
  ));
  yield fork(fetchResourceByPathFlow(
    ...withSuccessFailure(modelConstant.GET_MODEL_VERSION_LIST),
    userService.fetchResource,
    `${config.apiUrl}/v1/models/`
  ));
  yield fork(fetchResourceByPathFlow(
    ...withSuccessFailure(modelConstant.GET_MODEL_DETAIL),
    userService.fetchResource,
    `${config.apiUrl}/v1/models/`
  ));
  yield fork(executeResourceByPathFlow(
    ...withSuccessFailure(modelConstant.DELETE_MODEL_INFO),
    userService.deleteResource,
    `${config.apiUrl}/v1/models/`
  ));
  yield fork(multipleFetchResourceByIdFlow(
    ...withSuccessFailure(apiConstant.GET_MODEL_AND_VERSION),
    userService.fetchResource,
    `${config.apiUrl}/v1/models/list`,
    `${config.apiUrl}/v1/models/id/versions/list`
  ));
  yield fork(fetchResourceByPathFlow(
    ...withSuccessFailure(modelConstant.GET_MODEL_PATH),
    userService.fetchResource,
    `${config.apiUrl}/v1/models/`
  ));
  yield fork(fetchResourceByPathFlow(
    ...withSuccessFailure(apiConstant.GET_API_LIST),
    userService.fetchResource,
    `${config.apiUrl}/v1/api/`
  ));
  yield fork(fetchResourceByPathFlow(
    ...withSuccessFailure(apiConstant.GET_API_DETAIL),
    userService.fetchResource,
    `${config.apiUrl}/v1/api/`
  ));
  yield fork(executeResourceActionFlow(
    ...withSuccessFailure(apiConstant.ADD_API),
    userService.addResource,
    `${config.apiUrl}/v1/api`,
  ));
  yield fork(executeResourceByPathFlow(
    ...withSuccessFailure(apiConstant.DELETE_API),
    userService.deleteResource,
    `${config.apiUrl}/v1/api`,
  ));
  yield fork(executeResourceActionFlow(
    ...withSuccessFailure(apiConstant.EDIT_API),
    userService.updateResource,
    `${config.apiUrl}/v1/api`,
  ));
}
