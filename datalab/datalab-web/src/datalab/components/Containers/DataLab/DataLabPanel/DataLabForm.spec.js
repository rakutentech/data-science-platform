import React from 'react'
import { shallow } from 'enzyme'
import DataLabForm from './DataLabForm'
import { BrowserRouter as Router } from 'react-router-dom';

describe('<DataLabForm />', () => {
  const props = {
    changeDataLabInstances: {},
    dispatch: jest.fn(),
    appDataLabSettings: [],
    appInstanceTypeSettings: [],
    appStorageSettings: [],
    history: new Router().history,
  }
  const wrapper = shallow(
    <Router>
      <DataLabForm.WrappedComponent {...props} />
    </Router>
  )

  it('renders properly', () => {
    expect(wrapper).toMatchSnapshot();
  })

  it('should render the component only when the condition passes', () => {
    expect(wrapper.dive().dive().html()).not.toBe(null)
  })
})