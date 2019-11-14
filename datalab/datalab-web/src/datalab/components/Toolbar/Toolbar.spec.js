import React from 'react';
import Toolbar from './index'
import { shallow } from 'enzyme';

describe('<Toolbar />', () => {
  const wrapper = shallow(<Toolbar />)
  const mockOnClick = jest.fn()
  const props = {
    url: '',
    onClick: mockOnClick,
    title: ''
  }

  it('renders properly', () => {
    expect(wrapper).toMatchSnapshot();
  })

  describe('<Toolbar AddNewButton />', () => {
    const wrapper_AddNew = shallow(<Toolbar.AddNew {...props} />)

    it('renders one <Link /> component', () => {
      expect(wrapper_AddNew.find('Link').length).toBe(1)
    })

    it('dispatches the `onClick()` method it receives from props in <Link /> component', () => {
      wrapper_AddNew.find('Link').simulate('click')
      expect(mockOnClick.mock.calls.length).toEqual(1)
    })
  })

  describe('<Toolbar ManageButton />', () => {
    const wrapper_Manage = shallow(<Toolbar.Manage {...props} />);
    
    it('renders one <Link /> component', () => {
      expect(wrapper_Manage.find('Link').length).toBe(1);
    });

    it('dispatches the `onClick()` method it receives from props in <Link /> component', () => {
      wrapper_Manage.find('Link').simulate('click', {
        preventDefault: () => { },
        stopPropagation: () => { }
      })
      expect(mockOnClick.mock.calls.length).toEqual(2);
    });
  });

  describe('<Toolbar RefreshButton />', () => {
    const wrapper_Refresh = shallow(<Toolbar.Refresh {...props} />);

    it('renders one <Link /> component', () => {
      expect(wrapper_Refresh.find('Link').length).toBe(1);
    });

    it('dispatches the `onClick()` method it receives from props in <Link /> component', () => {
      wrapper_Refresh.find('Link').simulate('click', {
        preventDefault: () => { },
        stopPropagation: () => { }
      })
      expect(mockOnClick.mock.calls.length).toEqual(3);
    });
  });
});
