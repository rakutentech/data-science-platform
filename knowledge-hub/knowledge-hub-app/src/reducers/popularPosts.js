import {
  POPULAR_NOTEBOOKS_BEGIN,
  GET_POPULAR_NOTEBOOKS_SUCCESS,
  GET_POPULAR_NOTEBOOKS_FAILURE
} from "../actions/popularNotebooks";

type State = {
  isFetching: boolean,
  error: string,
  popularPosts: Object
}
const initalState = {
  isFetching: false,
  popularPosts: []
};

const popularPosts = (state: State = initalState, action) => {
  switch (action.type) {
    case POPULAR_NOTEBOOKS_BEGIN:
        return Object.assign({}, state, {
        isFetching: true
      });
    case GET_POPULAR_NOTEBOOKS_SUCCESS:
      return Object.assign({}, state, {
        isFetching: false,
        popularPosts: action.popularPosts
      });
    case GET_POPULAR_NOTEBOOKS_FAILURE:
      return Object.assign({}, state, {
        isFetching: false,
        error: action.error
      });
    default:
      return state;
  }
};

export default popularPosts;