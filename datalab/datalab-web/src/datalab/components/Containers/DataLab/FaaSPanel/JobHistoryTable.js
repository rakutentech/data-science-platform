import React, { Component } from 'react';
import Table from '../../../Table'
import PropTypes from 'prop-types';
import { Modal, Tabs, Tab, Form, Table as BootsrapTable } from 'react-bootstrap';
import LoadingPage from '../../../LoadingPage';
import { jobConstants } from '../../../../constants/app'


const durationToString = (duration, createAt) => {
  let diff = duration > 0 ? duration : (new Date().getTime() / 1000 - createAt)
  const day = Math.floor(diff / 86400)
  diff = diff - day * 86400
  const hour = Math.floor(diff / 3600)
  diff = diff - hour * 3600
  const min = Math.floor(diff / 60)
  const sec = Math.floor( diff % 60 )
  if (day > 0) {
    return `${day}d${hour}h`
  } else if (hour > 0) {
    return `${hour}h${min}m`
  } else {
    return `${min}m${sec}s`
  }
}

class JobHistoryTable extends Component {
  static propTypes = {
    jobInstances: PropTypes.array,
    instanceName: PropTypes.string,
    jobInstanceLog: PropTypes.string,
    killJob: PropTypes.func,
    getJobLog: PropTypes.func,
  }

  constructor(props) {
    super(props)
    this.state = {
      showModal: false,
      tabKey: 'information',
      job: {},
    }
  }

  handleClose = () => {
    this.setState({
      showModal: false,
      job: {},
    });
  }

  handleShow = (job) => {
    this.setState({
      showModal: true,
      job: job
    });
  }

  render() {
    let modal_status = this.state.job.Status || ''
    const options = {
      noDataText: 'Empty data',
      sortName: 'CreateAt',
      sortOrder: 'desc'
    };
    return <div>
      {this.props.jobInstances ?
        <div className="my-4 mx-5 job-history-table">
          <Table data={this.props.jobInstances} options={options}>
            <Table.Column dataField="JobID" className="searchable-column" filter={{ type: 'TextFilter', delay: 100 }} width="16vw" isKey={true} dataSort={true} dataFormat={
              (jobID, row) => {
                return <div>
                  <a href="#" onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    this.props.getJobLog(this.props.instanceName, jobID)
                    this.handleShow(row)
                  }}>{jobID}</a>
                </div>
              }}
            >JobID</Table.Column>
            <Table.Column dataField="Owner" dataSort={true}>Owner</Table.Column>
            <Table.Column sort="true" id="CreateAt" dataField="CreateAt" dataSort={true}
              width="250px"
              dataFormat={(createAt) => {
                return <span>{new Date(createAt * 1000).toLocaleString()}</span>
              }}
            >Start Time</Table.Column>
            <Table.Column dataField="Duration" dataSort={true}
              dataFormat={(duration, row) => {
                return <span>{durationToString(duration, row.CreateAt)}</span>
              }}
            >Duration</Table.Column>
            <Table.Column dataField="Status" dataSort={true}
              dataFormat={(status) => {
                return <div className={`btn ${status.toLowerCase()}`}>{status}</div>
              }}
            >Status</Table.Column>
            <Table.Column
              dataField="JobID"
              dataFormat={(jobID, row) => {
                return row.Status == jobConstants.JOB_RUNNING || row.Status == jobConstants.JOB_PENDING ?
                  <a href="#" onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    this.props.killJob(this.props.instanceName, jobID)
                  }}>kill</a> :
                  <div></div>
              }}>
              Action
            </Table.Column>
          </Table>
          <Modal className="history-modal" show={this.state.showModal} onHide={this.handleClose}>
            <Modal.Header closeButton>
              <Modal.Title>{this.state.storageAction}Job Detail</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <Tabs
                id="controlled-tab-example"
                activeKey={this.state.tabKey}
                onSelect={tabKey => this.setState({ tabKey })}>
                <Tab eventKey="information" title="Information">
                  <BootsrapTable striped bordered hover>
                    <thead>
                      <tr>
                        <th>Item</th>
                        <th>Value</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>JobID</td>
                        <td>{this.state.job.JobID}</td>
                      </tr>
                      <tr>
                        <td>UUID</td>
                        <td>{this.state.job.UUID}</td>
                      </tr>
                      <tr>
                        <td>Namespace</td>
                        <td>{this.state.job.Namespace}</td>
                      </tr>
                      <tr>
                        <td>InstanceTypeName</td>
                        <td>{this.state.job.InstanceTypeName}</td>
                      </tr>
                      <tr>
                        <td>Owner</td>
                        <td>{this.state.job.Namespace}</td>
                      </tr>
                      <tr>
                        <td>Create At</td>
                        <td>{new Date(this.state.job.CreateAt * 1000).toLocaleString()}</td>
                      </tr>
                      <tr>
                        <td>Finish At</td>
                        <td>{this.state.job.FinishAt > 0 ?
                          new Date(this.state.job.FinishAt * 1000).toLocaleString() : ''}</td>
                      </tr>
                      <tr>
                        <td>Duration</td>
                        <td>{durationToString(this.state.job.Duration, this.state.job.CreateAt)}</td>
                      </tr>
                      <tr>
                        <td>Status</td>
                        <td><div className={`btn ${modal_status.toLowerCase()}`}>{this.state.job.Status}</div></td>
                      </tr>
                    </tbody>
                  </BootsrapTable>
                </Tab>
                <Tab eventKey="parameters" title="Parameters">
                  <Form.Control style={{ height: '400px' }} as="textarea" disabled value={this.state.job.Parameters} />
                </Tab>
                <Tab eventKey="log" title="Job Log">
                  <Form.Control style={{ height: '400px' }} as="textarea" disabled value={this.props.jobInstanceLog} />
                </Tab>
              </Tabs>
            </Modal.Body>
            <Modal.Footer>
              <a className={
                (this.state.job.Status == jobConstants.JOB_RUNNING || this.state.job.Status == jobConstants.JOB_PENDING) ?
                  'modal-button__delete' : 'd-none'} href="#" onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                this.props.killJob(this.props.instanceName, this.state.job.JobID)
                this.handleClose();
              }} style={{ margin: '0 auto' }}>
                Kill Job
              </a>
            </Modal.Footer>
          </Modal>
        </div>
        :
        <LoadingPage></LoadingPage>
      }
    </div>
  }
}


export default JobHistoryTable