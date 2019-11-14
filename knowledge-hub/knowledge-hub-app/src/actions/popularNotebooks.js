import axios from "axios";

const KH_API_URL = process.env.REACT_APP_KH_API_URL;

export const POPULAR_NOTEBOOKS_BEGIN = "GET_TAGS_BEGIN";
const getPopularNotebooksBegin = () => {
  return {
    type: POPULAR_NOTEBOOKS_BEGIN
  };
};

export const GET_POPULAR_NOTEBOOKS_SUCCESS = "GET_POPULAR_NOTEBOOKS_SUCCESS";
const getPopularNotebooksSuccess = data => {
  return {
    type: GET_POPULAR_NOTEBOOKS_SUCCESS,
    popularPosts: data
  };
};

export const GET_POPULAR_NOTEBOOKS_FAILURE = "GET_POPULAR_NOTEBOOKS_FAILURE";
const getPopularNotebooksFailure = error => {
  return {
    type: GET_POPULAR_NOTEBOOKS_FAILURE,
    error
  };
};


 export const getPopularNotebooks = (userId) => {

  return dispatch => {
    dispatch(getPopularNotebooksBegin());
    let config = {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "Access-Control-Allow-Origin": "*",
        "Accept": "application/json",
        "UserId": userId
      }
    };

    const url = KH_API_URL + `populatedNotebooks?limit=10`;
    return axios
      .get(
        url,
        config
      )
      .then(res => dispatch(getPopularNotebooksSuccess(res.data.data)))
      .catch(error => dispatch(getPopularNotebooksFailure(error)));
  };
 };


