import React from 'react'
import { shallow } from 'enzyme'
import NotFound from './index'

describe('<NotFound />', () => {
  const wrapper = shallow(<NotFound />)

  it('renders properly', () => {
    expect(wrapper).toMatchSnapshot()
  })
})