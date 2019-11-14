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
  const contentType = response.headers.get('content-type');
  if (response.status >= 200 && response.status < 300) {
    if (contentType && contentType.indexOf('application/json') !== -1) {
      return response.json();
    }
    return response.text();
  }
  if (response.status === 401) {
    // auto logout if 401 response returned from api
    logout();
  }
  if (contentType && contentType.indexOf('application/json') !== -1) {
    return response.json().then(r => Promise.reject(r));
  }
  return response.text().then(r => Promise.reject(r));
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
    headers: authHeader(tokenName),
    mode: 'cors'
  };
  return fetch(url, requestOptions)
    .then(handleResponse);
}

function withJsonHeader(headers){
  headers['Content-Type'] = 'application/json';
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

export function timetrans(date){
  let time = new Date(date);
  let Y = time.getFullYear() + '-';
  let M = (time.getMonth()+1 < 10 ? '0'+(time.getMonth()+1) : time.getMonth()+1) + '-';
  let D = (time.getDate() < 10 ? '0' + (time.getDate()) : time.getDate()) + ' ';
  let h = (time.getHours() < 10 ? '0' + time.getHours() : time.getHours()) + ':';
  let m = (time.getMinutes() <10 ? '0' + time.getMinutes() : time.getMinutes()) + ':';
  let s = (time.getSeconds() <10 ? '0' + time.getSeconds() : time.getSeconds());
  return Y + M + D + h + m + s;
}

Date.prototype.format = function(fmt) {
  let o = {
    'M+' : this.getMonth()+1,
    'd+' : this.getDate(),
    'h+' : this.getHours(),
    'm+' : this.getMinutes(),
    's+' : this.getSeconds(),
    'q+' : Math.floor((this.getMonth()+3)/3),
    'S'  : this.getMilliseconds()
  };
  if (/(y+)/.test(fmt))
    fmt = fmt.replace(RegExp.$1, (this.getFullYear()+'').substr(4 - RegExp.$1.length));
  for (let k in o)
    if (new RegExp('('+ k +')').test(fmt))
      fmt = fmt.replace(RegExp.$1, (RegExp.$1.length === 1) ? (o[k]) : (('00'+ o[k]).substr((''+ o[k]).length)));
  return fmt;
};

export function convertUTCToLocalTime(UTCDateString) {
  if (UTCDateString !== null) {
    return new Date(UTCDateString).format('yyyy-MM-dd hh:mm:ss').toLocaleString();
  }
  return null;
}
