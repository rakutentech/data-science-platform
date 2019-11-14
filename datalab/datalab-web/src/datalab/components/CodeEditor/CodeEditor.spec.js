import React from 'react'
import { shallow } from 'enzyme'
import CodeEditor from './index'

describe('<CodeEditor />', () => {
  const mockOnChange = jest.fn()
  const props = {
    name: 'name',
    rows: 5,
    width: '100px',
    mode: 'mode',
    value: 'value',
    onChange: mockOnChange,
    wrapEnabled: true
  }
  const wrapper = shallow(<CodeEditor {...props} />)

  it('renders properly', () => {
    expect(wrapper).toMatchSnapshot()
  })

  it('renders one ReactAce', () => {
    expect(wrapper.find('ReactAce').length).toEqual(1)
  })
})