import React, {Component} from 'react';
import { Row, Col, Jumbotron, Card} from 'react-bootstrap'
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import actions from '../../actions'
import { dashboardConstant } from '../../constants/app';
import '../../../assets/styles/pages/dashboard.scss'

class Dashboard extends Component {
  static propTypes = {
    modelNumber: PropTypes.number,
    activeAPINumber: PropTypes.number,
    stoppedAPINumber: PropTypes.number,
    modelList: PropTypes.array,
    apiList: PropTypes.array,
    getDashboardStats: PropTypes.func
  };

  constructor(props) {
    super(props);
    this.props.getDashboardStats()
  }
  render() {
    const { modelNumber, activeAPINumber, stoppedAPINumber, modelList, apiList }  = this.props;

    return (
      <div>
        <Row className='stats-outer'>
          <Col md={4}>
            <Jumbotron className='stats-inner'>
              <h1>{modelNumber}</h1>
              <p>
                Model Number
              </p>
            </Jumbotron>
          </Col>
          <Col md={4}>
            <Jumbotron className='stats-inner'>
              <h1>{activeAPINumber}</h1>
              <p>
                Active API Number
              </p>
            </Jumbotron>
          </Col>
          <Col md={4}>
            <Jumbotron className='stats-inner'>
              <h1>{stoppedAPINumber}</h1>
              <p>
                Stopped API Number
              </p>
            </Jumbotron>
          </Col>
        </Row>
        <Row className='favourite-outer'>
          <Col md={6}>
            Favourite Models
            <Row className='model-outer'>
              {modelList.map((model, index) => {
                return (
                  <Col md={6} key={index} className='model-border'>
                    <Card border="success">
                      <Card.Header className='model-header'>{model.modelName}</Card.Header>
                      <Card.Body className='model-body'>
                        <Card.Text className='model-desc'>
                          {model.modelDesc}
                        </Card.Text>
                        <Card.Text className='model-info'>
                          <span className='model-version'>v{model.version}</span>
                          <span className='model-refresh'>last refreshed: {model.lastRefresh}</span>
                        </Card.Text>
                      </Card.Body>
                    </Card>
                  </Col>
                )
              })}
            </Row>
          </Col>
          <Col md={6}>
            Favourite APIs
            <Row className='model-outer'>
              {apiList.map((api, index) => {
                return (
                  <Col md={6} key={index} className='model-border'>
                    <Card border="info">
                      <Card.Header className='model-header'>{api.apiName}</Card.Header>
                      <Card.Body className='model-body'>
                        <Card.Text className='model-desc'>
                          {api.apiDesc}
                        </Card.Text>
                        <Card.Text className='model-info'>
                          <span className='model-version'>v{api.version}</span>
                          <span className='model-refresh'>last refreshed: {api.lastRefresh}</span>
                        </Card.Text>
                      </Card.Body>
                    </Card>
                  </Col>
                )
              })}
            </Row>
          </Col>
        </Row>
      </div>
    )
  }
}

const mapStateToProps = (state) => {
  return {
    modelNumber: state.dashboardModelNumber.modelNumber,
    activeAPINumber: state.dashboardAPINumber.activeAPINumber,
    stoppedAPINumber: state.dashboardAPINumber.stoppedAPINumber,
    modelList: state.dashboardModelList.modelList,
    apiList: state.dashboardAPIList.apiList
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    getDashboardStats : () => {
      dispatch(actions.fetchResource(dashboardConstant.GET_MODEL_NUMBER));
      dispatch(actions.fetchResource(dashboardConstant.GET_API_NUMBER));
      dispatch(actions.fetchResource(dashboardConstant.GET_MODEL_DASHBOARD_LIST));
      dispatch(actions.fetchResource(dashboardConstant.GET_API_DASHBOARD_LIST));
    }
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(Dashboard);
