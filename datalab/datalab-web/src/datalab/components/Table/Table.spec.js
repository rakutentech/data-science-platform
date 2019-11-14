import React from 'react';
import Table from './index'
import { shallow } from 'enzyme';

describe('<Table />', () => {
  const wrapper = shallow(<Table />)
  const mockOnClick = jest.fn()
  const props = {
    data: [],
    children: '',
  }

  it('renders properly', () => {
    expect(wrapper).toMatchSnapshot();
  })

  describe('<Table TableColumn />', () => {
    const wrapper_Column = shallow(<Table.Column {...props} />)

    it('renders one <TableHeaderColumn /> component', () => {
      expect(wrapper_Column.find('TableHeaderColumn').length).toBe(1)
    })
  })

  describe('<Table actionColumnFormatter />', () => {
    const wrapper_mount = shallow(<Table.actionFomatter {...props} buildEditPageUrl='/url'
      deleteAction={mockOnClick}
      editAction={mockOnClick} />);
    it('renders actionColumnFormatter', () => {
      expect(wrapper_mount.isEmptyRender()).toEqual(false);
    });
  });

  describe('<Table actionColumnFormatter />', () => {
    const wrapper_mount = shallow(<Table.actionFomatter {...props} buildEditPageUrl='/url'
      deleteAction={mockOnClick}
      editAction={mockOnClick} />);
    it('renders actionColumnFormatter', () => {
      expect(wrapper_mount.isEmptyRender()).toEqual(false);
    });
  });
});
