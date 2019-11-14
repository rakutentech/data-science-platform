import React, { Component } from 'react';
import { FormGroup, FormControl, Form, Col, Alert } from 'react-bootstrap';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';
import Select from 'react-select';
import TagsInput from '../../../TagsInput'
import { userConstants } from '../../../../constants/app';
import actions from '../../../../actions';
import { validatedSubmit, handleInputByName } from '../../../../helper';
import { iconsImages } from '../../../../constants/icons_images'

class DataLabForm extends Component {
  static propTypes = {
    changeDataLabInstances: PropTypes.object,
    dispatch: PropTypes.func,
    appDataLabSettings: PropTypes.array,
    appInstanceTypeSettings: PropTypes.array,
    appStorageSettings: PropTypes.array,
    history: PropTypes.object
  }

  constructor(props) {
    super(props);
    this.state = {
      validated: '',
      instanceTypeOptions: [],
      storageOptions: [],
      typeName: '',
      typeGroup: '',
      instanceName: '',
      instanceTypeName: '',
      ephemeralStorage: '',
      tags: {}
    }
  }

  handleSubmit = () => {
    const { dispatch } = this.props;
    const data = {
      TypeName: this.state.typeName,
      TypeGroup: this.state.typeGroup,
      Name: this.state.instanceName,
      InstanceTypeName: this.state.instanceTypeName,
      EphemeralStorage: this.state.ephemeralStorage,
      Tags: this.state.tags
    }
    dispatch(actions.executeResourceAction(userConstants.ADD_DATALAB_INSTANCE_REQUEST, data))
  }

  handleMultiSelect = (stateKey) => {
    return (newValue) => {
      this.setState({
        [stateKey]: newValue.map(option => option.value)
      })
    }
  }

  handleTagInput = (tags) => {
    this.setState({
      tags: tags
    })
  }

  initOptions = () => {
    if (this.state.typeName.length === 0 && this.props.appDataLabSettings.length !== 0) {
      this.setState({
        typeName: this.props.appDataLabSettings[0].Name,
        typeGroup: this.props.appDataLabSettings[0].Group,
      });
    }
    const { appInstanceTypeSettings, appStorageSettings } = this.props
    const storageOptions = appStorageSettings.map(storageSetting => {
      return { label: storageSetting.Label, value: storageSetting.Value }
    }).sort((a, b) => a.value - b.value)
    const instanceTypeOptions = appInstanceTypeSettings.map(instanceTypeSetting => {
      return { label: `${instanceTypeSetting.Name} (${instanceTypeSetting.Description})`, value: instanceTypeSetting.Name, group: instanceTypeSetting.Group }
    })
    const storageOption = this.state.ephemeralStorage ?
      storageOptions.filter(storageSetting => storageSetting.Value == this.state.ephemeralStorage)[0]
      : storageOptions[0]

    const instanceTypeOption = this.state.instanceTypeName ?
      instanceTypeOptions.filter(instanceTypeSetting => instanceTypeSetting.Name == this.state.instanceTypeName)[0]
      : instanceTypeOptions[0]
    if (storageOption && instanceTypeOption &&
      (this.state.ephemeralStorage === '' || this.state.instanceTypeName === '')) {
      this.setState({
        ephemeralStorage: storageOption.value,
        instanceTypeName: instanceTypeOption.value,
        storageOptions: storageOptions,
        instanceTypeOptions: instanceTypeOptions
      })
    }
  }

  componentDidMount() {
    this.initOptions()
  }

  componentDidUpdate() {
    this.initOptions()
    const { action, failure, message } = this.props.changeDataLabInstances
    if (action) {
      const { dispatch } = this.props;
      dispatch(actions.clearResourceAction(userConstants.CLEAR_APP_REQUEST))
      if (!failure) {
        this.props.history.push('/datalab')
      } else {
        this.setState({
          failureMessage: message
        })
      }
    }
  }

