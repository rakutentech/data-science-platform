export function authHeader(tokenName) {
  // return authorization header with jwt token
  const token = localStorage.getItem(tokenName);
  if (token) {
    return { 'Authorization': 'Bearer ' + token };
  } else {
    return {};
  }
}

export async function handleResponseWithLogout(response, logout) {
  if (response.status === 401) {
    // auto logout if 401 response returned from api
    logout();
  }
  let data = {}
  if(typeof response.text == 'function'){
    const body = await response.text()
    data = JSON.parse(body)
  }else{
    data = response.text && JSON.parse(response.text);
  }
  if (response.status >= 400) {
    const error = (data && data.message) || response.statusText;
    return Promise.reject(error);
  }  
  return data;
  
}

export function doLogin(url, tokenName, username, password, rememberMe, handleResponse){
  const requestOptions = {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ Username: username, Password: password, RememberMe: rememberMe })
  };
  return fetch(url, requestOptions)
    .then(handleResponse)
    .then(user => {
      // login successful if there's a jwt token in the response
      if (user.token) {
        // store user details and jwt token in local storage to keep user logged in between page refreshes
        localStorage.setItem(tokenName, user.token);
        return user;
      }else{
        return Promise.reject('Username or password is invalid');
      }
    });
}

export function doGet(url, tokenName, handleResponse){
  const requestOptions = {
    method: 'GET',
    headers: authHeader(tokenName)
  };
  return fetch(url, requestOptions)
    .then(handleResponse);
}

function withJsonHeader(headers){
  headers['Content-Type'] = 'application/json'
  return headers
}

export function doPost(data, url, tokenName, handleResponse){  
  const requestOptions = {
    method: 'POST',
    headers: withJsonHeader(authHeader(tokenName)),
    body: JSON.stringify(data)
  };
  return fetch(url, requestOptions)
    .then(handleResponse);
}

export function doPut(data, url, tokenName, handleResponse){
  const requestOptions = {
    method: 'PUT',
    headers: withJsonHeader(authHeader(tokenName)),
    body: JSON.stringify(data)
  };
  return fetch(url, requestOptions)
    .then(handleResponse);
}

export function doDelete(data, url, tokenName, handleResponse){
  const requestOptions = {
    method: 'DELETE',
    headers: withJsonHeader(authHeader(tokenName)),
    body: JSON.stringify(data)
  };
  return fetch(url, requestOptions)
    .then(handleResponse);
}