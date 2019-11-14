import React from 'react';
import FunctionContextInput from './index'
import { shallow } from 'enzyme';

describe('<FunctionContextInput />', () => {
  const mockOnChange = jest.fn()
  const props = {
    functionContext: {
      Code: '',
      Requirement: '',
      GitRepo: '',
      GitBranch: '',
      GitEntrypoint:'',
      ZipFileData: '',
      ZipFileName: '',
      ZipEntrypoint: '',
    },
    mode: 'mode',
    programLanguage: 'programLanguage',
    onChange: mockOnChange
  }
  const newCode = 'newCode'

  const initialState = {
    functionContext: {
      Code: '',
      Requirement: '',
      GitRepo: '',
      GitBranch: '',
      GitEntrypoint:'',
      ZipFileData: '',
      ZipFileName: '',
      ZipEntrypoint: '',
    },
    tabKey: props.mode,
    programLanguage: props.programLanguage,
  }

  const wrapper = shallow(<FunctionContextInput {...props} />)

  it('renders properly', () => {
    expect(wrapper).toMatchSnapshot();
  });

  it('initialize FunctionContextInput with initial state', () => {
    expect(wrapper.state()).toEqual(initialState)
  })

  describe('CodeEditor on change code', () => {
    beforeEach(() => {
      wrapper.find('[name="Code"]').simulate('change', `${newCode}`)
    })

    it('updates functionContext->Code field in state', () => {
      expect(wrapper.state()).toEqual(initialState)
    })

    it('called onChange prop successfully', () => {
      expect(mockOnChange).toHaveBeenCalledTimes(2)
    })
  })

  describe('CodeEditor on change Requirement', () => {
    beforeEach(() => {
      wrapper.find('[name="Requirement"]').simulate('change', `${newCode}`)
    })

    it('updates functionContext->Requirement field in state', () => {
      expect(wrapper.state()).toEqual(initialState)
    })

    it('called onChange prop successfully', () => {
      expect(mockOnChange).toHaveBeenCalledTimes(4)
    })
  })

  describe('CodeEditor on change ZipEntrypoint', () => {
    beforeEach(() => {
      wrapper.find('[name="ZipEntrypoint"]').simulate('change', {
        target: {
          name: newCode
        }
      })
    })

    it('updates functionContext->ZipEntrypoint field in state', () => {
      expect(wrapper.state()).toEqual(initialState)
    })

    it('called onChange prop successfully', () => {
      expect(mockOnChange).toHaveBeenCalledTimes(6)
    })
  })

  describe('CodeEditor on change GitRepo', () => {
    beforeEach(() => {
      wrapper.find('[name="GitRepo"]').simulate('change', {
        target: {
          name: newCode
        }
      })
    })

    it('updates functionContext->GitRepo field in state', () => {
      expect(wrapper.state()).toEqual(initialState)
    })

    it('called onChange prop successfully', () => {
      expect(mockOnChange).toHaveBeenCalledTimes(8)
    })
  })

  describe('CodeEditor on change GitBranch', () => {
    beforeEach(() => {
      wrapper.find('[name="GitBranch"]').simulate('change', {
        target: {
          name: newCode
        }
      })
    })

    it('updates functionContext->GitBranch field in state', () => {
      expect(wrapper.state()).toEqual(initialState)
    })

    it('called onChange prop successfully', () => {
      expect(mockOnChange).toHaveBeenCalledTimes(10)
    })
  })

  describe('CodeEditor on change GitEntrypoint', () => {
    beforeEach(() => {
      wrapper.find('[name="GitEntrypoint"]').simulate('change', {
        target: {
          name: newCode
        }
      })
    })

    it('updates functionContext->GitEntrypoint field in state', () => {
      expect(wrapper.state()).toEqual(initialState)
    })

    it('called onChange prop successfully', () => {
      expect(mockOnChange).toHaveBeenCalledTimes(12)
    })
  })
});