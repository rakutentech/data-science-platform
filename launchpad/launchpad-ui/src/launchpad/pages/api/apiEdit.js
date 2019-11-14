import React, {Component} from 'react';
import {Badge, Breadcrumb, Button, Col, Form, Modal, Row, Toast} from 'react-bootstrap'
import {connect} from 'react-redux';
import PropTypes from 'prop-types';
import actions from '../../actions'
import {apiConstant, modelConstant} from '../../constants/app';
import '../../../assets/styles/pages/apiEdit.scss'
import {validatedSubmit} from '../../helper/index'
import LoadingPage from '../../../launchpad/components/LoadingPage'
import {convertUTCToLocalTime} from '../../services/utils'
import config from 'config';
import {NotificationContainer} from 'react-notifications';

class APIEdit extends Component {
  static propTypes = {
    modelList: PropTypes.object,
    versionList: PropTypes.object,
    apiDetail: PropTypes.object,
    modelPath: PropTypes.object,
    apiDelete: PropTypes.string,
    apiEdit: PropTypes.string,
    getApiDetail: PropTypes.func,
    getModelList: PropTypes.func,
    getVersionList: PropTypes.func,
    getModelPath: PropTypes.func,
    editAPI: PropTypes.func,
    deleteAPI: PropTypes.func,
    match: PropTypes.object,
    history: PropTypes.object
  };

  constructor(props) {
    super(props);
    const {params} = props.match;
    const apiId = params.apiId;
    this.props.getModelList();
    this.props.getApiDetail(apiId);
    this.state = {
      api_name: '',
      api_version: '',
      api_path: '',
      api_des: '',
      api_status: '',
      username: '',
      run_id: '',
      model_id: '',
      model_path: '',
      id: '',
      res_name: '',
      access_url: '/{gateway}',
      updated_at: '',
      model_version: '',
      validated: '',
      versionShow: false,
      deleteShow: false,
      loading: true,
      toastEditShow: false,
      toastDeleteShow: false
    };
  }

  componentDidMount() {
    this.buildUrl();
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    //update api info state
    if (prevProps.apiDetail !== this.props.apiDetail) {
      const apiDetail = this.props.apiDetail;
      this.setState({
        id: apiDetail.id,
        api_name: apiDetail.api_name,
        api_version: apiDetail.api_version,
        model_id: apiDetail.model_id,
        model_path: apiDetail.model_path,
        api_path: apiDetail.api_path,
        run_id: apiDetail.run_id,
        username: apiDetail.username,
        res_name: apiDetail.res_name,
        access_url: apiDetail.access_url,
        api_des: apiDetail.api_des,
        api_status: apiDetail.api_status,
        api_status_detail: apiDetail.api_status_detail,
        updated_at: apiDetail.updated_at
      })
    }

    //handle model version display
    if (prevState.model_id !== this.state.model_id) {
      if (this.state.model_id === '') {
        this.setState({
          versionShow: false,
          model_version: ''
        })
      } else {
        this.props.getVersionList(this.state.model_id);
        this.setState({
          versionShow: true,
        })
      }
    }

    //update model version state
    if (prevProps.versionList !== this.props.versionList) {
      if (this.state.run_id === '') {
        this.setState({
          loading: false
        })
      } else {
        this.setState({
          model_version: this.state.run_id + '|' + this.state.username
        });
        this.props.getModelPath(this.state.model_id, this.state.run_id);
      }
    }

    if (prevProps.modelPath !== this.props.modelPath && this.props.modelPath.response.data) {
      this.setState({
        model_path: this.props.modelPath.response.data,
        loading: false
      })
    }

    if (prevState.api_version !== this.state.api_version || prevState.username !== this.state.username || prevState.api_path !== this.state.api_path) {
      this.buildUrl();
    }

    if (prevProps.apiDelete !== this.props.apiDelete && this.props.apiDelete === 'success') {
      this.setState({
        toastDeleteShow: true
      });
      setTimeout(() => {
        this.props.history.push('/apis')
      }, 3000)
    }

    if (prevProps.apiEdit !== this.props.apiEdit && this.props.apiEdit === 'success') {
      this.setState({
        toastEditShow: true
      });
      setTimeout(() => {
        this.props.history.push('/apis')
      }, 3000)
    }
  }


  handleChange = (event) => {
    const fieldName = event.target.name;
    const fieldVal = event.target.value;
    this.setState({
      [fieldName] : fieldVal,
    });
  };

  handleModelChange = (event) => {
    this.setState({
      run_id: '',
      username: ''
    });
    const modelId = event.target.value;
    if (modelId === '') {
      this.setState({
        model_id: modelId,
      })
    } else {
      this.setState({
        model_id: modelId,
        loading: true
      })
    }
  };

