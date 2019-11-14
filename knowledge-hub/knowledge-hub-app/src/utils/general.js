export const utils_general = {
  getNameStr(authorList) {
    let nameStr = "";
    if (authorList !== undefined) {
      for (let j = 0; j < authorList.length; j++) {
        nameStr = nameStr + authorList[j];
        if (j !== authorList.length - 1) nameStr = nameStr + ", ";
      }
    }
    return nameStr;
  },

  // get parameter from the url
  getQueryVariable(variable) {
    var query = window.location.search.substring(1);
    var vars = query.split('&');
    for (var i = 0; i < vars.length; i++) {
      var pair = vars[i].split('=');
      if (decodeURIComponent(pair[0]) === variable) {
        return decodeURIComponent(pair[1]);
      }
    }
  },

  // set old url to local storage
  setOldUrl() {
    let current_url = process.env.REACT_APP_KH_HOST + window.location.pathname.slice(1) + window.location.search
    current_url = current_url.split('/').filter(function (item, i, allItems) {
      return i === allItems.indexOf(item);
    }).join('/');
    localStorage.setItem('old_url', current_url)
  }
}