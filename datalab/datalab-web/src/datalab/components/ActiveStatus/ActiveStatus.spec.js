import React from 'react'
import { shallow } from 'enzyme'
import ActiveStatus from './index'

describe('<ActiveStatus />', () => {
  const props = {
    isRunning: true
  }
  const wrapper = shallow(<ActiveStatus {...props} />)

  it('renders properly', () => {
    expect(wrapper).toMatchSnapshot()
  })

  it('has one div', () => {
    expect(wrapper.find('div').length).toEqual(1)
  })
})