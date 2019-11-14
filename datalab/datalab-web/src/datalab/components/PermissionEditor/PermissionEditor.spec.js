import React from 'react'
import PermissionEditor from './index'
import {shallow} from 'enzyme'

describe('<PermissionEditor />', () => {
  const props = {
    users: ['user_1'],
    groups: ['group_1'],
    userOptions: ['user_1', 'user_2'],
    groupOptions: ['group_1', 'group_2'],
    onUserChange: () => {},
    onGroupChange: () => {}
  }
  const wrapper = shallow(<PermissionEditor {...props} />)

  it('renders properly', () => {
    expect(wrapper).toMatchSnapshot()
  })
  
  it('contains two StateManager', () => {
    expect(wrapper.find('StateManager').length).toEqual(2)
  })
})