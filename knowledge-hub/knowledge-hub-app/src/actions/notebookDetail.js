import axios from "axios";

// PUBLISH COMMENT ==============================================
export const PUBLISH_COMMENT_BEGIN = "PUBLISH_COMMENT_BEGIN";
const publishCommentBegin = () => {
  return {
    type: PUBLISH_COMMENT_BEGIN
  };
};

export const PUBLISH_COMMENT_SUCCESS = "PUBLISH_COMMENT_SUCCESS";
const publishCommentSuccess = (data) => {
  return {
    type: PUBLISH_COMMENT_SUCCESS
  };
};

export const PUBLISH_COMMENT_FAILURE = "PUBLISH_COMMENT_FAILURE";
const publishCommentFailure = error => {
  return {
    type: PUBLISH_COMMENT_FAILURE,
    error: error
  };
};

export const publishComment = (notebookId, userId, userName, token, comment) => {
  return dispatch => {
    dispatch(publishCommentBegin());
    let config = {
      "headers": {
        "Content-Type": "text/html",
        "Accept": "application/json",
        "Authorization": "Bearer " + token,
        "userId": userId,
        'userName': userName
      },
      "params": {
        "userId": userId,
        "userName": userName
      }
    };
    return axios
      .post(
        `${process.env.REACT_APP_KH_API_URL}notebooks/${notebookId}/comments`,
        comment,
        config
      )
      .then(res => dispatch(publishCommentSuccess(res.data.data)))
      .catch(err => {
        if ((!err.response) || (err.response.status === 401)) {
          if (localStorage.getItem('old_action') !== 'publish_comment') {
            let current_url = process.env.REACT_APP_KH_HOST + window.location.pathname.slice(1) + window.location.search
            current_url = current_url.split('/').filter(function (item, i, allItems) {
              return i === allItems.indexOf(item);
            }).join('/');
            localStorage.setItem('old_url', current_url)
            localStorage.setItem('old_action', 'publish_comment')
            localStorage.setItem('old_action_data',JSON.stringify({ comment: comment }))
            window.location.assign(process.env.REACT_APP_LOGIN_API_URL)
            return 'token-auto-renew'
          } else {
            dispatch(publishCommentFailure(err))
            return null
          }
        } else {
          dispatch(publishCommentFailure(err))
          return null
        }
      });
  };
};


export const GET_MD_BEGIN = "GET_MD_BEGIN";
const getNotebookMDBegin = () => {
  return {
    type: GET_MD_BEGIN
  };
};

export const GET_MD_SUCCESS = "GET_MD_SUCCESS";
const getNotebookMDSuccess = data => {
  return {
    type: GET_MD_SUCCESS,
    notebookMD: data
  };
};

export const GET_MD_FAILURE = "GET_MD_FAILURE";
const getNotebookMDFailure = error => {
  return {
    type: GET_MD_FAILURE,
    error: error
  };
};

export const getNotebookMD = (filePath, userId, userName) => {
  return dispatch => {
    dispatch(getNotebookMDBegin());
    let config = {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "Accept": "application/json",
        "userId": userId,
        'userName': userName
      },
      params: {
        "filePath": filePath
      }
    };
    const url = process.env.REACT_APP_KH_API_URL + "files";
    return axios
      .get(
        url,
        config
      )
      .then(res => dispatch(getNotebookMDSuccess(res.data)))
      .catch(error => dispatch(getNotebookMDFailure(error)));
  };
};

// UPDATE COMMENT ==============================================
export const UPDATE_COMMENT_BEGIN = "UPDATE_COMMENT_BEGIN";
const updateCommentBegin = () => {
  return {
    type: UPDATE_COMMENT_BEGIN
  };
};

export const UPDATE_COMMENT_SUCCESS = "UPDATE_COMMENT_SUCCESS";
const updateCommentSuccess = (data) => {
  return {
    type: UPDATE_COMMENT_SUCCESS
  };
};

export const UPDATE_COMMENT_FAILURE = "UPDATE_COMMENT_FAILURE";
const updateCommentFailure = error => {
  return {
    type: UPDATE_COMMENT_FAILURE,
    error: error
  };
};

