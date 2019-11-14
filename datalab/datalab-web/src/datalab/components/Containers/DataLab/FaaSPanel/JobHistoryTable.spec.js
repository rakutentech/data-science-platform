import React from 'react';
import JobHistoryTable from './JobHistoryTable'
import { shallow } from 'enzyme';

describe('<JobHistoryTable />', () => {
  const props = {
    jobInstances: ['first', 'second'],
    instanceName: 'instanceName',
    jobInstanceLog: 'jobInstanceLog',
    killJob: jest.fn(),
    getJobLog: jest.fn(),
  }
  const initialState = {
    showModal: false,
    tabKey: 'information',
    job: {},
  }
  const wrapper = shallow(<JobHistoryTable {...props} />)

  it('renders properly', () => {
    expect(wrapper).toMatchSnapshot();
  });

  it('initialize JobHistoryTable with initial state', () => {
    expect(wrapper.state()).toEqual(initialState)
  })

  describe('when click kill', () => {
    beforeEach(() => {
      wrapper.find('a').simulate('click')
      expect(props.killJob).toHaveBeenCalledTimes(1)
    })
  })
});