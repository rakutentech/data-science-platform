import React, {Component} from 'react';
import {Breadcrumb, Button, Col, Modal, Row, Table, Toast} from 'react-bootstrap'
import {connect} from 'react-redux';
import PropTypes from 'prop-types';
import actions from '../../actions'
import {modelConstant} from '../../constants/app';
import '../../../assets/styles/pages/modelVersionList.scss'
import {timetrans} from '../../services/utils'
import {Link} from 'react-router-dom';
import LoadingPage from '../../../launchpad/components/LoadingPage'
import {NotificationContainer} from 'react-notifications';

class VersionList extends Component {
  static propTypes = {
    modelInfo: PropTypes.object,
    modelVersionList: PropTypes.object,
    modelDelete: PropTypes.string,
    getModelDetail: PropTypes.func,
    deleteModel: PropTypes.func,
    match: PropTypes.object
  };

  constructor(props) {
    super(props);
    const {params} = props.match;
    const modelId = params.modelId;
    this.props.getModelDetail(modelId);
    this.state = {
      modelId: modelId,
      deleteShow: false,
      path: '',
      toastShow: false,
      access_url: ''
    }
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    const modelDelete = this.props.modelDelete;
    if (prevProps.modelDelete !== modelDelete && modelDelete === 'success') {
      this.setState({
        toastShow: true
      });
      setTimeout(() => {location.href = '/models'}, 2500);
    }
  }

  handleDeleteShow = () => {
    this.setState({deleteShow: true});
  };

  handleDeleteClose = () => {
    this.setState({ deleteShow: false });
  };

  handleDelete = () => {
    this.setState({ deleteShow: false });
    this.props.deleteModel(this.state.modelId);
  };

