export default function modelNumber(actionType) {
  const initState = {
    modelNumber: undefined,
  };
  return (state=initState, action) => {
    switch (action.type) {
    case actionType.GET_MODEL_NUMBER:
      return {
        modelNumber: 12,
      };
    default:
      return state;
    }
  }
}