export const updateComment = (notebookId, userId, userName, token, comment, commentId) => {
  return dispatch => {
    dispatch(updateCommentBegin());
    let config = {
      "headers": {
        "Content-Type": "text/html",
        "Accept": "application/json",
        "Authorization": "Bearer " + token,
        "userId": userId,
        'userName': userName
      },
      "params": {
        "userId": userId,
        "userName": userName
      }
    };
    return axios
      .put(
        `${process.env.REACT_APP_KH_API_URL}notebooks/${notebookId}/comments/${commentId}`,
        comment,
        config
      )
      .then(res => dispatch(updateCommentSuccess(res.data.data)))
      .catch(err => {
        if ((!err.response) || (err.response.status === 401)) {
          if (localStorage.getItem('old_action') !== 'update_comment') {
            let current_url = process.env.REACT_APP_KH_HOST + window.location.pathname.slice(1) + window.location.search
            current_url = current_url.split('/').filter(function (item, i, allItems) {
              return i === allItems.indexOf(item);
            }).join('/');
            localStorage.setItem('old_url', current_url)
            localStorage.setItem('old_action', 'update_comment')
            localStorage.setItem('old_action_data', JSON.stringify({ comment: comment, commentId: commentId }))
            window.location.assign(process.env.REACT_APP_LOGIN_API_URL)
            return 'auto-token-renew'
          } else {
            dispatch(updateCommentFailure(err))
            return null
          }
        } else {
          dispatch(updateCommentFailure(err))
          return null
        }
      });
  };
};


// DELETE COMMENT ==============================================
export const DELETE_COMMENT_BEGIN = "DELETE_COMMENT_BEGIN";
const deleteCommentBegin = () => {
  return {
    type: DELETE_COMMENT_BEGIN
  };
};

export const DELETE_COMMENT_SUCCESS = "DELETE_COMMENT_SUCCESS";
const deleteCommentSuccess = (data) => {
  return {
    type: DELETE_COMMENT_SUCCESS
  };
};

export const DELETE_COMMENT_FAILURE = "DELETE_COMMENT_FAILURE";
const deleteCommentFailure = error => {
  return {
    type: DELETE_COMMENT_FAILURE,
    error: error
  };
};

export const deleteComment = (notebookId, userId, userName, token, commentId) => {
  return dispatch => {
    dispatch(deleteCommentBegin());
    let config = {
      "headers": {
        "Content-Type": "text/html",
        "Accept": "application/json",
        "Authorization": "Bearer " + token,
        "userId": userId,
        'userName': userName
      },
      "params": {
        "userId": userId,
        "userName": userName
      }
    };
    return axios
      .delete(
        `${process.env.REACT_APP_KH_API_URL}notebooks/${notebookId}/comments/${commentId}`,
        config
      )
      .then(res => dispatch(deleteCommentSuccess(res.data.data)))
      .catch(err => {
        if ((!err.response) || (err.response.status === 401)) {
          if (localStorage.getItem('old_action') !== 'delete_comment') {
            let current_url = process.env.REACT_APP_KH_HOST + window.location.pathname.slice(1) + window.location.search
            current_url = current_url.split('/').filter(function (item, i, allItems) {
              return i === allItems.indexOf(item);
            }).join('/');
            localStorage.setItem('old_url', current_url)
            localStorage.setItem('old_action', 'delete_comment')
            localStorage.setItem('old_action_data', JSON.stringify({ commentId: commentId }))
            window.location.assign(process.env.REACT_APP_LOGIN_API_URL)
            return 'auto-token-renew'
          } else {
            dispatch(deleteCommentFailure(err))
            return null
          }
        } else {
          dispatch(deleteCommentFailure(err))
          return null
        }
      });
  };
};

// PUBLISH NOTEBOOK ==============================================
export const PUBLISH_NOTEBOOK_BEGIN = "PUBLISH_NOTEBOOK_BEGIN";
const publishNotebookBegin = () => {
  return {
    type: PUBLISH_NOTEBOOK_BEGIN
  };
};

export const PUBLISH_NOTEBOOK_SUCCESS = "PUBLISH_NOTEBOOK_SUCCESS";
const publishNotebookSuccess = data => {
  return {
    type: PUBLISH_NOTEBOOK_SUCCESS,
    publishNotebookReturn: data
  };
};

