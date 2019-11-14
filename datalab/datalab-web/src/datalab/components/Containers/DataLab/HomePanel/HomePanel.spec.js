import React from 'react'
import { shallow } from 'enzyme'
import HomePanel from './index'

describe('<HomePanel />', () => {
  const wrapper = shallow(<HomePanel />);

  it('renders properly', () => {
    expect(wrapper).toMatchSnapshot();
  });
})