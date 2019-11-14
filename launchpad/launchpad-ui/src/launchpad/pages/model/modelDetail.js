import React, {Component} from 'react';
import {Breadcrumb, Button, Col, Form, Nav, Row, Table} from 'react-bootstrap'
import {connect} from 'react-redux';
import PropTypes from 'prop-types';
import actions from '../../actions'
import {modelConstant} from '../../constants/app';
import '../../../assets/styles/pages/modelDetail.scss'
import {convertUTCToLocalTime, timetrans} from '../../services/utils'
import LoadingPage from '../../../launchpad/components/LoadingPage'
import {Link} from 'react-router-dom';
import {NotificationContainer} from 'react-notifications';

class ModelDetail extends Component {
  static propTypes = {
    modelDetail: PropTypes.object,
    getModelDetail: PropTypes.func,
    match: PropTypes.object,
    location: PropTypes.object
  };

  constructor(props) {
    super(props);
    const {params} = props.match;
    const modelName = params.modelName;
    const uuid = params.uuid;
    const modelId = params.modelId;
    const username = params.username;
    const versionName = params.versionName;
    this.props.getModelDetail(modelId, uuid);
    this.state = {
      modelId: modelId,
      modelName: modelName,
      uuid: uuid,
      username: username,
      versionName: versionName,
      infoShow: true,
      metricsShow: false,
      loading: true
    }
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    if (prevProps.modelDetail.data !== this.props.modelDetail.data && this.props.modelDetail.data) {
      this.setState({
        loading: false
      })
    }
  }

  tabSwitch = (selectedKey) => {
    if (selectedKey === 'info') {
      this.setState({
        infoShow: true,
        metricsShow: false
      })
    } else {
      this.setState({
        infoShow: false,
        metricsShow: true
      })
    }
  };

