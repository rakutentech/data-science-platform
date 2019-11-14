import React from 'react';
import LoginForm from './LoginForm'
import { shallow } from 'enzyme';

describe('<LoginForm />', () => {
  const mockOnChange = jest.fn()
  const props = {
    loginFailure: false,
    login: mockOnChange
  }
  const initialState = {
    username: '',
    password: '',
    rememberMe: false,
    validated: ''
  }
  const username = 'username'
  const password = 'password'
  const wrapper = shallow(<LoginForm {...props} />)
  const checkValidity = () => wrapper.state().username === '' ||
    wrapper.state().password === '' ? false : true
  const form_props = {
    preventDefault: () => { },
    stopPropagation: () => { },
    target: {
      checkValidity: checkValidity
    }
  }

  it('renders properly', () => {
    expect(wrapper).toMatchSnapshot();
  });

  it('initialize LoginForm with initial state', () => {
    expect(wrapper.state()).toEqual(initialState)
  })

  describe('form submit event', () => {
    it('form submit false works', () => {
      wrapper.find('form').simulate('submit', form_props)
      expect(wrapper.state().validated).toEqual('was-validated')
    })
  })

  describe(`when typing into ${username} input`, () => {
    beforeEach(() => {
      wrapper.find(`[name="${username}"]`).simulate('change', {
        target: {
          name: username,
          value: username,
        },
      })
    })

    it(`updates ${username} field in state`, () => {
      expect(wrapper.state().username).toEqual(username)
    })
  })

  describe(`when typing into ${password} input`, () => {
    beforeEach(() => {
      wrapper.find(`[name="${password}"]`).simulate('change', {
        target: {
          name: password,
          value: password,
        },
      })
    })

    it(`updates ${password} field in state`, () => {
      expect(wrapper.state().password).toEqual(password)
    })
  })

  describe('when typing into rememberMe input', () => {
    beforeEach(() => {
      wrapper.find('[name="rememberMe"]').simulate('change', {
        target: {
          name: 'rememberMe',
          checked: true,
          type: 'checkbox'
        },
      })
    })

    it('updates rememberMe field in state', () => {
      expect(wrapper.state().rememberMe).toEqual(true)
    })
  })

  describe('form submit event', () => {
    it('form submit true works', () => {
      wrapper.find('form').simulate('submit', form_props)
      expect(mockOnChange).toHaveBeenCalledTimes(1)
    })
  })
});