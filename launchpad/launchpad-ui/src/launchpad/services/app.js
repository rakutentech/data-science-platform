import config from 'config';
import {userConstants} from '../constants/app';
import {doDelete, doGet, doLogin, doPost, doPut, handleResponseWithLogout} from './utils'

export const userService = {
  login,
  logout,
  fetchResource,
  addResource,
  updateResource,
  deleteResource,
};
function login(username, password, rememberMe) {
  return doLogin(
    `${config.apiUrl}/auth`,
    userConstants.USER_TOKEN,
    username,
    password,
    rememberMe,
    handleResponse
  )
}

function fetchResource(url){
  return doGet(url, userConstants.USER_TOKEN, handleResponse)
}

function addResource(data, url){
  return doPost(data, url, userConstants.USER_TOKEN, handleResponse)
}

function updateResource(data, url){
  return doPut(data, url, userConstants.USER_TOKEN, handleResponse)
}

function deleteResource(data, url){
  return doDelete(data, url, userConstants.USER_TOKEN, handleResponse)
}

function logout() {
  // remove user from local storage to log user out
  localStorage.removeItem(userConstants.APP_USER);
  localStorage.removeItem(userConstants.USER_TOKEN);
}

function handleResponse(response) {
  return handleResponseWithLogout(response, logout)
}
