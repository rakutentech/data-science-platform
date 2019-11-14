import axios from "axios";

const KH_API_URL = process.env.REACT_APP_KH_API_URL;

export const GET_TAGS_BEGIN = "GET_TAGS_BEGIN";
const getPopularTagsBegin = () => {
  return {
    type: GET_TAGS_BEGIN
  };
};

export const GET_TAGS_SUCCESS = "GET_TAGS_SUCCESS";
const getPopularTagsSuccess = data => {
  return {
    type: GET_TAGS_SUCCESS,
    popularTags: data
  };
};

export const GET_TAGS_FAILURE = "GET_TAGS_FAILURE";
const getPopularTagsFailure = error => {
  return {
    type: GET_TAGS_FAILURE,
    error
  };
};


 export const getPopularTags = (userId) => {

  return dispatch => {
    dispatch(getPopularTagsBegin());
    let config = {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "Access-Control-Allow-Origin": "*",
        "Accept": "application/json",
        "UserId": userId
      }
    };

    const url = KH_API_URL + `populatedTags?limit=5`;
    return axios
      .get(
        url,
        config
      )
      .then(res => dispatch(getPopularTagsSuccess(res.data.data)))
      .catch(error => dispatch(getPopularTagsFailure(error)));
  };
 };
