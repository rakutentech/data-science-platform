import axios from "axios";

import { userConstants } from '../constants/userConstants';

export const userActions = {
  login,
  logout
};

function login(username, password) {
  return dispatch => {
    var user;
    var bodyFormData = new FormData();
    bodyFormData.set('client_id', 'system');
    bodyFormData.set('client_secret', 'system');
    bodyFormData.set('grant_type', 'password');
    bodyFormData.set('password', password);
    bodyFormData.set('username', username);

    // config
    const url = process.env.LOGIN_API_URL;
    let config = {
      headers: {
        "Content-Type": "multipart/form-data"
      }
    };

    return axios.post(
      url,
      bodyFormData,
      config
    ).then(function (response) {
      if (response.status !== 200) {
        if (response.status === 401) {
          logout();
          window.location.reload(true);
        }
        const error = (response.data && response.data.message) || response.statusText;
        return Promise.reject(error);
      }
      localStorage.setItem('user', response.data.data.access_token);
      user = response.data.data;
      user.username = username;

      dispatch(success(user));
    }).catch(function (error) {
      errorHandler(dispatch, error.response.statusText, userConstants.LOGIN_FAILURE, error)
    });
  };
};

// function request(user) { return { type: userConstants.LOGIN_REQUEST, user } }
function success(user) { return { type: userConstants.LOGIN_SUCCESS, user } }
// function failure(error) { return { type: userConstants.LOGIN_FAILURE, error } }


export function errorHandler(dispatch, errorText, type, error) {
  errorText = error.response ? error.response.data : error;

  // NOT AUTHENTICATED ERROR
  if (error.status === 401 || error.response.status === 401) {
    errorText = 'You are not authorized to do this.';
    logout();
  }

  dispatch({
    type: type,
    payload: errorText,
  });
}

function logout(token) {
  const url = process.env.REACT_APP_LOGOUT_API_URL;
  let current_url = process.env.REACT_APP_KH_HOST + window.location.pathname.slice(1) + window.location.search
  current_url = current_url.split('/').filter(function (item, i, allItems) {
    return i === allItems.indexOf(item);
  }).join('/');
  let headers = {
    "content-type": "multipart/form-data",
    'Authorization': 'Bearer ' + token,
  };
  let data = new FormData();

  data.set('client_id', 'knowledge-hub');
  data.set('client_secret', 'kHub@3$');

  axios.delete(url, { headers, data }).then(() => {
    window.location.assign(current_url)
  }
  ).catch((err) => {
  })

}


// updateNotification ==============================================
export const UPDATE_NOTIFICATION_BEGIN = "UPDATE_NOTIFICATION_BEGIN";
const updateNotificationBegin = () => {
  return {
    type: UPDATE_NOTIFICATION_BEGIN
  };
};

export const UPDATE_NOTIFICATION_SUCCESS = "UPDATE_NOTIFICATION_SUCCESS";
const updateNotificationSuccess = (data) => {
  return {
    type: UPDATE_NOTIFICATION_SUCCESS
  };
};

export const UPDATE_NOTIFICATION_FAILURE = "UPDATE_NOTIFICATION_FAILURE";
const updateNotificationFailure = error => {
  return {
    type: UPDATE_NOTIFICATION_FAILURE,
    error
  };
};

export const updateNotification = (userId, userName, token, update_data) => {
  return dispatch => {
    dispatch(updateNotificationBegin());
    let formData = new FormData();    //formdata object

    for (var key in update_data) {
      if (!update_data.hasOwnProperty(key)) continue;
      formData.append(key, update_data[key])
    }

    var config = {
      headers: {
        'Authorization': "Bearer " + token,
        "content-Type": 'multipart/form-data',
        "access-Control-Allow-Origin": "*",
        "accept": "application/json",
        'userId': userId,
        'userName': userName
      }
    };

    axios.put(
      `${process.env.REACT_APP_KH_API_URL}notifications/${userId}`,
      formData,
      config
    )
      .then(res => {
        dispatch(updateNotificationSuccess(res.data.data))
      })
      .catch(err => {
        dispatch(updateNotificationFailure(err))
        if (window.confirm('Token has expired, please login again.')) {
          let current_url = process.env.REACT_APP_KH_HOST + window.location.pathname.slice(1) + window.location.search
          current_url = current_url.split('/').filter(function (item, i, allItems) {
            return i === allItems.indexOf(item);
          }).join('/');
          localStorage.setItem('old_url', current_url)
          window.location.assign(process.env.REACT_APP_LOGIN_API_URL)
        }
      });
  };
};

// getNotificationSetting ==========================================
export const GET_NOTIFICATION_SETTINGS_BEGIN = "GET_NOTIFICATION_SETTINGS_BEGIN";
const getNotificationSettingsBegin = () => {
  return {
    type: GET_NOTIFICATION_SETTINGS_BEGIN
  };
};

export const GET_NOTIFICATION_SETTINGS_SUCCESS = "GET_NOTIFICATION_SETTINGS_SUCCESS";
const getNotificationSettingsSuccess = data => {
  return {
    type: GET_NOTIFICATION_SETTINGS_SUCCESS,
    notification_settings: data.data
  };
};

export const GET_NOTIFICATION_SETTINGS_FAILURE = "GET_NOTIFICATION_SETTINGS_FAILURE";
const getNotificationSettingsFailure = error => {
  return {
    type: GET_NOTIFICATION_SETTINGS_FAILURE,
    error
  };
};

export const getNotificationSettings = (userId, userName) => {
  return dispatch => {
    dispatch(getNotificationSettingsBegin());
    let config = {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "Access-Control-Allow-Origin": "*",
        "Accept": "application/json",
        "userId": userId,
        'userName': userName
      }
    };
    const url = `${process.env.REACT_APP_KH_API_URL}authors/${userId}/${userName}`;
    return axios
      .get(
        url,
        config
      )
      .then(res => dispatch(getNotificationSettingsSuccess(res.data)))
      .catch(error => dispatch(getNotificationSettingsFailure(error)));
  };
};


// initialAuthor ==============================================
export const SET_INITIAL_AUTHOR_BEGIN = "SET_INITIAL_AUTHOR_BEGIN";
const initialAuthorBegin = () => {
  return {
    type: SET_INITIAL_AUTHOR_BEGIN
  };
};

export const SET_INITIAL_AUTHOR_SUCCESS = "SET_INITIAL_AUTHOR_SUCCESS";
const initialAuthorSuccess = (data) => {
  return {
    type: SET_INITIAL_AUTHOR_SUCCESS
  };
};

export const SET_INITIAL_AUTHOR_FAILURE = "SET_INITIAL_AUTHOR_FAILURE";
const initialAuthorFailure = error => {
  return {
    type: SET_INITIAL_AUTHOR_FAILURE,
    error
  };
};

export const initialAuthor = (userId, userName, token) => {
  return dispatch => {
    dispatch(initialAuthorBegin());

    let config = {
      "headers": {
        "Content-Type": "text/html",
        "Accept": "application/json",
        "Authorization": "Bearer " + token,
        "userId": userId,
        'userName': userName
      },
      "params": {
        "authorIds": [userId],
        "authorNames": [userName]
      }
    };

    axios.post(
      `${process.env.REACT_APP_KH_API_URL}authors`,
      config.params,
      config
    )
      .then(res => dispatch(initialAuthorSuccess(res.data.data)))
      .catch(err => dispatch(initialAuthorFailure(err)));
  };
};