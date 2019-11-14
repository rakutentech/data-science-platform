import { userConstants } from "../constants/userConstants";

const initalState = { error: '', message: '', content: '', authenticated: false };

// const authenticator = (state: State = initalState, action) => {
const authenticator = (state = initalState, action) => {
  switch (action.type) {
    case userConstants.LOGIN_FAILURE:
        return { ...state, error: action.payload };
        default:

  }
  return state;
}


export default authenticator;