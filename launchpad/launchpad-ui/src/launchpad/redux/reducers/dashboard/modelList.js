export default function modelList(actionType) {
  const initState = {
    modelList: []
  };
  return (state=initState, action) => {
    switch (action.type) {
    case actionType.GET_MODEL_DASHBOARD_LIST:
      return {
        modelList: [
          {
            modelName: 'Model One',
            modelDesc: 'The description about the model one...',
            version: '0.3.0',
            lastRefresh: '2019.05.14'
          },
          {
            modelName: 'Model Two',
            modelDesc: 'The description about the model two...',
            version: '0.1.0',
            lastRefresh: '2019.05.15'
          },
          {
            modelName: 'Model Three',
            modelDesc: 'The description about the model three...',
            version: '0.2.0',
            lastRefresh: '2019.05.16'
          }
        ],
      };
    default:
      return state;
    }
  }
}
