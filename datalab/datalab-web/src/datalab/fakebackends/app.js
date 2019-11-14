import jwt from 'jsonwebtoken'
import fakeData from './data.json'
import { apiBase, generateNewID, authAndResovle } from './utils'
import { formConstants } from '../constants/form.js';

const AppBackend = (url, opts, resolve, reject) => {
  // authenticate
  if (url.endsWith(`${apiBase}/auth`) && opts.method === 'POST') {
    // get parameters from post request
    let params = JSON.parse(opts.body);
    let user = fakeData.fakeUser
    if (user.Username === params.Username && user.Password === params.Password) {
      // if login details are valid return user details and fake jwt token
      const token = params.RememberMe?
        jwt.sign(user, fakeData.fakeCert):
        jwt.sign(user, fakeData.fakeCert, { expiresIn: fakeData.fakeExpire})
      let responseJson = {
        token: token
      }
      resolve({ status: 200, text: JSON.stringify(responseJson) });
    } else {
      // else return error
      resolve({status: 401, text: 'Username or password is incorrect'});
    }
    return true;
  }

  // get user profle
  if (url.endsWith(`${apiBase}/profile`) && opts.method === 'GET') {
    // check for fake auth token in header and return users if valid, this security is implemented server side in a real application
    fakeData.fakeUser.Password = ''
    authAndResovle(opts, resolve, fakeData.fakeUser)
    return true;
  }

  // get user datalabs
  if (url.endsWith(`${apiBase}/datalab`) && opts.method === 'GET') {
    // check for fake auth token in header and return users if valid, this security is implemented server side in a real application
    authAndResovle(opts, resolve, fakeData.fakeAppDataLabSettings)
    return true;
  }

  // get user functions
  if (url.endsWith(`${apiBase}/function`) && opts.method === 'GET') {
    // check for fake auth token in header and return users if valid, this security is implemented server side in a real application
    authAndResovle(opts, resolve, fakeData.fakeAppFunctionSettings)
    return true;
  }

  // get user resource qouta
  if (url.endsWith(`${apiBase}/resourcequota`) && opts.method === 'GET') {
    // check for fake auth token in header and return users if valid, this security is implemented server side in a real application
    authAndResovle(opts, resolve, fakeData.fakeResourceQuota)
    return true;
  }

  if (url.endsWith(`${apiBase}/instancetypes`) && opts.method === 'GET') {
    // check for fake auth token in header and return users if valid, this security is implemented server side in a real application
    authAndResovle(opts, resolve, fakeData.fakeAppInstanceTypeSettings)
    return true;
  }

  if (url.endsWith(`${apiBase}/storages`) && opts.method === 'GET') {
    // check for fake auth token in header and return users if valid, this security is implemented server side in a real application
    authAndResovle(opts, resolve, fakeData.fakeAppStorageSettings)
    return true;
  }

  const dataLabInstanceLogMatch = url.match(new RegExp(`${apiBase}/datalab/instances/(.+)/(.+)/(.+)/log`))
  if(dataLabInstanceLogMatch){
    authAndResovle(opts, resolve, fakeData.fakeLog)
    return true;
  }
  const dataLabInstanceMatch = url.match(new RegExp(`${apiBase}/datalab/instances/(.+)/(.+)/(.+)`))
  if(dataLabInstanceMatch){
    const typeGroup = dataLabInstanceMatch[1]
    const typeName = dataLabInstanceMatch[2]
    const instanceName = dataLabInstanceMatch[3]
    const filtered = fakeData.fakeDataLabInstances
      .filter(dataLab => dataLab.TypeName == typeName && dataLab.Name == instanceName && dataLab.TypeGroup == typeGroup)
    authAndResovle(opts, resolve, filtered.length > 0?filtered[0]:{})
    return true;
  }
  // user datalab instance
  if (url.endsWith(`${apiBase}/datalab/instances`)) {
    if(opts.method === 'GET'){
      authAndResovle(opts, resolve, fakeData.fakeDataLabInstances)
    }else if(opts.method === 'POST'){
      let params = JSON.parse(opts.body);
      const duplicated = fakeData.fakeDataLabInstances.filter(
        instance => instance.Name == params.Name)
      if(duplicated.length > 0){
        reject({'status':'failed', 'message': `Duplicated instance: ${params.Name}`})
      }else{
        const dataLabType = fakeData.fakeDataLabSettings.filter(setting => setting.Name == params.TypeName && setting.Group == params.TypeGroup)[0]
        const instance = {
          ID: generateNewID(fakeData.fakeDataLabInstances), 
          UUID: `${params.Name}-${dataLabType.Name}`,
          Name: params.Name,
          TypeName: dataLabType.Name,
          TypeGroup: dataLabType.Group,
          Owner: 'fake',
          URL: 'http://localhost',
          InternalEndpoints: [`${params.Name}-abcd`],
          CreateAt: Math.round(new Date().getTime()/1000),
          Namespace: 'ns1',
          Restarts: 0,
          InstanceTypeName: params.InstanceTypeName,
          EphemeralStorage: params.EphemeralStorage,
          StorageScale: 'GiB',
          RunningInstances: 1,
          PendingInstances: 0,
          Tags: params.Tags
        }
        fakeData.fakeDataLabInstances = [...fakeData.fakeDataLabInstances, instance]
        authAndResovle(opts, resolve, {'status':'ok'})
      }
    }else if(opts.method === 'DELETE'){
      let params = JSON.parse(opts.body);
      fakeData.fakeDataLabInstances = fakeData.fakeDataLabInstances.filter(instance => params.ID != instance.ID)
      authAndResovle(opts, resolve, {'status':'ok'})
    }
    return true;
  }

  // user job instance
  const functionJobLogMatch = url.match(new RegExp(`${apiBase}/function/instances/(.+)/(.+)/jobs/(.+)/log`))
  if(functionJobLogMatch){
    authAndResovle(opts, resolve, fakeData.fakeLog)
    return true;
  }
  const killJobMatch = url.match(new RegExp(`${apiBase}/function/instances/(.+)/(.+)/jobs/(.+)/kill`))
  if(killJobMatch){
    const instanceName = killJobMatch[2]
    const jobID = killJobMatch[3]
    fakeData.fakeFunctionJobs = fakeData.fakeFunctionJobs
      .map(job => {
        if(job.JobID == jobID &&
           job.InstanceName == instanceName &&
          (job.Status == 'Running' || job.Status == 'Pending')){
          job.Status = 'Killed'
          return job
        }else{
          return job
        }
      })
    authAndResovle(opts, resolve, {'status':'ok'})
    return true;
  }
  const functionJobMatch = url.match(new RegExp(`${apiBase}/function/instances/(.+)/(.+)/jobs/(.+)`))
  if(functionJobMatch){
    const instanceName = functionJobMatch[2]
    const jobID = functionJobMatch[3]
    const filtered = fakeData.fakeFunctionJobs
      .filter(job => job.Name == jobID && job.InstanceName == instanceName)
    authAndResovle(opts, resolve, filtered.length > 0?filtered[0]:{})
    return true;
  }
  
  const functionJobsMatch = url.match(new RegExp(`${apiBase}/function/instances/(.+)/(.+)/jobs`))
  if (functionJobsMatch) {
    const instanceName = functionJobsMatch[2]
    if(opts.method === 'GET'){
      authAndResovle(opts, resolve, fakeData.fakeFunctionJobs.filter(job => job.InstanceName == instanceName))
    }
    return true;
  }

  // user function instance
  const functionInstanceLogMatch = url.match(new RegExp(`${apiBase}/function/instances/(.+)/(\\w+)/log`))
  if(functionInstanceLogMatch){
    authAndResovle(opts, resolve, fakeData.fakeLog)
    return true;
  }
  const restartInstanceMatch = url.match(new RegExp(`${apiBase}/function/instances/(.+)/(\\w+)/restart`))
  if(restartInstanceMatch){
    authAndResovle(opts, resolve, {'status':'ok'})
    return true;
  }
  const functionInstanceMatch = url.match(new RegExp(`${apiBase}/function/instances/(.+)/(\\w+)`))
  if(functionInstanceMatch){
    const trigger = functionInstanceMatch[1]
    const instanceName = functionInstanceMatch[2]
    const filtered = fakeData.fakeFunctionInstances
      .filter(instance => instance.Name == instanceName && instance.Trigger == trigger)
    authAndResovle(opts, resolve, filtered.length > 0?filtered[0]:{})
    return true;
  }
  if (url.endsWith(`${apiBase}/function/instances`)) {
    if(opts.method === 'GET'){
      authAndResovle(opts, resolve, fakeData.fakeFunctionInstances)
    }else if(opts.method === 'POST'){
      let params = JSON.parse(opts.body);
      const duplicated = fakeData.fakeFunctionInstances.filter(
        instance => instance.Name == params.Name)
      if(duplicated.length > 0){
        reject({'status':'failed', 'message': `Duplicated instance: ${params.Name}`})
      }else{
        const functionType = fakeData.fakeAppFunctionSettings.filter(setting => setting.Name == params.FunctionName)[0]
        let contextType = formConstants.INLINE_FUNCTION
        if(params.FunctionContext.GitRepo){
          contextType = formConstants.GIT_FUNCTION
        }else if(params.FunctionContext.ZipFileName){
          contextType = formConstants.ZIP_FUNCTION
        }
        const instance = {
          ID: generateNewID(fakeData.fakeFunctionInstances), 
          UUID: `${params.Name}-${functionType.Name}`,
          Name: params.Name,
          FunctionName: functionType.Name,
          Owner: 'fake',
          URL: 'http://localhost',
          InternalEndpoints: [`${params.Name}-abcd`],
          CreateAt: Math.round(new Date().getTime()/1000),
          Namespace: 'ns1',
          Restarts: 0,
          Trigger: params.Trigger,
          InstanceNumber: params.InstanceNumber,
          FunctionRef: `/ref/${functionType.Name}`,
          FunctionContextType: contextType,
          IngressPath: params.IngressPath,
          InstanceTypeName: params.InstanceTypeName,
          FunctionContext: params.FunctionContext,
          RunningInstances: 1,
          PendingInstances: 0,
          Tags: params.Tags
        }
        fakeData.fakeFunctionInstances = [...fakeData.fakeFunctionInstances, instance]
        authAndResovle(opts, resolve, {'status':'ok'})
      }
    }else if(opts.method === 'PUT'){
      let params = JSON.parse(opts.body);
      fakeData.fakeFunctionInstances = fakeData.fakeFunctionInstances.map(instance => {
        if(instance.ID == params.ID){
          instance.InstanceNumber = parseInt(params.InstanceNumber)
          instance.FunctionContext = params.FunctionContext
          return instance
        }else{
          return instance
        }
      })
      authAndResovle(opts, resolve, {'status':'ok'})
    }else if(opts.method === 'DELETE'){
      let params = JSON.parse(opts.body);
      fakeData.fakeFunctionInstances = fakeData.fakeFunctionInstances.filter(instance => params.ID != instance.ID)
      authAndResovle(opts, resolve, {'status':'ok'})
    }
    return true;
  }
  return false;
}


export default AppBackend