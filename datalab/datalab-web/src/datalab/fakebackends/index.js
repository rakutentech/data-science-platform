//React Fake / Mock Backend

import AdminBackend from './admin'
import AppBackend from './app'

export function configureFakeBackend() {
  let realFetch = window.fetch;
  window.fetch = function (url, opts) {
    return new Promise((resolve, reject) => {
      // wrap in timeout to simulate server api call
      setTimeout(() => {
       
        if(AdminBackend(url, opts, resolve, reject)){
          return
        }
        if(AppBackend(url, opts, resolve, reject)){
          return
        }
        // pass through any requests not handled above
        realFetch(url, opts).then(response => resolve(response));

      }, 500);
    });
  }
}