  render() {
    const { modelDetail: { data } }  = this.props;

    const params = data ? data.param_list.map( p => {
      return (
        p.key + ': ' + p.value
      )
    }) : null;

    return (
      <div>
        {this.state.loading === false ?
          <Row className='model-detail-outer'>
            <Col md={12}>
              <div>
                <Breadcrumb className='model-detail-nav'>
                  <Breadcrumb.Item href="models">
                  Models
                  </Breadcrumb.Item>
                  <Breadcrumb.Item href={'model_versions/' + this.state.modelId}>
                    {this.state.modelName}
                  </Breadcrumb.Item>
                  <Breadcrumb.Item active>{this.state.uuid}</Breadcrumb.Item>
                </Breadcrumb>
              </div>
              <div className='model-detail-content'>
                <div className='model-detail-content-header'>
                  <Row>
                    <Col md={10}>
                      <Row>
                        <Col md={12}>
                          {
                            this.state.versionName ?
                              <div
                                className='content-header-title'>{this.state.modelName} {this.state.versionName}</div>
                              :
                              <div className='content-header-title'>{this.state.modelName} {this.state.uuid}</div>
                          }
                        </Col>
                        <Col md={4} className='content-header-info'>
                          <span className='content-header-info-text'>Created by</span>
                          <span>{data.user_name}</span>
                        </Col>
                        <Col md={4} className='content-header-info'>
                          <span className='content-header-info-text'>Last refreshed</span>
                          <span>{(timetrans(data.end_time))}</span>
                        </Col>
                        <Col md={4} className='content-header-info'>
                          <span className='content-header-info-text'>Status</span>
                          <span>{data.status}</span>
                        </Col>
                      </Row>
                    </Col>
                    { data.access_url === null ?
                      data.status === 'FINISHED' ?
                        <Col md={2} className='content-header-btn-outer'>
                          <Link to={{pathname: '/apis/specific_create/' + this.state.modelId + '/' + this.state.username + '/' + this.state.uuid}}><Button variant="success" className='content-header-btn-text'><img src='../../../assets/static/images/toolbar/Add.svg' className='content-header-btn-img' /> Create Endpoint</Button></Link>
                        </Col>
                        :
                        <Col md={2} className='content-header-btn-outer'>
                          <Link to={{pathname: '/apis/specific_create/' + this.state.modelId + '/' + this.state.username + '/' + this.state.uuid}}><Button variant="success" className='content-header-btn-text' disabled><img src='../../../assets/static/images/toolbar/Add.svg' className='content-header-btn-img' /> Create Endpoint</Button></Link>
                        </Col>
                      :
                      null
                    }
                  </Row>
                </div>
                <div className='model-detail-content-body'>
                  <Nav variant="tabs" defaultActiveKey="info" onSelect={selectedKey => this.tabSwitch(selectedKey)}>
                    <Nav.Item>
                      <Nav.Link eventKey="info">Information</Nav.Link>
                    </Nav.Item>
                    <Nav.Item>
                      <Nav.Link eventKey="metrics">Metrics</Nav.Link>
                    </Nav.Item>
                  </Nav>
                  {
                    this.state.infoShow === true ?
                      <div className='model-detail-info-outer'>
                        <Form>
                          <Form.Group controlId="trainingData">
                            <Form.Label>Training Data</Form.Label>
                            <Row>
                              <Col md={7}>
                                <Form.Control type="text" readOnly placeholder="The training data is N/A now" />
                              </Col>
                            </Row>
                          </Form.Group>
                          <Form.Group controlId="parameters">
                            <Form.Label>Parameters</Form.Label>
                            <Row>
                              <Col md={7}>
                                <Form.Control type="text" readOnly placeholder={'{' + params + '}'} />
                              </Col>
                            </Row>
                          </Form.Group>
                          { data.access_url !== null ?
                            <Form.Group controlId="url">
                              <Form.Label>Endpoint URL</Form.Label>
                              <Row>
                                <Col md={7}>
                                  <Form.Control type="text" readOnly placeholder={data.access_url} />
                                </Col>
                              </Row>
                            </Form.Group>
                            : null
                          }
                          {/*<Form.Group controlId="description">*/}
                          {/*<Form.Label>Description</Form.Label>*/}
                          {/*<Row>*/}
                          {/*<Col md={7}>*/}
                          {/*<Form.Control as="textarea" rows="3" placeholder="Please input the description of this model." />*/}
                          {/*</Col>*/}
                          {/*</Row>*/}
                          {/*</Form.Group>*/}
                          {/*<Button variant="outline-success" type="submit">*/}
                          {/*Save Changes*/}
                          {/*</Button>*/}
                        </Form>
                      </div>
                      : null
                  }
                  {
                    this.state.metricsShow === true ?
                      <div className='model-detail-metrics-outer'>
                        <Row>
                          <Col md={7}>
                            <Table striped bordered hover>
                              <thead>
                                <tr>
                                  <th>Name</th>
                                  <th>Value</th>
                                  <th>Time</th>
                                </tr>
                              </thead>
                              <tbody>
                                {data.metric_list.map((metric, index) => {
                                  return (
                                    <tr key={index}>
                                      <td>{metric.key}</td>
                                      <td>{metric.value}</td>
                                      <td>{convertUTCToLocalTime(timetrans(metric.timestamp*1000))}</td>
                                    </tr>
                                  )
                                })}
                              </tbody>
                            </Table>
                          </Col>
                        </Row>
                      </div>
                      : null
                  }
                </div>
              </div>
            </Col>
          </Row>
          :
          <LoadingPage />
        }
        <NotificationContainer/>
      </div>
    )
  }
}

const mapStateToProps = (state) => {
  return {
    modelDetail: state.modelDetail.response,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    getModelDetail : (modelId, uuid) => {
      dispatch(actions.fetchResourceByPath(modelConstant.GET_MODEL_DETAIL, `${modelId}/versions/${uuid}`));
    }
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(ModelDetail);
