import React from 'react';
import GroupForm from './index'
import { shallow } from 'enzyme';

describe('<GroupForm />', () => {
  const mockOnChange = jest.fn()
  const props = {
    failureMessage: '',
    onAdd: mockOnChange,
    onUpdate: mockOnChange,
    onDelete: mockOnChange,
    groupSettings: []
  }
  const newGroupName = 'newGroupName'
  const initialState = {
    newGroupName: '',
    groupName:'',
    selectedID: 0,
    failureMessage: ''
  }
  const wrapper = shallow(<GroupForm {...props} />)

  it('renders properly', () => {
    expect(wrapper).toMatchSnapshot();
  });

  it('initialize GroupForm with initial state', () => {
    expect(wrapper.state()).toEqual(initialState)
  })

  
  describe(`when typing into ${newGroupName} input`, () => {
    beforeEach(() => {
      wrapper.find(`[name="${newGroupName}"]`).simulate('change', {
        target: {
          name: newGroupName,
          value: newGroupName,
        },
      })
    })

    it(`updates ${newGroupName} field in state`, () => {
      expect(wrapper.state().newGroupName).toEqual(newGroupName)
    })
  })

  describe('add-gray-button Add click event', () => {
    it('new tag successfully added', () => {
      wrapper.find('button.add-gray-button').simulate('click')
      expect(wrapper.state()).toEqual(initialState)
    })

    it('onAdd function has been called', () => {
      expect(mockOnChange).toHaveBeenCalledTimes(1)
    })
  })
});