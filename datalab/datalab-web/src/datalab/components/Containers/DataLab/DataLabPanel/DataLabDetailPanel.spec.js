import React from 'react'
import { BrowserRouter as Router } from 'react-router-dom';
import { shallow } from 'enzyme'
import DataLabDetailPanel from './DataLabDetailPanel'
import LoadingPage from '../../../LoadingPage'

describe('<DataLabDetailPanel />', () => {
  let props = {
    dispatch: jest.fn(),
    history: new Router().history,
    dataLabInstance: {},
    changeDataLabInstances: {},
    dataLabInstanceLog: 'dataLabInstanceLog',
    appInstanceTypeSettings: [{
      Name: 'test_Name',
      CPU: 'test_CPU',
      Memory: 'test_Memory',
      MemoryScale: 'test_MemoryScale',
      GPU: 'test_GPU',
    }],
    typeName: 'typeName',
    instanceName: 'instanceName',
  }

  describe('tests with no dataLabInstance.Name', () => {
    const wrapper = shallow(
      <Router>
        <DataLabDetailPanel.WrappedComponent {...props} />
      </Router>
    )

    it('renders properly', () => {
      expect(wrapper).toMatchSnapshot();
    })

    it('has one LoadingPage component', () => {
      expect(wrapper.dive().dive().find(LoadingPage).length).toBe(1)
    })
  })
  
  describe('tests with dataLabInstance.Name', () => {
    props.dataLabInstance = {
      Name: 'test_name',
      InstanceTypeName: 'test_Name',
      Owner: 'test_Owner',
      CreateAt: 5,
      Restarts: 'test_Restarts',
      URL: 'test_URL',
      ID: 'test_ID',
      UUID: 'test_UUID',
      InternalEndpoints: ['test1', 'test2'],
      Tags: 'test_Tags',
    } 
    const wrapper = shallow(
      <Router>
        <DataLabDetailPanel.WrappedComponent {...props} />
      </Router>
    )

    it('renders properly', () => {
      expect(wrapper).toMatchSnapshot();
    })

    it('should render the component only when the condition passes', () => {
      expect(wrapper.dive().dive().html()).not.toBe(null)
    })
  })
})