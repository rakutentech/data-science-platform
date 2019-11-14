import config from 'config';
import { adminConstants } from '../constants/admin';
import { handleResponseWithLogout, doLogin, doGet, doPost, doPut, doDelete  } from './utils'


export const adminService = {
  login,
  logout,
  fetchResource,
  addResource,
  updateResource,
  deleteResource
};

function login(username, password, rememberMe) {
  return doLogin(
    `${config.apiUrl}${config.adminPath}/auth`,
    adminConstants.ADMIN_TOKEN,
    username,
    password,
    rememberMe,
    handleResponse
  )
}

function fetchResource(url){
  return doGet(url, adminConstants.ADMIN_TOKEN, handleResponse)
}

function addResource(data, url){
  return doPost(data, url, adminConstants.ADMIN_TOKEN, handleResponse)
}

function updateResource(data, url){
  return doPut(data, url, adminConstants.ADMIN_TOKEN, handleResponse)
}

function deleteResource(data, url){
  return doDelete(data, url, adminConstants.ADMIN_TOKEN, handleResponse)
}

function logout() {
  // remove user from local storage to log user out
  localStorage.removeItem(adminConstants.ADMIN_TOKEN);
}

function handleResponse(response) {
  return handleResponseWithLogout(response, logout)
}