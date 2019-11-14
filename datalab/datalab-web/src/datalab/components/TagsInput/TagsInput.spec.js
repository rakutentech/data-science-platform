import React from 'react';
import TagsInput from './index'
import { shallow } from 'enzyme';

describe('<TagsInput />', () => {
  const mockOnChange = jest.fn()
  const newTagKey = 'newTagKey'
  const newTagValue = 'newTagValue'
  const tagKey = 'tagKey'
  const tagValue = 'tagValue'
  const propsTags = [[0, newTagKey, newTagValue]]
  const newTags = [[1, newTagKey, newTagValue]]
  const newTagsState = propsTags.concat(newTags)

  const initialState = {
    tags: propsTags,
    newTagKey: '',
    newTagValue: ''
  }

  const props = {
    tags: { newTagKey: newTagValue },
    onChange: mockOnChange,
  }

  const wrapper = shallow(<TagsInput {...props} />)

  it('renders properly', () => {
    expect(wrapper).toMatchSnapshot();
  });

  it('initialize TagsInput with initial state', () => {
    expect(wrapper.state()).toEqual(initialState)
  })

  describe(`when typing into ${newTagKey} input`, () => {

    beforeEach(() => {
      wrapper.find(`[name="${newTagKey}"]`).simulate('change', {
        target: {
          name: newTagKey,
          value: newTagKey,
        },
      })
    })

    it(`updates ${newTagKey} field in state`, () => {
      expect(wrapper.state().newTagKey).toEqual(newTagKey)
    })
  })

  describe(`when typing into ${newTagValue} input`, () => {

    beforeEach(() => {
      wrapper.find(`[name="${newTagValue}"]`).simulate('change', {
        target: {
          name: newTagValue,
          value: newTagValue,
        },
      })
    })

    it(`updates ${newTagValue} field in state`, () => {
      expect(wrapper.state().newTagValue).toEqual(newTagValue)
    })
  })

  describe('new-tag-button click event', () => {
    it('new tag successfully added', () => {
      wrapper.find('.new-tag-button').simulate('click', {
        preventDefault: () => { },
        stopPropagation: () => { },
      })
      expect(wrapper.state().tags).toEqual(newTagsState)
    })
  })

  describe(`when typing into existing ${tagKey} input`, () => {

    beforeEach(() => {
      let first_tag = wrapper.state().tags[0]
      wrapper.find(`[name="${tagKey}"]`).first().simulate('change', {
        target: {
          index: first_tag[0],
          getAttribute: function () { return first_tag[0] },
          name: tagKey,
          value: tagKey,
        },
      })
    })

    it(`updates ${tagKey} field of the first tag in state`, () => {
      expect(wrapper.state().tags[0][1]).toEqual(tagKey)
    })
  })

  describe(`when typing into existing ${tagValue} input`, () => {

    beforeEach(() => {
      let first_tag = wrapper.state().tags[0]
      wrapper.find(`[name="${tagValue}"]`).first().simulate('change', {
        target: {
          index: first_tag[0],
          getAttribute: function () { return first_tag[0] },
          name: tagValue,
          value: tagValue,
        },
      })
    })

    it(`updates ${tagValue} field of the first tag in state`, () => {
      expect(wrapper.state().tags[0][2]).toEqual(tagValue)
    })
  })

  describe('remove-tag-button click event', () => {
    it('tag successfully removed', () => {
      wrapper.find('.remove-tag-button').first().simulate('click', {
        preventDefault: () => { },
        stopPropagation: () => { },
        target: {
          getAttribute: function () { return 0 },
        }
      })
      expect(wrapper.state().tags).toEqual(propsTags)
    })
  })

});