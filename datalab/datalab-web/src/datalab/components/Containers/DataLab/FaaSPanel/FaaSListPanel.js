import React, { Component } from 'react';
import Table from '../../../Table'
import ToolBar from '../../../ToolBar';
import PropTypes from 'prop-types';
import actions from '../../../../actions';
import { userConstants } from '../../../../constants/app';
import { formConstants } from '../../../../constants/form';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { runningTimeMessage } from '../../../../helper'
import { iconsImages } from '../../../../constants/icons_images'
const LOADING_TXT = 'Loading...'
const NO_INST_TXT = 'There is no instance/function created yet'
const DEFAULT_LOADING_TXT = {
  [formConstants.HTTP_TRIGGER]: LOADING_TXT,
  [formConstants.EVENT_TRIGGER]: LOADING_TXT,
}
const DEFAULT_NO_DATA_TXT = {
  [formConstants.HTTP_TRIGGER]: NO_INST_TXT,
  [formConstants.EVENT_TRIGGER]: NO_INST_TXT,
}

class FaaSListPanel extends Component {
  static propTypes = {
    dispatch: PropTypes.func,
    functionInstances: PropTypes.array,
    appInstanceTypeSettings: PropTypes.array,
    typeName: PropTypes.string,
  }
  constructor(props) {
    super(props);
    const { dispatch } = this.props
    dispatch(actions.fetchResource(userConstants.GET_FUNCTION_INSTANCES_REQUEST))
    this.state = {
      functionInstances: null,
      nodata_text: DEFAULT_LOADING_TXT
    }
  }
  componentDidMount = () => {
    if (this.props.functionInstances && this.state.functionInstances !== null && this.state.nodata_text === LOADING_TXT) {
      if (this.props.functionInstances.length === 0) {
        this.setState({
          nodata_text: DEFAULT_NO_DATA_TXT
        })
      }
    }
  }
  componentDidUpdate = (prevProps) => {
    const functionInstances = this.props.functionInstances
    const prevFunctionInstances = prevProps.functionInstances
    if (prevFunctionInstances != functionInstances) {
      this.setState({
        functionInstances: functionInstances
      })
      let all_triggers = [...new Set(functionInstances.map(item => item.Trigger))]
      let nodata_text_updated = {
        [formConstants.HTTP_TRIGGER]: NO_INST_TXT,
        [formConstants.EVENT_TRIGGER]: NO_INST_TXT,
      }
      all_triggers.forEach(val => nodata_text_updated[val] = LOADING_TXT)
      this.setState({
        nodata_text: nodata_text_updated
      })
    }
    if (functionInstances) {
      if (functionInstances.length === 0 && this.state.functionInstances !== null && this.state.nodata_text !== DEFAULT_NO_DATA_TXT) {
        this.setState({
          nodata_text: DEFAULT_NO_DATA_TXT
        })
      }
    }
  }
  render() {
    const { dispatch, appInstanceTypeSettings } = this.props
    const instanceTypes = appInstanceTypeSettings.length > 0 ? appInstanceTypeSettings.reduce((map, obj) => {
      map[obj.Name] = {
        usage: `${obj.CPU} CPU / ${obj.Memory} ${obj.MemoryScale} Memory` + (obj.GPU > 0 ? ` / ${obj.GPU} GPU` : '')
      }
      return map
    }, {}) : []

    const functionInstances = this.state.functionInstances ? this.state.functionInstances
      .map(instance => {
        return {
          Name: instance.Name,
          Trigger: instance.Trigger,
          Status: {
            instanceTypeDescription: instanceTypes.length > 0 && 'usage' in instanceTypes[instance.InstanceTypeName] ? instanceTypes[instance.InstanceTypeName].usage : '',
            RunningInstances: instance.RunningInstances,
            PendingInstances: instance.PendingInstances
          },
          Restarts: instance.Restarts,
          Age: runningTimeMessage(instance),
          CreateAt: instance.CreateAt,
          URL: instance.URL
        }
      }) : []

    return <div>
      <ToolBar title="Functions">
        <ToolBar.AddNew title="New Instance" url="/function/new" />
        <ToolBar.Refresh onClick={() => {
          this.setState({ functionInstances: null })
          this.setState({ nodata_text: DEFAULT_LOADING_TXT })
          dispatch(actions.fetchResource(userConstants.GET_FUNCTION_INSTANCES_REQUEST))
        }} />
      </ToolBar>
      <div>
        <div className="mb-3">
          <h2 className="sub-sidebar-header">HTTP Functions</h2>
          {FunctionInstancesTable(formConstants.HTTP_TRIGGER,
            functionInstances.filter(ins => ins.Trigger === formConstants.HTTP_TRIGGER), this.state['nodata_text'][formConstants.HTTP_TRIGGER])}
        </div>
        <div className="mb-3">
          <h2 className="sub-sidebar-header">Event Functions</h2>
          {FunctionInstancesTable(formConstants.EVENT_TRIGGER,
            functionInstances.filter(ins => ins.Trigger === formConstants.EVENT_TRIGGER), this.state['nodata_text'][formConstants.EVENT_TRIGGER])}
        </div>
      </div>
    </div>
  }
}

const FunctionInstancesTable = (trigger, instances, nodata_text) => {
  const options = {
    noDataText: nodata_text,
    sortName: 'Age',
    sortOrder: 'asc'
  };
  return <Table data={instances} options={options}>
    <Table.Column className="searchable-column" filter={{ type: 'TextFilter', delay: 100 }} dataField="Name" width="16vw" isKey={true} dataSort={true} dataFormat={
      (name) => {
        return <div>
          <Link className="datalab-link faas-title-link" to={`/function/${trigger}/${name}`}>
            <img className="icon-image" src={trigger === formConstants.HTTP_TRIGGER ? iconsImages.FUNC_HTTP_ICON : iconsImages.FUNC_EVENT_ICON} />
            {name}
          </Link>
        </div>
      }}
    >Name</Table.Column>
    <Table.Column dataField="Status" width="18vw" dataFormat={(obj) => {
      return <div>
        <div>{obj.instanceTypeDescription}</div>
        <span className="text-primary">{obj.RunningInstances}</span> Running
        / <span className="text-warning">{obj.PendingInstances}</span>  Pending
      </div>
    }}>Status</Table.Column>
    <Table.Column dataField="Restarts" dataSort={true}>Restarts</Table.Column>
    <Table.Column dataField="Age" sortFunc={(a, b, order) => {
      if (order === 'asc') {
        return b.CreateAt - a.CreateAt;
      }
      return a.CreateAt - b.CreateAt;
    }} dataSort={true}>Age</Table.Column>
    <Table.Column
      dataField="URL"
      dataFormat={(url, row) => {
        if (row.Trigger == formConstants.EVENT_TRIGGER) {
          return url && (trigger === formConstants.HTTP_TRIGGER ? row.Status.RunningInstances > 0 : true) ? <Link className="datalab-link" target="_blank" rel="noopener noreferrer" to={url}>Open</Link> : <div></div>
        } else {
          return url && (trigger === formConstants.HTTP_TRIGGER ? row.Status.RunningInstances > 0 : true) ? <a className="datalab-link" target="_blank" rel="noopener noreferrer" href={url}>Open</a> : <div></div>
        }
      }}>
      Action
    </Table.Column>
  </Table>
}

export default connect((state) => {
  return {
    functionInstances: state.functionInstances.functionInstances,
  }
})(FaaSListPanel)