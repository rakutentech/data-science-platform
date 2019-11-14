import {
  PUBLISH_COMMENT_BEGIN,
  PUBLISH_COMMENT_SUCCESS,
  PUBLISH_COMMENT_FAILURE,
  UPDATE_COMMENT_BEGIN,
  UPDATE_COMMENT_SUCCESS,
  UPDATE_COMMENT_FAILURE,
  DELETE_COMMENT_BEGIN,
  DELETE_COMMENT_SUCCESS,
  DELETE_COMMENT_FAILURE,
  GET_MD_BEGIN,
  GET_MD_SUCCESS,
  GET_MD_FAILURE,
  PUBLISH_NOTEBOOK_BEGIN,
  PUBLISH_NOTEBOOK_SUCCESS,
  PUBLISH_NOTEBOOK_FAILURE,
  DELETE_NOTEBOOK_BEGIN,
  DELETE_NOTEBOOK_SUCCESS,
  DELETE_NOTEBOOK_FAILURE
} from "../actions/notebookDetail";

type State = {
  notebookMD: string,
  publishNotebookReturn: string,
  deleteNotebookReturn: string,
  isFetching: boolean,
  error: string
};

const initalState = {
  isFetching: false,
  notebookMD: '',
  publishNotebookReturn: '',
  deleteNotebookReturn: '',
  error: ''
};

const detailContent = (state: State = initalState, action) => {
  switch (action.type) {
    case PUBLISH_COMMENT_BEGIN:
      return Object.assign({}, state, {
        isFetching: true
      });
    case PUBLISH_COMMENT_SUCCESS:
      return Object.assign({}, state, {
        isFetching: false,
      });
    case PUBLISH_COMMENT_FAILURE:
      return Object.assign({}, state, {
        isFetching: false,
        error: action.error
      });
    case UPDATE_COMMENT_BEGIN:
      return Object.assign({}, state, {
        isFetching: true
      });
    case UPDATE_COMMENT_SUCCESS:
      return Object.assign({}, state, {
        isFetching: false,
      });
    case UPDATE_COMMENT_FAILURE:
      return Object.assign({}, state, {
        isFetching: false,
        error: action.error
      });
    case DELETE_COMMENT_BEGIN:
      return Object.assign({}, state, {
        isFetching: true
      });
    case DELETE_COMMENT_SUCCESS:
      return Object.assign({}, state, {
        isFetching: false,
      });
    case DELETE_COMMENT_FAILURE:
      return Object.assign({}, state, {
        isFetching: false,
        error: action.error
      });
    case GET_MD_BEGIN:
      return Object.assign({}, state, {
        isFetching: true
      });
    case GET_MD_SUCCESS:
      return Object.assign({}, state, {
        isFetching: false,
        notebookMD: action.notebookMD
      });
    case GET_MD_FAILURE:
      return Object.assign({}, state, {
        isFetching: false,
        error: action.error
      });
    case PUBLISH_NOTEBOOK_BEGIN:
      return Object.assign({}, state, {
        isFetching: true
      });
    case PUBLISH_NOTEBOOK_SUCCESS:
      return Object.assign({}, state, {
        isFetching: false,
        publishNotebookReturn: action.publishNotebookReturn
      });
    case PUBLISH_NOTEBOOK_FAILURE:
      return Object.assign({}, state, {
        isFetching: false,
        error: action.error
      });
    case DELETE_NOTEBOOK_BEGIN:
      return Object.assign({}, state, {
        isFetching: true
      });
    case DELETE_NOTEBOOK_SUCCESS:
      return Object.assign({}, state, {
        isFetching: false,
        deleteNotebookReturn: action.deleteNotebookReturn
      });
    case DELETE_NOTEBOOK_FAILURE:
      return Object.assign({}, state, {
        isFetching: false,
        error: action.error
      });
    default:
      return state;
  }
};

export default detailContent;
