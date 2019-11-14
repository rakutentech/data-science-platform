import React from 'react';
import {AdminLogin, AdminLoginPage} from './AdminLogin'
import { shallow } from 'enzyme';

describe('<AdminLogin />', () => {
  const mockOnChange = jest.fn()
  const props = {
    failure: false,
    history: {},
    login: mockOnChange,
    appRoot: ''
  }
  const wrapper = shallow(<AdminLogin AdminLoginPage={AdminLoginPage} {...props} />);
  
  it('renders properly', () => {
    expect(wrapper).toMatchSnapshot();
  });
});