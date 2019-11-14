import React from 'react';
import { BootstrapTable, TableHeaderColumn } from 'react-bootstrap-table';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';

function actionColumnFormatter(buildEditPageUrl, deleteAction, editAction = undefined) {
  function fomatter(cell, row) {
    return (
      <div>
        {editAction ?
          <Link to="#" onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            editAction(cell, row)
          }} className="mr-2 table-edit-btn">Edit</Link>
          :
          <Link to={buildEditPageUrl(cell)} className="mr-2 table-edit-btn">Edit</Link>
        }
        <Link to="#" className="table-delete-btn" onClick={() => deleteAction(cell)}>Delete</Link>
      </div>
    )
  }
  return fomatter
}

function arrayColumnFormatter(array) {
  return (
    <div>
      {array.map(data => <p className="alert alert-info p-0 m-1 text-center" key={data}>{data}</p>)}
    </div>
  )
}


const TableColumn = (props) => {
  return (
    <TableHeaderColumn className="bg-white" {...props}>{props.children}</TableHeaderColumn>
  )
}

TableColumn.propTypes = {
  children: PropTypes.any
}


const Table = (props) => {
  const options = props.options || { noDataText: 'There is no instance/function created yet' }
  return (
    <BootstrapTable
      containerClass='instances-table'
      trClassName="bg-white"
      options={options}
      data={props.data}
      striped={true}
      hover={true}
      bordered={false}
      pagination>
      {props.children}
    </BootstrapTable>
  )
}

Table.propTypes = {
  data: PropTypes.array,
  options: PropTypes.object,
  children: PropTypes.any
}

Table.Column = TableColumn
Table.actionFomatter = actionColumnFormatter
Table.arrayFomatter = arrayColumnFormatter

export default Table