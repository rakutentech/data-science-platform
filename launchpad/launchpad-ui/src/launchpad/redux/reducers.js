import {combineReducers} from 'redux';
import {withSuccessFailure} from '../helper';
import {apiConstant, dashboardConstant, modelConstant} from '../constants/app';
//dashboard
import dashboardModelNumber from './reducers/dashboard/modelNumber'
import dashboardApiNumber from './reducers/dashboard/apiNumber'
import dashboardModelList from './reducers/dashboard/modelList'
import dashboardApiList from './reducers/dashboard/apilList'

function fetchReducer(requestName, successName, failureName, initResource={ }) {
  const initState = {response: initResource, failure: false, loading: true};
  const reducer = (state=initState, action) => {
    switch (action.type) {
    case requestName:
      return state;
    case successName:
      return {
        response: action.data,
        failure: false
      };
    case failureName:
      setTimeout(() => {
        location.reload();
      },3500);
      return {
        failure: true,
        message: action.message
      };
    default:
      return state
    }
  };
  return reducer
}

function multipleFetchReducer(requestName, successName, failureName, initResource={status: null, message: '', res1: {data:[]}, res2: {data:[]}}) {
  const initState = {response: initResource, failure: false};
  const reducer = (state=initState, action) => {
    switch (action.type) {
    case requestName:
      return state;
    case successName:
      return {
        response: action.data,
        failure: false
      };
    case failureName:
      setTimeout(() => {
        location.reload();
      },3500);
      return {
        failure: true,
        message: action.message
      };
    default:
      return state
    }
  };
  return reducer
}

function executeReducer(request, success, failure){
  const initState = { action: '', failure: false, response: {data:''}, loading: true };
  const reducer = (state=initState, action) => {
    switch (action.type) {
    case request:
      return state;
    case success:
      return {
        action: 'success',
        failure: false,
        response: action.data,
        loading: false
      };
    case failure:
      setTimeout(() => {
        location.reload();
      },3500);
      return {
        action: 'failure',
        failure: true,
        message: action.message
      };
    default:
      return state
    }
  };
  return reducer
}

const combineReducer =  combineReducers({
  dashboardModelNumber: dashboardModelNumber(dashboardConstant),
  dashboardAPINumber: dashboardApiNumber(dashboardConstant),
  dashboardModelList: dashboardModelList(dashboardConstant),
  dashboardAPIList: dashboardApiList(dashboardConstant),
  modelList: fetchReducer(...withSuccessFailure(modelConstant.GET_MODEL_LIST)),
  modelInfo: fetchReducer(...withSuccessFailure(modelConstant.GET_MODEL_INFO)),
  modelVersionList: fetchReducer(...withSuccessFailure(modelConstant.GET_MODEL_VERSION_LIST)),
  modelPath: fetchReducer(...withSuccessFailure(modelConstant.GET_MODEL_PATH)),
  modelDetail: fetchReducer(...withSuccessFailure(modelConstant.GET_MODEL_DETAIL)),
  modelDelete: executeReducer(...withSuccessFailure(modelConstant.DELETE_MODEL_INFO)),
  apiCreateInfo: multipleFetchReducer(...withSuccessFailure(apiConstant.GET_MODEL_AND_VERSION)),
  apiCreate: executeReducer(...withSuccessFailure(apiConstant.ADD_API)),
  apiList: fetchReducer(...withSuccessFailure(apiConstant.GET_API_LIST)),
  apiDetail: fetchReducer(...withSuccessFailure(apiConstant.GET_API_DETAIL)),
  apiDelete: executeReducer(...withSuccessFailure(apiConstant.DELETE_API)),
  apiEdit: executeReducer(...withSuccessFailure(apiConstant.EDIT_API)),
});

export default combineReducer;
