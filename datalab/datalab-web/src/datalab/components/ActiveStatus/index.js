import React from 'react';
import PropTypes from 'prop-types';

const ActiveStatus = (props) => {
  const bgIconColor = props.isRunning?'bg-success':'bg-warning'
  return <div className={`d-inline-block w-1 p-1 mr-2 rounded-circle ${bgIconColor}`}></div>
}

ActiveStatus.propTypes = {
  isRunning: PropTypes.bool
}

export default ActiveStatus