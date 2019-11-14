

function login(actionName, username, password, rememberMe) {
  return { type: actionName, username, password, rememberMe }
}

function logout(actionName) {
  return { type: actionName };
}

function loginSuccess(actionName) {
  return { type: actionName };
}

function loginFailure(actionName, message) {
  return { type: actionName, message };
}

function fetchResource(actionName){
  return { type: actionName }
}

function fetchResourceByPath(actionName, path){
  return { type: actionName, path}
}
  
function fetchResourceSuccess(actionName, data){
  return { type: actionName, data };
}
  
function fetchResourceFailure(actionName, message){
  return { type: actionName, message };
}

function executeResourceAction(actionName, data){
  return { type: actionName, data }
}

function executeResourceActionByPath(actionName, path, data={}){
  return { type: actionName, path, data }
}

function executeResourceActionSuccess(actionName) {
  return { type: actionName};
}

function executeResourceActionFailure(actionName, message) {
  return { type: actionName, message };
}

function clearResourceAction(actionName){
  return { type: actionName };
}

const actions = {
  login,
  loginSuccess,
  loginFailure,
  logout,
  fetchResource,
  fetchResourceByPath,
  fetchResourceSuccess,
  fetchResourceFailure,
  executeResourceAction,
  executeResourceActionByPath,
  executeResourceActionSuccess,
  executeResourceActionFailure,
  clearResourceAction
}

export default actions