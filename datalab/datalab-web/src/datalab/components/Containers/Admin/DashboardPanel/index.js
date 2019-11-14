
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Row, Col } from 'react-bootstrap'
import { adminConstants } from '../../../../constants/admin';
import actions from '../../../../actions';
import { ResourceBar, CircleChart, CircleChartColors } from '../../../ResourceChart';

class DashboardPanel extends Component {
  static propTypes = {
    clusterInfo: PropTypes.object,
    dispatch: PropTypes.func
  }
  constructor(props) {
    super(props);
    const { dispatch } = this.props;
    dispatch(actions.fetchResource(adminConstants.GET_CLUSTER_INFO_REQUEST))
  }
  buildCircleChartData = (clusterInfo, dataLabel) => {
    const circleColors = CircleChartColors()
    return clusterInfo ? 'Groups' in clusterInfo ? clusterInfo['Groups'].map(group => {
      return {
        label: group['Name'],
        value: group['Data'][dataLabel],
        bgColor: circleColors.next().value
      }
    }
    ) : [] : []
  }
  buildGroupStatus = (clusterInfo) => {
    const circleColors = CircleChartColors()
    return clusterInfo ? 'Groups' in clusterInfo ? clusterInfo['Groups'].map(group => {
      return (
        <Row key={group['Name']} className="border-bottom">
          <Col className="text-in-panel">
            <div className={'d-inline-block w-1 p-1 mr-2 rounded-circle'}
              style={{ background: circleColors.next().value }}>
            </div>
            {group['Name']}
          </Col>
          <Col className="text-in-panel">{group['Data']['User']}</Col>
          <Col className="text-in-panel">{group['Data']['JobRunning']}</Col>
        </Row>
      )
    }
    ) : <div>Empty status</div> : <div>Empty status</div>
  }

  buildUsageBar = (clusterInfo, header, usageKey, TotalKey) => {
    return (
      <Col className="bars-block block-panel">
        <h2>{header}</h2>
        <ResourceBar
          usage={clusterInfo && clusterInfo[usageKey] ? clusterInfo[usageKey] : 0}
          total={clusterInfo && clusterInfo[TotalKey] ? clusterInfo[TotalKey] : 0}></ResourceBar>
      </Col>)
  }

  buildNamespaceChart = (clusterInfo) => {
    return clusterInfo['Namespaces'] ? clusterInfo['Namespaces'].map(namespace =>
      <Col className="block-panel namespace-panel" key={namespace.Name}>
        <Row className="border-bottom">
          <h2>{namespace.Name}</h2>
        </Row>
        <Row className="bar-block">
          <Col md={3} className="bar-title">CPU</Col>
          <Col md={9}>
            <ResourceBar
              usage={namespace['Data'] ? namespace['Data']['CPUUsage'] : 0}
              total={namespace['Data'] ? namespace['Data']['CPUTotal'] : 0}>
            </ResourceBar>
          </Col>
        </Row>
        <Row className="bar-block">
          <Col md={3} className="bar-title">Memory</Col>
          <Col md={9}>
            <ResourceBar
              usage={namespace['Data'] ? namespace['Data']['MemoryUsage'] : 0}
              total={namespace['Data'] ? namespace['Data']['MemoryTotal'] : 0}>
            </ResourceBar>
          </Col>
        </Row>
        <Row className="bar-block">
          <Col md={3} className="bar-title">GPU</Col>
          <Col md={9}>
            <ResourceBar
              usage={namespace['Data'] ? namespace['Data']['GPUUsage'] : 0}
              total={namespace['Data'] ? namespace['Data']['GPUTotal'] : 0}>
            </ResourceBar>
          </Col>
        </Row>
      </Col>) : <Col className="block-panel">Empty</Col>
  }

  isEmptyDoughnut = (data) => {
    let zeros = 0
    data.forEach(v => {
      if (v.value === 0) {
        zeros++
      }
    })
    return zeros === data.length;
  }

  render() {
    const { clusterInfo } = this.props
    const groupCpuData = this.buildCircleChartData(clusterInfo, 'CPUUsage')
    const groupMemoryData = this.buildCircleChartData(clusterInfo, 'MemoryUsage')
    const groupGpuData = this.buildCircleChartData(clusterInfo, 'GPUUsage')
    return (
      <div className="main-context">
        <div className="title-7-panel mb-2">Total Resource</div>
        <Row className="mb-3 mr-0 ml-0">
          {this.buildUsageBar(clusterInfo, 'CPU Usage', 'CPUUsage', 'CPUTotal')}
          {this.buildUsageBar(clusterInfo, 'Memory Usage', 'MemoryUsage', 'MemoryTotal')}
          {this.buildUsageBar(clusterInfo, 'GPU Usage', 'GPUUsage', 'GPUTotal')}
        </Row>
        <div className="title-7-panel mb-2">Group Status</div>
        <Row className="group-status-block block-panel mb-3 mr-0 ml-0">
          <Col md={4} className="border-right">
            <Row className="border-bottom">
              <Col className="title-5-panel">Name</Col>
              <Col className="title-5-panel">User</Col>
              <Col className="title-5-panel">JobRunning</Col>
            </Row>
            {this.buildGroupStatus(clusterInfo)}
          </Col>
          <Col md={8}>
            <Row className="border-bottom"><Col className="title-5-panel">Resource Usage Graph</Col></Row>
            {this.isEmptyDoughnut(groupCpuData) ? '' : <CircleChart className="doughnut-block" title="CPU" width={104} data={groupCpuData} />}
            {this.isEmptyDoughnut(groupMemoryData) ? '' : <CircleChart className="doughnut-block" title="Memory" width={104} data={groupMemoryData} />}
            {this.isEmptyDoughnut(groupGpuData) ? '' : <CircleChart className="doughnut-block" title="GPU" width={104} data={groupGpuData} />}
          </Col>
        </Row>
        <div className="title-7-panel mb-2">Namespace Usage</div>
        <Row className="mb-3 mr-0 ml-0">
          {this.buildNamespaceChart(clusterInfo)}
        </Row>
      </div>
    )
  }
}

function mapStateToProps(state) {
  return state.clusterInfo;
}

export default connect(mapStateToProps)(DashboardPanel)