import React from 'react';
import {ResourceBar, CircleChart} from './index'
import { shallow } from 'enzyme';

describe('<ResourceBar />', () => {
  const props = {
    usage: 1,
    total: 1,
    width: '100px',
    className: 'class_name'
  }
  const wrapper = shallow(<ResourceBar {...props} />)

  it('renders properly', () => {
    expect(wrapper).toMatchSnapshot();
  })

  it('renders one resource-bar block', () => {
    expect(wrapper.find('.resource-bar').length).toBe(1)
  })

  it('renders one float-left resource-bar__message block', () => {
    expect(wrapper.find('.float-left.resource-bar__message').length).toBe(1)
  })

  it('renders one text-right resource-bar__message block', () => {
    expect(wrapper.find('.text-right.resource-bar__message').length).toBe(1)
  })
});

describe('<CircleChart />', () => {
  const props = {
    title: 'Title',
    data: [],
    width: 100,
    className: 'class_name'
  }
  const wrapper = shallow(<CircleChart {...props} />)

  it('renders properly', () => {
    expect(wrapper).toMatchSnapshot();
  })

  it('renders one Doughnut block', () => {
    expect(wrapper.find('Doughnut').length).toBe(1)
  })

  it('match title text', () => {
    expect(wrapper.find('.text-center').text()).toBe(props.title)
  })
});
