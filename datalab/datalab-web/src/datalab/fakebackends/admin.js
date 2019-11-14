import config from 'config'
import jwt from 'jsonwebtoken'
import fakeData from './data.json'
import { apiBase, generateNewID, authAndResovle } from './utils'

const AdminBackend = (url, opts, resolve, reject) => {
  // authenticate admin
  if (url.endsWith(`${apiBase}${config.adminPath}/auth`) && opts.method === 'POST') {
    // get parameters from post request
    let params = JSON.parse(opts.body);
    let admin = fakeData.fakeAdmin
    if (admin.Username === params.Username && admin.Password === params.Password) {
      // if login details are valid return user details and fake jwt token
      const token = params.RememberMe?
        jwt.sign(fakeData.fakeAdmin, fakeData.fakeCert):
        jwt.sign(fakeData.fakeAdmin, fakeData.fakeCert, { expiresIn: fakeData.fakeExpire})
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

  // get admin cluster info
  if (url.endsWith(`${apiBase}${config.adminPath}/clusterinfo`) && opts.method === 'GET') {
    authAndResovle(opts, resolve, fakeData.fakeClusterInfo)
    return true;
  }
  // get admin datalab settings
  if (url.endsWith(`${apiBase}${config.adminPath}/datalab`)) {
    if(opts.method === 'GET'){
      authAndResovle(opts, resolve, fakeData.fakeDataLabSettings)
    }else if(opts.method === 'POST'){
      let params = JSON.parse(opts.body);
      const dataLab = {
        ID: generateNewID(fakeData.fakeDataLabSettings), 
        Name: params.Name, 
        Description: params.Description, 
        LoadBalancer:params.LoadBalancer, 
        Group:params.Group, 
        DeploymentTemplate: params.DeploymentTemplate, 
        ServiceTemplate: params.ServiceTemplate,
        IngressTemplate: params.IngressTemplate,
        Public: params.Public,
        AccessibleUsers: params.AccessibleUsers,
        AccessibleGroups: params.AccessibleGroups
      }
      fakeData.fakeDataLabSettings = [...fakeData.fakeDataLabSettings, dataLab]
      authAndResovle(opts, resolve, {'status':'ok'})
    }else if(opts.method === 'PUT'){
      let params = JSON.parse(opts.body);
      fakeData.fakeDataLabSettings = fakeData.fakeDataLabSettings.map(dataLabSetting => {
        return (dataLabSetting.ID == params.ID)?{
          ID: params.ID, 
          Name: params.Name, 
          Description: params.Description, 
          LoadBalancer:params.LoadBalancer, 
          Group:params.Group, 
          DeploymentTemplate: params.DeploymentTemplate, 
          ServiceTemplate: params.ServiceTemplate,
          IngressTemplate: params.IngressTemplate,
          Public: params.Public,
          AccessibleUsers: params.AccessibleUsers,
          AccessibleGroups: params.AccessibleGroups
        }:dataLabSetting
      })
      authAndResovle(opts, resolve, {'status':'ok'})
    }else if(opts.method === 'DELETE'){
      let params = JSON.parse(opts.body);
      fakeData.fakeDataLabSettings = fakeData.fakeDataLabSettings.filter(dataLabSetting => params.ID != dataLabSetting.ID)
      authAndResovle(opts, resolve, {'status':'ok'})
    }
    return true;
  }

  // get admin group settings
  if (url.endsWith(`${apiBase}${config.adminPath}/datalabgroups`)) {
    if(opts.method === 'GET'){
      authAndResovle(opts, resolve, fakeData.fakeDataLabGroupSettings)
    }else if(opts.method === 'POST'){
      let params = JSON.parse(opts.body);
      const duplicated = fakeData.fakeDataLabGroupSettings.filter(
        groupSetting => groupSetting.Name == params.Name)
      if(duplicated.length > 0){
        reject({'status':'failed', 'message': `Duplicated group name: ${params.Name}`})
      }else{
        const group = {
          ID: generateNewID(fakeData.fakeDataLabGroupSettings), 
          Name: params.Name}
        fakeData.fakeDataLabGroupSettings = [...fakeData.fakeDataLabGroupSettings, group]
        authAndResovle(opts, resolve, {'status':'ok'})
      }
    }else if(opts.method === 'PUT'){
      let params = JSON.parse(opts.body);
      const duplicated = fakeData.fakeDataLabGroupSettings.filter(
        groupSetting => groupSetting.ID!=params.ID && groupSetting.Name == params.Name)
      if(duplicated.length > 0){
        reject({'status':'failed', 'message': `Duplicated group name: ${params.Name}`})
      }else{
        fakeData.fakeDataLabGroupSettings = fakeData.fakeDataLabGroupSettings.map(groupSetting => {
          return (groupSetting.ID == params.ID)?{
            ID: params.ID, 
            Name: params.Name
          }:groupSetting
        })
        authAndResovle(opts, resolve, {'status':'ok'})
      }
    }else if(opts.method === 'DELETE'){
      let params = JSON.parse(opts.body);
      fakeData.fakeDataLabGroupSettings = fakeData.fakeDataLabGroupSettings.filter(groupSetting => params.ID != groupSetting.ID)
      authAndResovle(opts, resolve, {'status':'ok'})
    }
    return true;
  }

  // get admin function settings
  if (url.endsWith(`${apiBase}${config.adminPath}/function`)) {
    if(opts.method === 'GET'){
      authAndResovle(opts, resolve, fakeData.fakeFunctionSettings)
    }else if(opts.method === 'POST'){
      let params = JSON.parse(opts.body);
      const _function = {
        ID: generateNewID(fakeData.fakeFunctionSettings), 
        Name: params.Name, 
        Description: params.Description, 
        LoadBalancer:params.LoadBalancer, 
        Trigger: params.Trigger, 
        ProgramLanguage:params.ProgramLanguage,
        DefaultFunction: params.DefaultFunction, 
        DefaultRequirement:params.DefaultRequirement, 
        DeploymentTemplate: params.DeploymentTemplate, 
        ServiceTemplate: params.ServiceTemplate,
        IngressTemplate: params.IngressTemplate,
        JobTemplate: params.JobTemplate,
        Public: params.Public,
        AccessibleUsers: params.AccessibleUsers,
        AccessibleGroups: params.AccessibleGroups
      }
      fakeData.fakeFunctionSettings = [...fakeData.fakeFunctionSettings, _function]
      authAndResovle(opts, resolve, {'status':'ok'})
    }else if(opts.method === 'PUT'){
      let params = JSON.parse(opts.body);
      fakeData.fakeFunctionSettings = fakeData.fakeFunctionSettings.map(functionSetting => {
        return (functionSetting.ID == params.ID)?{
          ID: params.ID, 
          Name: params.Name, 
          Description: params.Description, 
          LoadBalancer:params.LoadBalancer,
          Trigger: params.Trigger, 
          ProgramLanguage:params.ProgramLanguage,
          DefaultFunction: params.DefaultFunction, 
          DefaultRequirement:params.DefaultRequirement, 
          DeploymentTemplate: params.DeploymentTemplate, 
          ServiceTemplate: params.ServiceTemplate,
          IngressTemplate: params.IngressTemplate,
          JobTemplate: params.JobTemplate,
          Public: params.Public,
          AccessibleUsers: params.AccessibleUsers,
          AccessibleGroups: params.AccessibleGroups
        }:functionSetting
      })
      authAndResovle(opts, resolve, {'status':'ok'})
    }else if(opts.method === 'DELETE'){
      let params = JSON.parse(opts.body);
      fakeData.fakeFunctionSettings = fakeData.fakeFunctionSettings.filter(functionSetting => params.ID != functionSetting.ID)
      authAndResovle(opts, resolve, {'status':'ok'})
    }
    return true;
  }

  // get admin user settings
  if (url.endsWith(`${apiBase}${config.adminPath}/users`)) {
    if(opts.method === 'GET'){
      authAndResovle(opts, resolve, fakeData.fakeUserSettings)
    }else if(opts.method === 'POST'){
      let params = JSON.parse(opts.body);
      const user = {
        ID: generateNewID(fakeData.fakeUserSettings), 
        Username: params.Username, 
        AuthType: params.AuthType, 
        Password:params.Password, 
        Group: params.Group, 
        Namespace: params.Namespace}
      fakeData.fakeUserSettings = [...fakeData.fakeUserSettings, user]
      authAndResovle(opts, resolve, {'status':'ok'})
    }else if(opts.method === 'PUT'){
      let params = JSON.parse(opts.body);
      fakeData.fakeUserSettings = fakeData.fakeUserSettings.map(userSetting => {
        return (userSetting.ID == params.ID)?{
          ID: params.ID, 
          Username: params.Username, 
          AuthType: params.AuthType, 
          Password:params.Password, 
          Group: params.Group, 
          Namespace: params.Namespace
        }:userSetting
      })
      authAndResovle(opts, resolve, {'status':'ok'})
    }else if(opts.method === 'DELETE'){
      let params = JSON.parse(opts.body);
      fakeData.fakeUserSettings = fakeData.fakeUserSettings.filter(userSetting => params.ID != userSetting.ID)
      authAndResovle(opts, resolve, {'status':'ok'})
    }
    return true;
  }

  // get admin group settings
  if (url.endsWith(`${apiBase}${config.adminPath}/groups`)) {
    if(opts.method === 'GET'){
      authAndResovle(opts, resolve, fakeData.fakeGroupSettings)
    }else if(opts.method === 'POST'){
      let params = JSON.parse(opts.body);
      const duplicated = fakeData.fakeGroupSettings.filter(
        groupSetting => groupSetting.Name == params.Name)
      if(duplicated.length > 0){
        reject({'status':'failed', 'message': `Duplicated group name: ${params.Nsame}`})
      }else{
        const group = {
          ID: generateNewID(fakeData.fakeGroupSettings), 
          Name: params.Name}
        fakeData.fakeGroupSettings = [...fakeData.fakeGroupSettings, group]
        authAndResovle(opts, resolve, {'status':'ok'})
      }
    }else if(opts.method === 'PUT'){
      let params = JSON.parse(opts.body);
      const duplicated = fakeData.fakeGroupSettings.filter(
        groupSetting => groupSetting.ID!=params.ID && groupSetting.Name == params.Name)
      if(duplicated.length > 0){
        reject({'status':'failed', 'message': `Duplicated group name: ${params.Name}`})
      }else{
        fakeData.fakeGroupSettings = fakeData.fakeGroupSettings.map(groupSetting => {
          return (groupSetting.ID == params.ID)?{
            ID: params.ID, 
            Name: params.Name
          }:groupSetting
        })
        authAndResovle(opts, resolve, {'status':'ok'})
      }
    }else if(opts.method === 'DELETE'){
      let params = JSON.parse(opts.body);
      fakeData.fakeGroupSettings = fakeData.fakeGroupSettings.filter(groupSetting => params.ID != groupSetting.ID)
      authAndResovle(opts, resolve, {'status':'ok'})
    }
    return true;
  }

  // get admin instance type group settings
  if (url.endsWith(`${apiBase}${config.adminPath}/instancetypegroups`)) {
    if(opts.method === 'GET'){
      authAndResovle(opts, resolve, fakeData.fakeInstanceTypeGroupSettings)
    }else if(opts.method === 'POST'){
      let params = JSON.parse(opts.body);
      const duplicated = fakeData.fakeInstanceTypeGroupSettings.filter(
        groupSetting => groupSetting.Name == params.Name)
      if(duplicated.length > 0){
        reject({'status':'failed', 'message': `Duplicated group name: ${params.Name}`})
      }else{
        const group = {
          ID: generateNewID(fakeData.fakeInstanceTypeGroupSettings), 
          Name: params.Name}
        fakeData.fakeInstanceTypeGroupSettings = [...fakeData.fakeInstanceTypeGroupSettings, group]
        authAndResovle(opts, resolve, {'status':'ok'})
      }
    }else if(opts.method === 'PUT'){
      let params = JSON.parse(opts.body);
      const duplicated = fakeData.fakeInstanceTypeGroupSettings.filter(
        groupSetting => groupSetting.ID!=params.ID && groupSetting.Name == params.Name)
      if(duplicated.length > 0){
        reject({'status':'failed', 'message': `Duplicated group name: ${params.Name}`})
      }else{
        fakeData.fakeInstanceTypeGroupSettings = fakeData.fakeInstanceTypeGroupSettings.map(groupSetting => {
          return (groupSetting.ID == params.ID)?{
            ID: params.ID, 
            Name: params.Name
          }:groupSetting
        })
        authAndResovle(opts, resolve, {'status':'ok'})
      }
    }else if(opts.method === 'DELETE'){
      let params = JSON.parse(opts.body);
      fakeData.fakeInstanceTypeGroupSettings = fakeData.fakeInstanceTypeGroupSettings.filter(groupSetting => params.ID != groupSetting.ID)
      authAndResovle(opts, resolve, {'status':'ok'})
    }
    return true;
  }

  // get admin instance type settings
  if (url.endsWith(`${apiBase}${config.adminPath}/instancetypes`)) {
    if(opts.method === 'GET'){
      authAndResovle(opts, resolve, fakeData.fakeInstanceTypeSettings)
    }else if(opts.method === 'POST'){
      let params = JSON.parse(opts.body);
      const instanceType = {
        ID: generateNewID(fakeData.fakeInstanceTypeSettings), 
        Name: params.Name,
        Description: params.Description,
        Group: params.Group,
        CPU: params.CPU,
        GPU: params.GPU,
        Memory: params.Memory,
        MemoryScale: params.MemoryScale,
        Public: params.Public,
        AccessibleUsers: params.AccessibleUsers,
        AccessibleGroups: params.AccessibleGroups,
        Tags: params.Tags
      }
      fakeData.fakeInstanceTypeSettings = [...fakeData.fakeInstanceTypeSettings, instanceType]
      authAndResovle(opts, resolve, {'status':'ok'})
    }else if(opts.method === 'PUT'){
      let params = JSON.parse(opts.body);
      fakeData.fakeInstanceTypeSettings = fakeData.fakeInstanceTypeSettings.map(instanceType => {
        return (instanceType.ID == params.ID)?{
          ID: params.ID, 
          Name: params.Name,
          Description: params.Description,
          Group: params.Group,
          CPU: params.CPU,
          GPU: params.GPU,
          Memory: params.Memory,
          MemoryScale: params.MemoryScale,
          Public: params.Public,
          AccessibleUsers: params.AccessibleUsers,
          AccessibleGroups: params.AccessibleGroups,
          Tags: params.Tags
        }:instanceType
      })
      authAndResovle(opts, resolve, {'status':'ok'})
    }else if(opts.method === 'DELETE'){
      let params = JSON.parse(opts.body);
      fakeData.fakeInstanceTypeSettings = fakeData.fakeInstanceTypeSettings.filter(
        instanceTypeSetting => params.ID != instanceTypeSetting.ID)
      authAndResovle(opts, resolve, {'status':'ok'})
    }
    return true;
  }

  // admin storage settings
  if (url.endsWith(`${apiBase}${config.adminPath}/storages`)) {
    if(opts.method === 'GET'){
      authAndResovle(opts, resolve, fakeData.fakeStorageSettings)
    }else if(opts.method === 'POST'){
      let params = JSON.parse(opts.body);
      const duplicated = fakeData.fakeStorageSettings.filter(
        storageSetting => storageSetting.Value == params.Value)
      if(duplicated.length > 0){
        reject({'status':'failed', 'message': `Duplicated value: ${params.Value}`})
      }else if(params.value == '' || params.label == ''){
        reject({'status':'failed', 'message': 'Empty label/value'})
      }
      else{
        const group = {
          ID: generateNewID(fakeData.fakeStorageSettings), 
          Label: params.Label,
          Value: params.Value,
        }
        fakeData.fakeStorageSettings = [...fakeData.fakeStorageSettings, group]
        authAndResovle(opts, resolve, {'status':'ok'})
      }
    }else if(opts.method === 'PUT'){
      let params = JSON.parse(opts.body);
      const duplicated = fakeData.fakeStorageSettings.filter(
        storageSetting => storageSetting.ID!=params.ID && storageSetting.Value == params.Value)
      if(duplicated.length > 0){
        reject({'status':'failed', 'message': `Duplicated value: ${params.Value}`})
      }else{
        fakeData.fakeStorageSettings = fakeData.fakeStorageSettings.map(storageSetting => {
          return (storageSetting.ID == params.ID)?{
            ID: params.ID, 
            Label: params.Label,
            Value: params.Value
          }:storageSetting
        })
        authAndResovle(opts, resolve, {'status':'ok'})
      }
    }else if(opts.method === 'DELETE'){
      let params = JSON.parse(opts.body);
      fakeData.fakeStorageSettings = fakeData.fakeStorageSettings.filter(storageSetting => params.ID != storageSetting.ID)
      authAndResovle(opts, resolve, {'status':'ok'})
    }
    return true;
  }
  return false;
}

export default AdminBackend