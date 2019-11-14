import axios from "axios";

export const GET_LIST_BEGIN = "GET_LIST_BEGIN";
export const GET_LIST_SUCCESS = "GET_LIST_SUCCESS";

const getNotebookListSuccess = data => {
  return {
    type: GET_LIST_SUCCESS,
    notebookList: data.khNotebookBodyList,
    notebookInfo: {
      pageNo: data.pageNo,
      limit: data.limit,
      totalPages: data.totalPages,
      totalCount: data.totalCount,
      notebookList: data.khNotebookBodyList
    }
  };
};

const getNotebookTagsSuccess = data => {
  return data.data;
};

export const GET_LIST_FAILURE = "GET_LIST_FAILURE";
const getNotebookListFailure = error => {
  return {
    type: GET_LIST_FAILURE,
    error
  };
};

export const getNotebooklist = (recordStatus, pageNo, limit, userId, userName, tag = null, searchWord = null) => {
  return dispatch => {
    let config = {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "Accept": "application/json",
        "userId": userId,
        'userName': userName
      }
    };

    var url = process.env.REACT_APP_KH_API_URL + `notebooks?limit=${limit}&recordStatus=${recordStatus}${pageNo > 1 ? `&pageNo=${pageNo}` : ''}`;
    if (tag !== undefined && tag !== null) {
      url = process.env.REACT_APP_KH_API_URL + `notebooks/search?searchType=tag&recordStatus=${recordStatus}&tag=${tag}${pageNo > 1 ? `&pageNo=${pageNo}` : ''}`;
    } else if (searchWord !== undefined && searchWord !== null && searchWord !== '') {
      url = process.env.REACT_APP_KH_API_URL + `notebooks/search?recordStatus=${recordStatus}&keyword=${searchWord}${pageNo > 1 ? `&pageNo=${pageNo}` : ''}`;
    }

    return axios
      .get(
        url,
        config
      )
      .then(
        res => dispatch(getNotebookListSuccess(res.data.data)))
      .catch(error => dispatch(getNotebookListFailure(error)));
  };
};

const searchNotebookListByAuthorSuccess = data => {
  return {
    type: GET_LIST_SUCCESS,
    notebookList: data.khNotebookBodyList,
    notebookInfo: {
      pageNo: data.pageNo,
      limit: data.limit,
      totalPages: data.totalPages,
      totalCount: data.totalCount,
      notebookList: data.khNotebookBodyList
    }
  };
};

export const searchNotebookListByAuthor = (recordStatus, author, userId, userName, pageNo, limit) => {
  return dispatch => {
    let config = {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "Accept": "application/json",
        "userId": userId,
        'userName': userName
      }
    };

    var url = process.env.REACT_APP_KH_API_URL + `notebooks/search?searchType=author&author=${author}&recordStatus=${recordStatus}&pageNo=${pageNo}&limit=${limit}`;

    return axios
      .get(
        url,
        config
      )
      .then(
        res => dispatch(searchNotebookListByAuthorSuccess(res.data.data)))
      .catch(error => dispatch(getNotebookListFailure(error)));
  };
};

export const GET_DETAIL_BEGIN = "GET_DETAIL_BEGIN";
const getNotebookDetailBegin = () => {
  return {
    type: GET_DETAIL_BEGIN
  };
};

export const GET_DETAIL_SUCCESS = "GET_DETAIL_SUCCESS";
const getNotebookDetailSuccess = notebook => {
  return {
    type: GET_DETAIL_SUCCESS,
    notebookDetail: {
      notebookId: notebook.notebookId,
      title: notebook.title,
      subTitle: notebook.subTitle,
      keywords: notebook.keywords,
      createTime: notebook.createTime,
      updateTime: notebook.updateTime,
      recordStatus: notebook.recordStatus,
      path: notebook.path,
      notebookFilePath: notebook.notebookFilePath,
      authors: notebook.authors,
      authorIds: notebook.authorIds,
      tags: notebook.tags,
      comments: notebook.comments,
      existOne: notebook.existOne,
      viewCount: notebook.pageView
    }
  };
};

export const GET_DETAIL_FAILURE = "GET_DETAIL_FAILURE";
const getNotebookDetailFailure = error => {
  return {
    type: GET_DETAIL_FAILURE,
    error
  };
};

export const getNotebookDetail = (notebookId, recordStatus, userId, userName) => {
  return dispatch => {
    dispatch(getNotebookDetailBegin());

    let config = {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "Accept": "application/json",
        "userId": userId,
        'userName': userName
      }
    };

    return axios
      .get(
        process.env.REACT_APP_KH_API_URL + `notebooks/${notebookId}?recordStatus=${recordStatus}`,
        config
      )
      .then(
        // add page view count
        axios.put(process.env.REACT_APP_KH_API_URL + `notebooks/${notebookId}/pageView`, {}, config)
      )
      .then(res => dispatch(getNotebookDetailSuccess(res.data.data)))
      .catch(err => dispatch(getNotebookDetailFailure(err)));
  };
};

export const getTagsList = () => {
  return dispatch => {
    let config = {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "Accept": "application/json"
      }
    };

    let url = process.env.REACT_APP_KH_API_URL + `tags`;

    return axios
      .get(
        url,
        config
      )
      .then(
        res => dispatch(getNotebookTagsSuccess(res.data.data)))
      .catch(error => dispatch(getNotebookListFailure(error)));
  };
};