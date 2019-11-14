import { combineReducers } from "redux";
import userActions from "./userActions";
import notebook from "./notebook";
import popularTags from "./popularTags"
import popularPosts from "./popularPosts"
import detailContent from "./notebookDetail";
import authenticator from "./authReducer";

export default combineReducers({
  userActions, notebook, popularTags, popularPosts, authenticator, detailContent
});
