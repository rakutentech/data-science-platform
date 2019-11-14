export default function apiList(actionType) {
  const initState = {
    apiList: []
  };
  return (state=initState, action) => {
    switch (action.type) {
    case actionType.GET_API_DASHBOARD_LIST:
      return {
        apiList: [
          {
            id: 1,
            apiName: 'API One',
            apiDesc: 'The description about the api one...',
            version: '0.3.0',
            lastRefresh: '2019.05.14'
          },
          {
            id: 2,
            apiName: 'API Two',
            apiDesc: 'The description about the api two...',
            version: '0.1.0',
            lastRefresh: '2019.05.15'
          },
          {
            id: 3,
            apiName: 'API Three',
            apiDesc: 'The description about the api three...',
            version: '0.2.0',
            lastRefresh: '2019.05.16'
          },
          {
            id: 4,
            apiName: 'API Four',
            apiDesc: 'The description about the api four...',
            version: '0.4.0',
            lastRefresh: '2019.05.18'
          },
          {
            id: 5,
            apiName: 'API Five',
            apiDesc: 'The description about the api five...',
            version: '0.5.0',
            lastRefresh: '2019.05.19'
          }
        ],
      };
    default:
      return state;
    }
  }
}
