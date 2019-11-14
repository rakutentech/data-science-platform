import React from 'react'
import ToolBar from '../../../ToolBar';
import { Table } from 'react-bootstrap';
import PropTypes from 'prop-types';

const ProfilePanel = (props) => {
  const { profile } = props
  return (
    <div className="main-context">
      <ToolBar title="Profile">
      </ToolBar>
      <Table className="bg-white profile-table">
        <thead>
          <tr>
            <th>Item</th>
            <th>Value</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Name</td>
            <td>{profile.Username}</td>
          </tr>
          <tr>
            <td>AuthType</td>
            <td>{profile.AuthType}</td>
          </tr>
          <tr>
            <td>Group</td>
            <td>{profile.Group}</td>
          </tr>
          <tr>
            <td>Namespace</td>
            <td>{profile.Namespace}</td>
          </tr>
          <tr>
            <td>Token</td>
            <td>{profile.UserToken}</td>
          </tr>
        </tbody>
      </Table>
    </div>
  )
}

ProfilePanel.propTypes = {
  profile: PropTypes.object
}

export default ProfilePanel