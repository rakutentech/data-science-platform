import React from 'react'
import { shallow } from 'enzyme'
import DataLabPanel from './index'
import { BrowserRouter as Router } from 'react-router-dom';

describe('<DataLabPanel />', () => {
  const props = {
    dispatch: jest.fn(),
    appStorageSettings: [],
    appDataLabSettings: [],
    appInstanceTypeSettings: [],
    match: {
      params: {
        instancename: false
      }, 
      url: 'url'
    },
  }
  const wrapper = shallow(
    <Router>
      <DataLabPanel.WrappedComponent {...props} />
    </Router>
  )

  it('renders properly', () => {
    expect(wrapper).toMatchSnapshot();
  })

  it('has 1 SubSideBar', () => {
    expect(wrapper.dive().dive().find('SubSideBar').length).toBe(1)
  })
})