  render() {
    const { appDataLabSettings } = this.props
    let images = {}
    appDataLabSettings.forEach(e => {
      if (!images[e.Group]) images[e.Group] = []
      images[e.Group].push(e)
    });
    const storageOption = this.state.ephemeralStorage ?
      this.state.storageOptions.filter(option => option.value == this.state.ephemeralStorage)[0]
      : this.state.storageOptions[0]

    const instanceTypeOption = this.state.instanceTypeName ?
      this.state.instanceTypeOptions.filter(option => option.value == this.state.instanceTypeName)[0]
      : this.state.instanceTypeOptions[0]
    const { typeName, typeGroup } = this.state

    let temp_options = {}
    this.state.instanceTypeOptions.forEach(option => {
      if (!temp_options[option.group]) {
        temp_options[option.group] = []
      }
      temp_options[option.group].push(option)
    })
    let size_options = []
    Object.keys(temp_options).map(key => (
      size_options.push({
        label: key,
        options: temp_options[key]
      })
    ))
    return (
      <div className="datalab-body">
        {
          this.state.failureMessage ?
            <Alert dismissible variant="danger" className="alert_message">
              Backend error: {this.state.failureMessage}
            </Alert>
            : ''
        }
        <p className="title-content">Create a new instance</p>
        <p className="datalab-submessage">Choose the options below to create a new instance</p>
        <br />
        <form onSubmit={validatedSubmit(this, this.handleSubmit)} className={`needs-validation ${this.state.validated}`} noValidate>
          <Form.Row>
            <Col>
              <FormGroup /*controlId="typeName"*/>
                <h2 className="mb-2">Choose an image</h2>
                {/* {
                  Object.keys({ 'test': [{ 'b': 1 }], 'check': [1, 2, 3] }).map(name => (
                    ['t', 'e'].map(item =>
                      <div key={item}>{item}</div>
                    )
                  ))
                } */}
                {
                  Object.keys(images).map(key => (
                    <React.Fragment key={key}>
                      <div className='images_group_title'>{key}</div>
                      {images[key].map((dataLab, ind) =>
                        <Form.Check
                          ket={ind}
                          className={`datalab-choose-image datalab-radio col-md-3 ${((typeName === dataLab.Name && typeGroup === dataLab.Group) || typeName === '' && ind === 0) ? 'active' : ''}`}
                          required
                          key={`${dataLab.Group}${dataLab.Name}`}
                          type="radio"
                          hidden
                          value={dataLab.Name}
                          group={dataLab.Group}
                          checked={(typeName === dataLab.Name && typeGroup === dataLab.Group) || typeName === '' && ind === 0}
                          onChange={(e) => {
                            this.setState({
                              typeGroup: e.target.getAttribute('group'),
                              typeName: e.target.value
                            })
                          }}
                          label={
                            <React.Fragment>
                              <img src={dataLab.icon || iconsImages.LAB_ICON_BLUR} className="icon-image" />
                              <img src={dataLab.active_icon || iconsImages.LAB_ICON} className="icon-image-active" />
                              {dataLab.Name}
                            </React.Fragment>
                          }
                          name="typeName"
                          id={`${dataLab.Group}${dataLab.Name}`}
                        />)}
                    </React.Fragment>
                  ))
                }
                <div className="invalid-feedback">
                  Please select a image.
                </div>
              </FormGroup>
            </Col>
          </Form.Row>
          <Form.Row>
            <Col>
              <FormGroup controlId="instanceTypeOption">
                <h2 className="mb-2">Choose a size</h2>
                <Select
                  onChange={(selected) => {
                    this.setState({ instanceTypeName: selected.value });
                  }}
                  classNamePrefix="datalab-select"
                  className="datalab-select"
                  value={instanceTypeOption}
                  options={size_options}
                />
                <div className="invalid-feedback">
                  Please provide a size.
                </div>
              </FormGroup>
            </Col>
            <Col>
              <FormGroup controlId="storageOption">
                <h2 className="mb-2">Choose the storage</h2>
                <Select
                  onChange={(selected) => {
                    this.setState({ ephemeralStorage: selected.value });
                  }}
                  className="datalab-select"
                  value={storageOption}
                  options={this.state.storageOptions}
                />
                <div className="invalid-feedback">
                  Please provide a storage.
                </div>
              </FormGroup>
            </Col>
            <Col></Col>
          </Form.Row>
          <Form.Row>
            <Col>
              <FormGroup controlId="instanceName">
                <h2 className="mb-2">Give the instance a name</h2>
                <FormControl
                  name="instanceName"
                  autoFocus
                  type="text"
                  value={this.state.instanceName}
                  onChange={handleInputByName(this)}
                  className="datalab-input"
                  placeholder="instance name"
                  required
                  pattern="[a-z0-9-]{3,20}"
                />
                <div className="invalid-feedback">
                  Allow a~z,0~9 and -
                  <br />
                  Allow length: 3~20
                </div>
              </FormGroup>
            </Col>
            <Col></Col>
          </Form.Row>
          <Form.Row>
            <Col>
              <h2 className="mb-2">Tags</h2>
              <Form.Row>
                <Col>
                  <div className="datalab-submessage mb-3">
                    Tags allows you to classify and search for instances based on these specific keywords.
                    You can assign multiple tags to a single instance.
                  </div>
                </Col>
                <Col>
                </Col>
              </Form.Row>
              <TagsInput tags={this.state.tags}
                onChange={this.handleTagInput} />
            </Col>
          </Form.Row>
          <div className="form-actions">
            <button className="submit-button">Create</button>
            <button onClick={(e) => {
              e.preventDefault()
              window.history.back()
            }} className="discard-button">Discard</button>
          </div>
        </form>
      </div>
    )
  }
}

export default withRouter(connect((state) => {
  return {
    changeDataLabInstances: state.changeDataLabInstances
  }
})(DataLabForm))
