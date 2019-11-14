import {
  GET_TAGS_SUCCESS,
  GET_TAGS_FAILURE,
  GET_TAGS_BEGIN
} from "../actions/popularTags";

type State = {
  popularTags: Object,
  isFetching: boolean,
  error: string
}

const initalState = {
  isFetching: false,
  popularTags: []
};


const popularTags = (state: State = initalState, action) => {
  switch (action.type) {
    case GET_TAGS_BEGIN:
        return Object.assign({}, state, {
        isFetching: true
      });
    case GET_TAGS_SUCCESS:
      return Object.assign({}, state, {
        isFetching: false,
        popularTags: action.popularTags
      });
    case GET_TAGS_FAILURE:
      return Object.assign({}, state, {
        isFetching: false,
        error: action.error
      });
    default:
      return state;
  }
};

export default popularTags;