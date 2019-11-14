import React from 'react'
import { shallow } from 'enzyme'
import LoadingPage from './index'

describe('<LoadingPage />', () => {
  const wrapper = shallow(<LoadingPage />)

  it('renders properly', () => {
    expect(wrapper).toMatchSnapshot()
  })

  it('contains .loader', () => {
    expect(wrapper.find('.loader').length).toEqual(1)
  })
})