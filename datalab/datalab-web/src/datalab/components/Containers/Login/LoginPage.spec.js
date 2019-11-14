import React from 'react';

import LoginPage from './LoginPage'
import LoginForm from './LoginForm'
import { shallow } from 'enzyme';

describe('<LoginPage />', () => {
  const props = {
    serverName: 'serverName',
    loginFailure: false,
    login: () => {}
  }
  const wrapper = shallow(<LoginPage {...props} />);
  
  it('renders properly', () => {
    expect(wrapper).toMatchSnapshot();
  });

  it('renders one <LoginForm /> component', () => {
    expect(wrapper.find(LoginForm).length).toBe(1);
  });

  it('renders one <LoginLogo /> component', () => {
    expect(wrapper.find('LoginLogo').length).toBe(1);
  });
});