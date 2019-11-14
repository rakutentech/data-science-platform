import jwt from 'jsonwebtoken'
import fakeData from './data.json'

export const apiBase = '/api/v1'

export const generateNewID = (array) => {return Math.max(...array.map(obj => obj['ID'])) + 1}

export function authAndResovle(opts, resolve, data){
  if (opts.headers && opts.headers.Authorization) {
    const match = opts.headers.Authorization.match(/^Bearer (.+)$/)
    if(match){
      const token = match[1]
      jwt.verify(token, fakeData.fakeCert, function(error) {
        if(error){
          resolve({ status: 401, text: JSON.stringify(error)});
        }else{
          resolve({ status: 200, text: JSON.stringify(data)});
        }
      })
    }else{
      resolve({ status: 401, text: JSON.stringify('Unauthorised')});
    }
  } else {
    // return 401 not authorised if token is null or invalid
    resolve({ status: 401, text: JSON.stringify('Unauthorised')});
  }
}