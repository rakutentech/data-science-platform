import React from 'react';
import {UserLogin, UserLoginPage} from './UserLogin'
import { shallow } from 'enzyme';

describe('<UserLogin />', () => {
  const mockOnChange = jest.fn()
  const props = {
    failure: false,
    history: {},
    login: mockOnChange,
    appRoot: ''
  }
  const wrapper = shallow(<UserLogin UserLoginPage={UserLoginPage} {...props} />);
  
  it('renders properly', () => {
    expect(wrapper).toMatchSnapshot();
  });
});