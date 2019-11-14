import reducer from './index'

describe('Reducer test', () => {
  it('authentication', ()=>{
    let initialState = {},
      action = {type: ''}
    expect(reducer(initialState, action).authentication).toEqual(initialState)
  })

  it('profile', ()=>{
    let initialState = {},
      action = {type: ''},
      expectedValue = {
        failure: false,
        profile: initialState
      }
    expect(reducer(initialState, action).profile).toEqual(expectedValue)
  })

  it('resourceQuota', ()=>{
    let initialState = {},
      action = {type: ''},
      expectedValue = {
        failure: false,
        resourceQuota: initialState
      }
    expect(reducer(initialState, action).resourceQuota).toEqual(expectedValue)
  })

  it('appDataLabSettings', ()=>{
    let initialState = {},
      action = {type: ''},
      expectedValue = {
        failure: false,
        appDataLabSettings: []
      }
    expect(reducer(initialState, action).appDataLabSettings).toEqual(expectedValue)
  })

  it('appFunctionSettings', ()=>{
    let initialState = {},
      action = {type: ''},
      expectedValue = {
        failure: false,
        appFunctionSettings: []
      }
    expect(reducer(initialState, action).appFunctionSettings).toEqual(expectedValue)
  })

  it('appInstanceTypeSettings', ()=>{
    let initialState = {},
      action = {type: ''},
      expectedValue = {
        failure: false,
        appInstanceTypeSettings: []
      }
    expect(reducer(initialState, action).appInstanceTypeSettings).toEqual(expectedValue)
  })

  it('appStorageSettings', ()=>{
    let initialState = {},
      action = {type: ''},
      expectedValue = {
        failure: false,
        appStorageSettings: []
      }
    expect(reducer(initialState, action).appStorageSettings).toEqual(expectedValue)
  })

  it('dataLabInstance', ()=>{
    let initialState = {},
      action = {type: ''},
      expectedValue = {
        failure: false,
        dataLabInstance: initialState
      }
    expect(reducer(initialState, action).dataLabInstance).toEqual(expectedValue)
  })

  it('dataLabInstanceLog', ()=>{
    let initialState = {},
      action = {type: ''},
      expectedValue = {
        failure: false,
        dataLabInstanceLog: ''
      }
    expect(reducer(initialState, action).dataLabInstanceLog).toEqual(expectedValue)
  })

  it('dataLabInstances', () => {
    let initialState = {},
      action = {type: ''},
      expectedValue = {
        failure: false,
        dataLabInstances: []
      }
    expect(reducer(initialState,action).dataLabInstances).toEqual(expectedValue)
  })

  it('functionInstance', () => {
    let initialState = {},
      action = {type: ''},
      expectedValue = {
        failure: false,
        functionInstance: initialState
      }
    expect(reducer(initialState,action).functionInstance).toEqual(expectedValue)
  })

  it('functionInstanceLog', () => {
    let initialState = {},
      action = {type: ''},
      expectedValue = {
        failure: false,
        functionInstanceLog: ''
      }
    expect(reducer(initialState,action).functionInstanceLog).toEqual(expectedValue)
  })

  it('functionInstances', () => {
    let initialState = {},
      action = {type: ''},
      expectedValue = {
        failure: false,
        functionInstances: []
      }
    expect(reducer(initialState,action).functionInstances).toEqual(expectedValue)
  })

  it('jobInstance', () => {
    let initialState = {},
      action = {type: ''},
      expectedValue = {
        failure: false,
        jobInstance: initialState
      }
    expect(reducer(initialState,action).jobInstance).toEqual(expectedValue)
  })

  it('jobInstanceLog', () => {
    let initialState = {},
      action = {type: ''},
      expectedValue = {
        failure: false,
        jobInstanceLog: ''
      }
    expect(reducer(initialState,action).jobInstanceLog).toEqual(expectedValue)
  })

  it('jobInstances', () => {
    let initialState = {},
      action = {type: ''},
      expectedValue = {
        failure: false,
        jobInstances: []
      }
    expect(reducer(initialState,action).jobInstances).toEqual(expectedValue)
  })

  it('clusterInfo', () => {
    let initialState = {},
      action = {type: ''},
      expectedValue = {
        failure: false,
        clusterInfo: initialState
      }
    expect(reducer(initialState,action).clusterInfo).toEqual(expectedValue)
  })

  it('userSettings', () => {
    let initialState = {},
      action = {type: ''},
      expectedValue = {
        failure: false,
        userSettings: []
      }
    expect(reducer(initialState,action).userSettings).toEqual(expectedValue)
  })

  it('groupSettings', () => {
    let initialState = {},
      action = {type: ''},
      expectedValue = {
        failure: false,
        groupSettings: []
      }
    expect(reducer(initialState,action).groupSettings).toEqual(expectedValue)
  })

  it('instanceTypeSettings', () => {
    let initialState = {},
      action = {type: ''},
      expectedValue = {
        failure: false,
        instanceTypeSettings: []
      }
    expect(reducer(initialState,action).instanceTypeSettings).toEqual(expectedValue)
  })

  it('instanceTypeGroupSettings', () => {
    let initialState = {},
      action = {type: ''},
      expectedValue = {
        failure: false,
        instanceTypeGroupSettings: []
      }
    expect(reducer(initialState,action).instanceTypeGroupSettings).toEqual(expectedValue)
  })

  it('storageSettings', () => {
    let initialState = {},
      action = {type: ''},
      expectedValue = {
        failure: false,
        storageSettings: []
      }
    expect(reducer(initialState,action).storageSettings).toEqual(expectedValue)
  })

  it('dataLabSettings', () => {
    let initialState = {},
      action = {type: ''},
      expectedValue = {
        failure: false,
        dataLabSettings: []
      }
    expect(reducer(initialState,action).dataLabSettings).toEqual(expectedValue)
  })

  it('dataLabGroupSettings', () => {
    let initialState = {},
      action = {type: ''},
      expectedValue = {
        failure: false,
        dataLabGroupSettings: []
      }
    expect(reducer(initialState,action).dataLabGroupSettings).toEqual(expectedValue)
  })

  it('functionSettings', () => {
    let initialState = {},
      action = {type: ''},
      expectedValue = {
        failure: false,
        functionSettings: []
      }
    expect(reducer(initialState,action).functionSettings).toEqual(expectedValue)
  })

  it('changeDataLabInstances', () => {
    let initialState = {},
      action = {type: ''},
      expectedValue = {
        failure: false,
        action: ''
      }
    expect(reducer(initialState,action).changeDataLabInstances).toEqual(expectedValue)
  })

  it('changeFunctionSettings', () => {
    let initialState = {},
      action = {type: ''},
      expectedValue = {
        failure: false,
        action: ''
      }
    expect(reducer(initialState,action).changeFunctionSettings).toEqual(expectedValue)
  })

  it('changeDataLabGroupSettings', () => {
    let initialState = {},
      action = {type: ''},
      expectedValue = {
        failure: false,
        action: ''
      }
    expect(reducer(initialState,action).changeDataLabGroupSettings).toEqual(expectedValue)
  })

  it('changeDataLabSettings', () => {
    let initialState = {},
      action = {type: ''},
      expectedValue = {
        failure: false,
        action: ''
      }
    expect(reducer(initialState,action).changeDataLabSettings).toEqual(expectedValue)
  })

  it('changeStorageSettings', () => {
    let initialState = {},
      action = {type: ''},
      expectedValue = {
        failure: false,
        action: ''
      }
    expect(reducer(initialState,action).changeStorageSettings).toEqual(expectedValue)
  })

  it('changeInstanceTypeGroupSettings', () => {
    let initialState = {},
      action = {type: ''},
      expectedValue = {
        failure: false,
        action: ''
      }
    expect(reducer(initialState,action).changeInstanceTypeGroupSettings).toEqual(expectedValue)
  })

  it('changeInstanceTypeSettings', () => {
    let initialState = {},
      action = {type: ''},
      expectedValue = {
        failure: false,
        action: ''
      }
    expect(reducer(initialState,action).changeInstanceTypeSettings).toEqual(expectedValue)
  })

  it('changeGroupSettings', () => {
    let initialState = {},
      action = {type: ''},
      expectedValue = {
        failure: false,
        action: ''
      }
    expect(reducer(initialState,action).changeGroupSettings).toEqual(expectedValue)
  })

  it('changeUserSettings', () => {
    let initialState = {},
      action = {type: ''},
      expectedValue = {
        failure: false,
        action: ''
      }
    expect(reducer(initialState,action).changeUserSettings).toEqual(expectedValue)
  })

  it('changeFunctionInstances', () => {
    let initialState = {},
      action = {type: ''},
      expectedValue = {
        failure: false,
        action: ''
      }
    expect(reducer(initialState,action).changeFunctionInstances).toEqual(expectedValue)
  })
})