import React from 'react';
import SideBar from './index'
import { shallow } from 'enzyme';

describe('<SideBar />', () => {
  const props = {
    serverName: '',
    children: <div className="child"></div>,
    href: 'href',
    text: 'text',
    icon: 'icon'
  }

  it('renders properly', () => {
    const wrapper = shallow(<SideBar {...props} />)
    expect(wrapper).toMatchSnapshot();
  })

  describe('<SideBar SideBarItem />', () => {
    const wrapper_Column = shallow(<SideBar.Item {...props} />)

    it('renders one <Link /> component', () => {
      expect(wrapper_Column.find('Link').length).toBe(1)
    })
  })

  describe('<SideBar BottomBlock />', () => {
    const wrapper_Column = shallow(<SideBar.Bottom {...props} />)
    
    it('renders child', () => {
      expect(wrapper_Column.find('div.child').length).toBe(1)
    })
  })

  describe('<SideBar SubSideBar />', () => {
    const wrapper_Column = shallow(<SideBar.SubSideBar {...props} />)
    
    it('renders child', () => {
      expect(wrapper_Column.find('div.child').length).toBe(1)
    })
  })
  
  describe('<SideBar SubSideBarHeader />', () => {
    const wrapper_Column = shallow(<SideBar.SubSideBar.Header {...props} />)
    
    it('renders child', () => {
      expect(wrapper_Column.find('div.child').length).toBe(1)
    })
  })

  describe('<SideBar SubSideBarItem />', () => {
    const wrapper_Column = shallow(<SideBar.SubSideBar.Item {...props} />)

    it('renders one Link component', () => {
      expect(wrapper_Column.find('Link').length).toBe(1)
    })
  })
});