  render() {
    const { modelInfo, modelVersionList }  = this.props;
    const { toastShow } = this.state;

    return (
      <div>
        { modelInfo.data && modelVersionList.data ?
          <Row className='version-list-outer'>
            <Col md={12}>
              <div>
                <Breadcrumb className='version-list-nav'>
                  <Breadcrumb.Item href="models">
                    Models
                  </Breadcrumb.Item>
                  <Breadcrumb.Item active>{modelInfo.data.name}</Breadcrumb.Item>
                </Breadcrumb>
              </div>
              <div className='version-list-title'>
                {modelInfo.data.name}
              </div>
              <div className='version-list-desc'>
                Location: {modelInfo.data.artifact_location}
              </div>
              <div className='version-list-info'>
                <Row>
                  <Col md={3}>
                    <span className='version-list-info-text'>ID</span>
                    <span>{modelInfo.data.experiment_id}</span>
                  </Col>
                  <Col md={3}>
                    <span className='version-list-info-text'>Created by</span>
                    <span>N/A</span>
                  </Col>
                  <Col md={3}>
                    <span className='version-list-info-text'>Created at</span>
                    {/*<span>{convertUTCToLocalTime(modelInfo.data.create_time)}</span>*/}
                    <span>N/A</span>
                  </Col>
                  <Col md={{span: 2, offset: 1}}>
                    <button type="button" className="btn version-list-info-btn" onClick={this.handleDeleteShow}>
                      <img src="../../../assets/static/images/toolbar/Delete.svg" className="info-btn-img"/>Delete
                    </button>
                  </Col>
                </Row>
              </div>
              <div className='version-list-detail'>
                <Table bordered hover className='version-list-detail-table'>
                  <thead>
                    <tr className='detail-header'>
                      <th className='detail-header-date'>Date</th>
                      <th className='detail-header-source'>Source</th>
                      <th>
                        <div className='detail-header-metrics'>Metrics</div>
                        <div>
                          <Row>
                            <Col md={4}><div className='detail-header-metrics-column'>mae</div></Col>
                            <Col md={4}><div className='detail-header-metrics-column'>r2</div></Col>
                            <Col md={4}><div className='detail-header-metrics-column'>mse</div></Col>
                          </Row>
                        </div>
                      </th>
                      <th className='detail-header-action'>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {modelVersionList.data.map((model, index) => {
                      return (
                        <tr key={index}>
                          <td><Link
                            to={{pathname: '/model_detail/' + modelInfo.data.experiment_id + '/' + modelInfo.data.name + '/' + model.user_name + '/' + model.uuid + '/' + model.name}}> {(timetrans(model.start_time))} </Link>
                          </td>
                          <td>{model.source_name}</td>
                          <td>
                            <Row>
                              {model.metric_list !== null && model.metric_list.length !== 0 ?
                                model.metric_list.map((metric, index) => {
                                  return (
                                    <Col key={index} md={4}><div className='detail-body-metric'>{ metric.value.toFixed(2) }</div></Col>
                                  )
                                }) : <Col md={12}><div className='text-center'>N/A</div></Col>
                              }
                            </Row>
                          </td>
                          { model.access_url === null ?
                            model.status === 'FINISHED' ?
                              <td className='detail-body-action'><Link to={{pathname: '/apis/specific_create/' + this.state.modelId + '/' + model.user_name + '/' + model.uuid}}><Button variant="outline-primary" size='sm' >Create Endpoint</Button></Link></td>
                              :
                              <td className='detail-body-action'><Link to={{pathname: '/apis/specific_create/' + this.state.modelId + '/' + model.user_name + '/' + model.uuid}}><Button variant="outline-primary" size='sm' disabled>Create Endpoint</Button></Link></td>
                            :
                            <td className='detail-body-action'><Link to={{pathname: '/apis/edit/' + model.pred_api_id}}><Button variant="outline-success" size='sm' style={{width: '121px'}}>View Endpoint</Button></Link></td>
                          }

                        </tr>
                      )
                    })}
                  </tbody>
                </Table>
              </div>
              {/*<div className='version-list-api'>*/}
              {/*<div className='version-list-api-title'>*/}
              {/*API using this model*/}
              {/*</div>*/}
              {/*<div className='version-list-api-body'>*/}
              {/*<Row>*/}
              {/*<Col md={3}>*/}
              {/*<Card border="info">*/}
              {/*<Card.Header className='api-header'>api one</Card.Header>*/}
              {/*<Card.Body className='api-body'>*/}
              {/*<Card.Text className='api-desc'>*/}
              {/*the description of this api*/}
              {/*</Card.Text>*/}
              {/*<Card.Text className='api-info'>*/}
              {/*<span className='api-version'>v0.0.2</span>*/}
              {/*<span className='api-refresh'>last refreshed: 2019-05-14</span>*/}
              {/*</Card.Text>*/}
              {/*</Card.Body>*/}
              {/*</Card>*/}
              {/*</Col>*/}
              {/*</Row>*/}
              {/*</div>*/}
              {/*</div>*/}
              {/*<div className='version-list-post'>*/}
              {/*<div className='version-list-post-title'>*/}
              {/*Related Post*/}
              {/*</div>*/}
              {/*<div className='version-list-post-body'>*/}
              {/*<Row>*/}
              {/*<Col md={3}>*/}
              {/*<Card border="dark">*/}
              {/*<Card.Header className='post-header'>FastPhotoStyle Tutorial</Card.Header>*/}
              {/*<Card.Body className='post-body'>*/}
              {/*<Card.Text className='post-desc'>*/}
              {/*the description of this post*/}
              {/*</Card.Text>*/}
              {/*<Card.Text className='post-info'>*/}
              {/*<span className='post-refresh'>last refreshed: 2019-05-14</span>*/}
              {/*</Card.Text>*/}
              {/*</Card.Body>*/}
              {/*</Card>*/}
              {/*</Col>*/}
              {/*</Row>*/}
              {/*</div>*/}
              {/*</div>*/}
            </Col>
          </Row> :
          <LoadingPage/>
        }
        <Modal show={this.state.deleteShow} onHide={this.handleDeleteClose} centered >
          <Modal.Header closeButton>
            <Modal.Title>Model Delete</Modal.Title>
          </Modal.Header>
          <Modal.Body>Are you sure you want to delete this model?</Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={this.handleDeleteClose}>
              Cancel
            </Button>
            <Button variant="primary" onClick={this.handleDelete}>
              Delete
            </Button>
          </Modal.Footer>
        </Modal>
        <div className='toast-style'>
          <Toast show={toastShow} delay={2000} autohide style={{marginLeft: 'auto', marginRight: 'auto'}}>
            <Toast.Body>
              Model Deleted Successfully!
            </Toast.Body>
          </Toast>
        </div>
        <NotificationContainer/>
      </div>
    )
  }
}

const mapStateToProps = (state) => {
  return {
    modelInfo: state.modelInfo.response,
    modelVersionList: state.modelVersionList.response,
    modelDelete: state.modelDelete.action
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    getModelDetail : (modelId) => {
      dispatch(actions.fetchResourceByPath(modelConstant.GET_MODEL_INFO, `${modelId}`));
      dispatch(actions.fetchResourceByPath(modelConstant.GET_MODEL_VERSION_LIST, `${modelId}/versions`));
    },
    deleteModel : (modelId) => {
      dispatch(actions.executeResourceActionByPath(modelConstant.DELETE_MODEL_INFO, `${modelId}/hard`));
    }
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(VersionList);
