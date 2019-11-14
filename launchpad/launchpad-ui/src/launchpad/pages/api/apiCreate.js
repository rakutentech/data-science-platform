import React, {Component} from 'react';
import {Breadcrumb, Button, Col, Form, Row, Toast} from 'react-bootstrap'
import {connect} from 'react-redux';
import PropTypes from 'prop-types';
import actions from '../../actions'
import {apiConstant, modelConstant} from '../../constants/app';
import '../../../assets/styles/pages/apiCreate.scss'
import {validatedSubmit} from '../../helper/index'
import LoadingPage from '../../../launchpad/components/LoadingPage'
import config from 'config';
import {NotificationContainer} from 'react-notifications';

class APICreate extends Component {
  static propTypes = {
    modelList: PropTypes.object,
    versionList: PropTypes.object,
    apiCreate: PropTypes.string,
    modelPath: PropTypes.object,
    getModelList: PropTypes.func,
    getVersionList: PropTypes.func,
    getModelPath: PropTypes.func,
    createAPI: PropTypes.func,
    match: PropTypes.object,
    history: PropTypes.object
  };

  constructor(props) {
    super(props);
    this.state = {
      api_name: '',
      api_version: '',
      model_id: '',
      model_path: '',
      model_version: '',
      run_id: '',
      api_path: '',
      api_url: '/{gateway}',
      api_des: '',
      username: '',
      validated: false,
      versionShow: false,
      loading: true,
      toastShow: false
    };
    this.props.getModelList()
  }

  componentDidMount() {
    this.buildUrl();
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    if (prevState.api_version !== this.state.api_version || prevState.username !== this.state.username || prevState.api_path !== this.state.api_path) {
      this.buildUrl();
    }

    if (this.props.modelList.data !== prevProps.modelList.data && this.props.modelList.data) {
      this.setState({
        loading: false
      })
    }

    if (this.props.versionList.data !== prevProps.versionList.data && this.props.versionList.data) {
      this.setState({
        loading: false
      })
    }

    if (this.props.modelPath.data !== prevProps.modelPath.data && this.props.modelPath.data) {
      this.setState({
        model_path: this.props.modelPath.data,
        loading: false
      })
    }

    if (prevProps.apiCreate !== this.props.apiCreate && this.props.apiCreate === 'success') {
      this.setState({
        toastShow: true
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
    const modelId = event.target.value;
    if (modelId === '') {
      this.setState({
        model_id: modelId,
        versionShow: false,
        model_version: '',
        loading: false
      })
    } else {
      this.props.getVersionList(modelId);
      this.setState({
        model_id: modelId,
        versionShow: true,
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
      api_url: 'Generated URL: ' + ` ${config.gateway}`+ '/predict-api' + username + api_path + api_version
    })
  };

  handleSubmit = (event) => {
    const form = event.currentTarget;
    if (form.checkValidity() === false) {
      event.preventDefault();
      event.stopPropagation();
      return
    }
    const data = {
      api_name: this.state.api_name,
      api_version: this.state.api_version,
      model_id: this.state.model_id,
      model_path: this.state.model_path,
      api_path: this.state.api_path,
      run_id: this.state.run_id,
      username: this.state.username,
      api_des: this.state.api_des
    };
    this.setState({
      loading: true,
      validated: true
    });
    this.props.createAPI(data);
  };

  render() {
    const { modelList, versionList } = this.props;
    const {toastShow} = this.state;


    return (
      <div>
        {this.state.loading === false ?
          <Row className='api-create-outer'>
            <Col md={12}>
              <div>
                <Breadcrumb className='api-create-nav'>
                  <Breadcrumb.Item href="apis">
                    APIs
                  </Breadcrumb.Item>
                  <Breadcrumb.Item active>Create API</Breadcrumb.Item>
                </Breadcrumb>
              </div>
              <div className='api-create-title'>
                Create New API
              </div>
              <div className='api-create-form'>
                <Form onSubmit={validatedSubmit(this, this.handleSubmit)} className={`needs-validation ${this.state.validated}`} noValidate>
                  <Form.Row>
                    <Form.Group as={Col} controlId="api_name">
                      <Form.Label>API Name</Form.Label>
                      <Form.Control
                        name='api_name'
                        value={this.state.api_name}
                        onChange={this.handleChange}
                        type="text"
                        required
                        placeholder="API Name"/>
                      <div className="invalid-feedback">
                        Please provide a API name.
                      </div>
                    </Form.Group>
                    <Form.Group as={Col} controlId="api_version">
                      <Form.Label>Version</Form.Label>
                      <Form.Control
                        name='api_version'
                        value={this.state.api_version}
                        onChange={this.handleChange}
                        type="text"
                        required
                        placeholder="API Version"/>
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
                        required>
                        <option key="emptyModel" value="">Select model...</option>
                        {modelList.data.list.map((model, index) => {
                          return (
                            <option key={index} value={model.experiment_id}>{model.name}</option>
                          )
                        })}
                      </Form.Control>
                      <div className="invalid-feedback">
                        Please select a model.
                      </div>
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
                        </Form.Control>
                        <div className="invalid-feedback">
                          Please select a model's version.
                        </div>
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
                        placeholder="/path"/>
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
                      placeholder="API Description"/>
                  </Form.Group>

                  <Form.Group controlId="api_url" className='api-url'>
                    <Form.Control
                      name='api_url'
                      value={this.state.api_url}
                      onChange={this.handleChange}
                      required
                      plaintext
                      readOnly/>
                  </Form.Group>

                  <Button variant="success" type="submit">
                    Create
                  </Button>
                </Form>
              </div>
            </Col>
          </Row> :
          <LoadingPage/>
        }
        <div className='toast-style'>
          <Toast show={toastShow} delay={2500} autohide style={{marginLeft: 'auto', marginRight: 'auto'}}>
            <Toast.Header>
              <strong className="mr-auto">API is being Created!</strong>
            </Toast.Header>
            <Toast.Body>
              (The API will be available after several minutes due to creating API container)
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
    apiCreate: state.apiCreate.action,
    modelPath: state.modelPath.response,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    getModelList : () => {
      dispatch(actions.fetchResource(modelConstant.GET_MODEL_LIST))
    },
    getVersionList : (modelId) => {
      dispatch(actions.fetchResourceByPath(modelConstant.GET_MODEL_VERSION_LIST, `${modelId}/versions`))
    },
    getModelPath : (modelId, uuid) => {
      dispatch(actions.fetchResourceByPath(modelConstant.GET_MODEL_PATH, `${modelId}/versions/${uuid}/modelpath`))
    },
    createAPI : (data) => {
      dispatch(actions.executeResourceAction(apiConstant.ADD_API, data))
    }
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(APICreate);
