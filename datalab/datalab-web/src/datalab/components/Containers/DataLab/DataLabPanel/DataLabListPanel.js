import React, { Component } from 'react';
import Table from '../../../Table'
import ToolBar from '../../../ToolBar';
import ActiveStatus from '../../../ActiveStatus';
import PropTypes from 'prop-types';
import actions from '../../../../actions';
import { userConstants } from '../../../../constants/app';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { isRunning, runningTimeMessage } from '../../../../helper'
import { iconsImages } from '../../../../constants/icons_images'
const LOADING_TXT = 'Loading...'
const NO_INST_TXT = 'There is no instance/function created yet'

class DataLabListPanel extends Component {
  static propTypes = {
    dispatch: PropTypes.func,
    dataLabInstances: PropTypes.array,
    appInstanceTypeSettings: PropTypes.array,
    typeName: PropTypes.string,
    typeGroup: PropTypes.string,
  }
  constructor(props) {
    super(props);
    const { dispatch } = this.props
    dispatch(actions.fetchResource(userConstants.GET_DATALAB_INSTANCES_REQUEST))
    this.state = {
      dataLabInstances: null,
      nodata_text: LOADING_TXT
    }
  }
  componentDidMount = () => {
    if (this.props.dataLabInstances && this.state.dataLabInstances !== null && this.state.nodata_text === LOADING_TXT) {
      if (this.props.dataLabInstances.length === 0)
        this.setState({
          nodata_text: NO_INST_TXT
        })
    }
  }
  componentDidUpdate = (prevProps) => {
    const dataLabInstances = this.props.dataLabInstances
    const prevDataLabInstances = prevProps.dataLabInstances
    if (prevDataLabInstances != dataLabInstances) {
      this.setState({
        dataLabInstances: dataLabInstances
      })
    }
    if (dataLabInstances)
      if (dataLabInstances.length === 0 && this.state.nodata_text === LOADING_TXT) {
        this.setState({
          nodata_text: NO_INST_TXT
        })
      }
  }
  render() {
    const { dispatch, appInstanceTypeSettings, typeName, typeGroup } = this.props
    const instanceTypes = appInstanceTypeSettings.length > 0 ? appInstanceTypeSettings.reduce((map, obj) => {
      map[obj.Name] = {
        usage: `${obj.CPU} CPU / ${obj.Memory} ${obj.MemoryScale} Memory` + (obj.GPU > 0 ? ` / ${obj.GPU} GPU` : '')
      }
      return map
    }, {}) : []

    const dataLabInstances = this.state.dataLabInstances ? this.state.dataLabInstances
      .filter(dataLab => (!typeName && !typeGroup) || (dataLab.TypeName == typeName && dataLab.TypeGroup == typeGroup))
      .map(dataLab => {
        return {
          Name: dataLab.Name,
          TypeName: dataLab.TypeName,
          TypeGroup: dataLab.TypeGroup,
          Status: {
            instanceTypeDescription: instanceTypes.length > 0 && 'usage' in instanceTypes[dataLab.InstanceTypeName] ? instanceTypes[dataLab.InstanceTypeName].usage : '',
            isRunning: isRunning(dataLab),
          },
          Restarts: dataLab.Restarts,
          Age: runningTimeMessage(dataLab),
          CreateAt: dataLab.CreateAt,
          URL: dataLab.URL
        }
      }) : []
    const options = {
      noDataText: this.state.nodata_text,
      sortName: 'Age',
      sortOrder: 'asc'
    };
    return <div>
      <ToolBar title="Instances">
        <ToolBar.AddNew title="New Instance" url="/datalab/new" />
        <ToolBar.Refresh onClick={() => {
          this.setState({ dataLabInstances: [] })
          this.setState({ nodata_text: LOADING_TXT })
          dispatch(actions.fetchResource(userConstants.GET_DATALAB_INSTANCES_REQUEST))
        }} />
      </ToolBar>
      <div>
        <Table id="Name" data={dataLabInstances} options={options}>
          <Table.Column className="searchable-column" filter={{ type: 'TextFilter', delay: 100 }} dataField="Name" width="16vw" isKey={true} dataSort={true} dataFormat={
            (name, row) => {
              return (
                <div className="datalab-table-name">
                  <img className="icon-image" src={row.active_icon || iconsImages.LAB_ICON} />
                  <div className="header-title-wrapper">
                    <Link className="datalab-link" to={`/datalab/${row.TypeGroup}/${row.TypeName}/${name}`}>{name}</Link>
                    <div className="datalab-submessage">{row.TypeName}</div>
                  </div>
                </div>
              )
            }}
          >Name</Table.Column>
          <Table.Column dataField="Status" width="18vw" dataFormat={(obj) => {
            return <div>
              <div>{obj.instanceTypeDescription}</div>
              <ActiveStatus isRunning={obj.isRunning} />
              {obj.isRunning ? 'Running' : 'Pending'}
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
            dataFormat={(url, obj) => {
              return url && obj.Status.isRunning ? <a className="datalab-link" target="_blank" rel="noopener noreferrer" href={url}>Open</a> : <div></div>
            }}>
            Action
          </Table.Column>
        </Table>
      </div>
    </div>
  }
}

export default connect((state) => {
  return {
    dataLabInstances: state.dataLabInstances.dataLabInstances,
  }
})(DataLabListPanel)