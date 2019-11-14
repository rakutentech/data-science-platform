import {
  GET_LIST_BEGIN,
  GET_LIST_SUCCESS,
  GET_LIST_FAILURE,
  GET_DETAIL_BEGIN,
  GET_DETAIL_SUCCESS,
  GET_DETAIL_FAILURE
} from "../actions/notebook";

type State = {
  notebookInfo: Object,
  notebookDetail: Object,
  isFetching: boolean,
  error: string
};

const initalState = {
  isFetching: false,
  notebookInfo: {
    pageNo: 1,
    limit: 12,
    totalPages: 1,
    totalCount: 0,
    notebookList: []
  },
  notebookDetail: {
    notebookId: '',
    title: '',
    subTitle: '',
    keywords: '',
    createTime: '',
    updateTime: '',
    recordStatus: '',
    path: '',
    notebookFilePath: '',
    authors: [],
    authorIds: [],
    tags: [],
    comoments: []
  }
};

const notebook = (state: State = initalState, action) => {

  switch (action.type) {
    case GET_LIST_BEGIN:
      return Object.assign({}, state, {
        isFetching: true
      });
    case GET_LIST_SUCCESS:
      return Object.assign({}, state, {
        isFetching: false,
        notebookInfo: action.notebookInfo
      });
    case GET_LIST_FAILURE:
      return Object.assign({}, state, {
        isFetching: false,
        error: action.error
      });
    case GET_DETAIL_BEGIN:
      return Object.assign({}, state, {
        isFetching: true
      });
    case GET_DETAIL_SUCCESS:
      return Object.assign({}, state, {
        isFetching: false,
        notebookDetail: action.notebookDetail
      });
    case GET_DETAIL_FAILURE:
      return Object.assign({}, state, {
        isFetching: false,
        error: action.error
      });
    default:
      return state;
  }
};

export default notebook;