export const PUBLISH_NOTEBOOK_FAILURE = "PUBLISH_NOTEBOOK_FAILURE";
const publishNotebookFailure = error => {
  return {
    type: PUBLISH_NOTEBOOK_FAILURE,
    error: error
  };
};

export const publishNotebook = (notebook_ID, userId, userName, token, update_data, change_type) => {
  let detail_url = process.env.REACT_APP_KH_HOST + 'detail?notebookId=' + notebook_ID

  const handleResponse = (response) => {
    if (response.includes(`doesn't have privilege`)) {
      alert(`Sorry, only the author can modify this post.`)
    } else {
      localStorage.setItem('notification_status', 'updated_success')
      if (window.location.href !== detail_url) {
        window.location.assign(detail_url)
      }
    }
  }

  return dispatch => {
    dispatch(publishNotebookBegin());
    let formData = new FormData();
    for (var key in update_data) {
      if (!update_data.hasOwnProperty(key)) continue;
      formData.append(key, update_data[key])
    }

    let http_method;
    if(change_type==='update') {
      http_method = 'patch'
    }else {
      http_method = 'put'
    }
    axios({
      method: http_method,
      url : `${process.env.REACT_APP_KH_API_URL}notebooks/${notebook_ID}`,
      data: formData,
      headers: {
        'Authorization': "Bearer " + token,
        "content-Type": 'multipart/form-data',
        'userId': userId,
        'userName': userName
      },
      params: {
        "userId": userId,
        "userName": userName
      }
    }).then(res => {
        handleResponse(res.data.data)
        dispatch(publishNotebookSuccess(res.data.data))
      })
      .catch(err => {
        if ((!err.response) || (err.response.status === 401)) {
          if (localStorage.getItem('old_action') !== 'publish_notebook') {
            localStorage.setItem('old_url', detail_url)
            localStorage.setItem('old_action', 'publish_notebook')
            localStorage.setItem('old_action_data', JSON.stringify(update_data))
            window.location.assign(process.env.REACT_APP_LOGIN_API_URL)
            return 'token-auto-renew'
          } else {
            dispatch(publishNotebookFailure())
          }
        } else {
          dispatch(publishNotebookFailure())
        }
      });
  }
};

// DELETE NOTEBOOK ==============================================
export const DELETE_NOTEBOOK_BEGIN = "DELETE_NOTEBOOK_BEGIN";
const deleteNotebookBegin = () => {
  return {
    type: DELETE_NOTEBOOK_BEGIN
  };
};

export const DELETE_NOTEBOOK_SUCCESS = "DELETE_NOTEBOOK_SUCCESS";
const deleteNotebookSuccess = data => {
  return {
    type: DELETE_NOTEBOOK_SUCCESS,
    deleteNotebookReturn: data
  };
};

export const DELETE_NOTEBOOK_FAILURE = "DELETE_NOTEBOOK_FAILURE";
const deleteNotebookFailure = error => {
  return {
    type: DELETE_NOTEBOOK_FAILURE,
    error: error
  };
};

export const deleteNotebook = (notebook_ID, userId, userName, token) => {
  const handleResponse = (response) => {
    if (response.includes(`doesn't have privilege`)) {
      alert(`Sorry, only the author can modify this post.`)
    } else if (window.location.pathname !== '/') {
      window.location.assign(process.env.REACT_APP_KH_HOST)
    }
  }

  return dispatch => {
    dispatch(deleteNotebookBegin());

    var config = {
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + token,
        "userId": userId,
        'userName': userName
      }
    };

    axios.delete(
      `${process.env.REACT_APP_KH_API_URL}notebooks/${notebook_ID}`,
      config
    )
      .then(res => {
        handleResponse(res.data.data)
        dispatch(deleteNotebookSuccess(res.data.data))
      })
      .catch(err => {
        if ((!err.response) || (err.response.status === 401)) {
          if (localStorage.getItem('old_action') !== 'delete_notebook') {
            localStorage.setItem('old_action', 'delete_notebook')
            localStorage.setItem('old_action_data', notebook_ID)
            window.location.assign(process.env.REACT_APP_LOGIN_API_URL)
            return 'token-auto-renew'
          } else {
            dispatch(deleteNotebookFailure())
          }
        } else {
          dispatch(deleteNotebookFailure())
        }
      });
  };
};