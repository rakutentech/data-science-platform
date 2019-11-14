export default function apiNumber(actionType) {
  const initState = {
    activeAPINumber: undefined,
    stoppedAPINumber: undefined
  };
  return (state=initState, action) => {
    switch (action.type) {
    case actionType.GET_API_NUMBER:
      return {
        activeAPINumber: 20,
        stoppedAPINumber: 14
      };
    default:
      return state;
    }
  }
}
