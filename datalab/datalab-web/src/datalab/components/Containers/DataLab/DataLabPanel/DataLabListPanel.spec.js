import React from 'react'
import { shallow } from 'enzyme'
import DataLabListPanel from './DataLabListPanel'
import { BrowserRouter as Router } from 'react-router-dom';

describe('<DataLabListPanel />', () => {
  const props = {
    dispatch: jest.fn(),
    dataLabInstance: {},
    appInstanceTypeSettings: [],
    typeName: 'typeName',
  }
  const wrapper = shallow(
    <Router>
      <DataLabListPanel.WrappedComponent {...props} />
    </Router>
  )

  it('renders properly', () => {
    expect(wrapper).toMatchSnapshot();
  })

  it('has 1 ToolBar', () => {
    expect(wrapper.dive().dive().find('ToolBar').length).toBe(1)
  })
})