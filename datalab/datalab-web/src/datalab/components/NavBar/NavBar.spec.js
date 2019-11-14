import React from 'react'
import NavBar from './index'
import { shallow } from 'enzyme'

describe('<NavBar />', () => {
  const props = {
    left: <div className='test'></div>,
    right: <div className='test'></div>
  }
  const wrapper = shallow(<NavBar {...props} />)

  it('renders properly', () => {
    expect(wrapper).toMatchSnapshot()
  })

  it('props in NavBar works correctly', () => {
    expect(wrapper.find('.test').length).toEqual(2)
  })

  describe('<NavBar.UserMenu />', () => {
    const props_menu = {
      username: 'username',
      children: <div className='test'></div>
    }
    const wrapper_menu = shallow(<NavBar.UserMenu {...props_menu} />)

    it('prop children works correct', () => {
      expect(wrapper_menu.find('.test').length).toEqual(1)
    })
  })
})