  handleRunId = (event) => {
    const fieldVal = event.target.value;
    if (fieldVal === '') {
      this.setState({
        model_version: fieldVal,
      });
      return;
    }
    this.setState({
      model_version: fieldVal,
      run_id: fieldVal.split('|')[0],
      username: fieldVal.split('|')[1],
      loading: true
    });
    this.props.getModelPath(this.state.model_id, fieldVal.split('|')[0])
  };

  buildUrl = () => {
    let username = '/{username}';
    let api_path = '/{path}';
    let api_version = '/{api_version}';
    if (this.state.username !== '') {
      username = `/${this.state.username}`
    }
    if (this.state.api_path !== '') {
      api_path = `${this.state.api_path}`
    }
    if (this.state.api_version !== '') {
      api_version = `/${this.state.api_version}`
    }
    this.setState({
      access_url: 'Generated URL: ' + ` ${config.gateway}`+ '/predict-api' + username + api_path + api_version
    })
  };

  handleSubmit = () => {
    const data = {
      id: this.state.id,
      api_name: this.state.api_name,
      api_version: this.state.api_version,
      model_path: this.state.model_path,
      api_path: this.state.api_path,
      run_id: this.state.run_id,
      username: this.state.username,
      api_des: this.state.api_des,
      model_id: this.state.model_id
    };
    this.setState({
      loading: true
    });
    this.props.editAPI(data);
  };

  deleteShow = () => {
    this.setState({deleteShow: true});
  };

  deleteClose = () => {
    this.setState({ deleteShow: false });
  };

  handleDelete = () => {
    this.setState({
      deleteShow: false,
      loading: true
    });
    this.props.deleteAPI(this.state.id);
  };

