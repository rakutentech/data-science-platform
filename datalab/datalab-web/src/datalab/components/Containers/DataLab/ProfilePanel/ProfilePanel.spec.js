import React from 'react'
import { shallow } from 'enzyme'
import ProfilePanel from './index'

describe('<ProfilePanel />', () => {
  const props = {
    profile: {
      Username: 'Username2',
      AuthType: 'AuthType2',
      Group: 'Group2',
      Namespace: 'Namespace2',
      UserToken: 'UserToken2'
    }
  }
  const wrapper = shallow(<ProfilePanel {...props} />);

  it('renders properly', () => {
    expect(wrapper).toMatchSnapshot();
  });

  describe('testing all pros', () => {
    it('props.profile.Username properly', () => {
      expect(wrapper.find('tbody tr').at(0).find('td').at(1).text()).toEqual(props.profile.Username)
    });
  })

  describe('testing all pros', () => {
    it('props.profile.AuthType properly', () => {
      expect(wrapper.find('tbody tr').at(1).find('td').at(1).text()).toEqual(props.profile.AuthType)
    });
  })

  describe('testing all pros', () => {
    it('props.profile.Group properly', () => {
      expect(wrapper.find('tbody tr').at(2).find('td').at(1).text()).toEqual(props.profile.Group)
    });
  })

  describe('testing all pros', () => {
    it('props.profile.Namespace properly', () => {
      expect(wrapper.find('tbody tr').at(3).find('td').at(1).text()).toEqual(props.profile.Namespace)
    });
  })

  describe('testing all pros', () => {
    it('props.profile.UserToken properly', () => {
      expect(wrapper.find('tbody tr').at(4).find('td').at(1).text()).toEqual(props.profile.UserToken)
    });
  })
})