  render() {
    const { modelList, versionList }    = this.props;
    const { validated, toastEditShow, toastDeleteShow } = this.state;

    return (
      <div>
        {this.state.loading === false ?
          <Row className='api-edit-outer'>
            <Col md={12}>
              <div>
                <Breadcrumb className='api-edit-nav'>
                  <Breadcrumb.Item href="apis">
                    APIs
                  </Breadcrumb.Item>
                  <Breadcrumb.Item active>Edit API</Breadcrumb.Item>
                </Breadcrumb>
              </div>
              <div>
                <Row>
                  <Col md={12}>
                    <span className='api-edit-title'>{this.state.api_name}</span>
                    {this.state.api_status === 'Ready' ?
                      <Badge className='api-edit-status' variant="info">{this.state.api_status}</Badge>
                      :
                      <Badge className='api-edit-status' variant="warning">{this.state.api_status}</Badge>
                    }
                    {
                      this.state.api_status_detail !== null ?
                        <span>
                          <span className='error-message-title'>Error message: </span>
                          <span className='error-message-detail'>there are some error messages</span>
                        </span>
                        :
                        null
                    }

                  </Col>
                  <Col md={3} className='header-info'>
                    <span className='header-info-text'>Created by</span>
                    <span>{this.state.username}</span>
                  </Col>
                  <Col md={4} className='header-info'>
                    <span className='header-info-text'>Last refreshed</span>
                    <span>{convertUTCToLocalTime(this.state.updated_at)}</span>
                  </Col>
                </Row>
              </div>
              <div className='header-action'>
                <Row>
                  <Col md={6}>
                    <span className='header-action-text'>Key</span>
                    <span>{this.state.res_name}</span>
                  </Col>
                  <Col md={{span: 2, offset: 4}}>
                    <button type="button" className="btn version-list-info-btn" onClick={this.deleteShow}>
                      <img src="../../../assets/static/images/toolbar/Delete.svg" className="info-btn-img"/>Delete
                    </button>
                  </Col>
                </Row>
              </div>
              <div className='api-create-form'>
                <Form onSubmit={validatedSubmit(this, this.handleSubmit)} className={`${validated}`} noValidate>
                  <Form.Row>
                    <Form.Group as={Col} controlId="api_name">
                      <Form.Label>API Name</Form.Label>
                      <Form.Control
                        name='api_name'
                        value={this.state.api_name}
                        disabled
                        type="text"
                        required
                        placeholder="API Name" />
                      <div className="invalid-feedback">
                        Please provide a API name.
                      </div>
                    </Form.Group>
                    <Form.Group as={Col} controlId="api_version">
                      <Form.Label>Version</Form.Label>
                      <Form.Control
                        name='api_version'
                        value={this.state.api_version}
                        disabled
                        type="text"
                        required
                        placeholder="API Version" />
                      <div className="invalid-feedback">
                        Please provide a API version.
                      </div>
                    </Form.Group>
                  </Form.Row>

                  <Form.Row>
                    <Form.Group as={Col} md="6" controlId="model_id">
                      <Form.Label>Model</Form.Label>
                      <Form.Control
                        name='model_id'
                        as="select"
                        value={this.state.model_id}
                        onChange={this.handleModelChange}
                        required >
                        <option key="emptyModel" value="">Select model...</option>
                        {modelList.data.list.map((model, index) => {
                          return (
                            <option key={index} value={model.experiment_id}>{model.name}</option>
                          )
                        }) }
                        <div className="invalid-feedback">
                          Please select a model.
                        </div>
                      </Form.Control>
                    </Form.Group>
                    {this.state.versionShow ?
                      <Form.Group as={Col} md="6" controlId="model_version">
                        <Form.Control
                          name='model_version'
                          as="select"
                          value={this.state.model_version}
                          onChange={this.handleRunId}
                          required
                          className="form-model-version">
                          <option key="emptyVersion" value="">Select version...</option>
                          {versionList.data.map((model, index) => {
                            return (
                              <option
                                key={index}
                                value={model.uuid + '|' + model.user_name}>
                                {model.run_version}
                              </option>
                            )
                          })}
                          <div className="invalid-feedback">
                            Please select a model's version.
                          </div>
                        </Form.Control>
                      </Form.Group>
                      : null}
                  </Form.Row>

                  <Form.Row>
                    <Form.Group as={Col} md="6" controlId="api_path">
                      <Form.Label>Path</Form.Label>
                      <Form.Control
                        name='api_path'
                        value={this.state.api_path}
                        onChange={this.handleChange}
                        type="text"
                        required
                        placeholder="/path" />
                      <div className="invalid-feedback">
                        Please provide a API path.
                      </div>
                    </Form.Group>
                  </Form.Row>

                  <Form.Group controlId="api_des">
                    <Form.Label>Description</Form.Label>
                    <Form.Control
                      name='api_des'
                      value={this.state.api_des}
                      onChange={this.handleChange}
                      as='textarea'
                      placeholder="API Description" />
                  </Form.Group>

                  <Form.Group controlId="access_url" className='api-url'>
                    <Form.Control
                      name='access_url'
                      value={this.state.access_url}
                      onChange={this.handleChange}
                      required
                      plaintext
                      readOnly/>
                  </Form.Group>

                  <Button variant="outline-success" type="submit">
                    Save Changes
                  </Button>
                </Form>
              </div>
            </Col>
          </Row> :
          <LoadingPage/>
        }
        <Modal show={this.state.deleteShow} onHide={this.deleteClose} centered size="lg" >
          <Modal.Header closeButton>
            <Modal.Title>API Delete</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <div className="text-center">
              <div>Are you sure you want to delete this API?</div>
              <div className="delete-style">(This operation needs several seconds due to deleting API container)</div>
            </div>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={this.deleteClose}>
              Cancel
            </Button>
            <Button variant="primary" onClick={this.handleDelete}>
              Delete
            </Button>
          </Modal.Footer>
        </Modal>
        <div className='toast-style'>
          <Toast show={toastEditShow} delay={2500} autohide style={{marginLeft: 'auto', marginRight: 'auto'}}>
            <Toast.Header>
              <strong className="mr-auto">API is being Updated!</strong>
            </Toast.Header>
            <Toast.Body>
              (The API will be available after several minutes due to creating API container)
            </Toast.Body>
          </Toast>
          <Toast show={toastDeleteShow} delay={2500} autohide style={{marginLeft: 'auto', marginRight: 'auto'}}>
            <Toast.Body>
              API Deleted Successfully!
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
    modelList: state.modelList.response,
    versionList: state.modelVersionList.response,
    apiDetail: state.apiDetail.response.data,
    modelPath: state.modelPath,
    apiDelete: state.apiDelete.action,
    apiEdit: state.apiEdit.action
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    getApiDetail : (apiId) => {
      dispatch(actions.fetchResourceByPath(apiConstant.GET_API_DETAIL, `${apiId}`))
    },
    getModelList : () => {
      dispatch(actions.fetchResource(modelConstant.GET_MODEL_LIST))
    },
    getVersionList : (modelId) => {
      dispatch(actions.fetchResourceByPath(modelConstant.GET_MODEL_VERSION_LIST, `${modelId}/versions`))
    },
    getModelPath : (modelId, uuid) => {
      dispatch(actions.fetchResourceByPath(modelConstant.GET_MODEL_PATH, `${modelId}/versions/${uuid}/modelpath`))
    },
    editAPI : (data) => {
      dispatch(actions.executeResourceAction(apiConstant.EDIT_API, data))
    },
    deleteAPI: (id) => {
      dispatch(actions.executeResourceActionByPath(apiConstant.DELETE_API, `/${id}`))
    }
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(APIEdit);
