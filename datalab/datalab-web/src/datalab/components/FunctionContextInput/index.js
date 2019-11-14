import React, { Component } from 'react';
import { FormGroup, FormControl, Form, Col, Tabs, Tab } from 'react-bootstrap';
import CodeEditor from '../CodeEditor';
import { formConstants } from '../../constants/form';
import DropzoneComponent from 'react-dropzone-component';
import PropTypes from 'prop-types';

class FunctionContextInput extends Component {
  static propTypes = {
    functionContext: PropTypes.object,
    mode: PropTypes.string,
    programLanguage: PropTypes.string,
    onChange: PropTypes.func
  }

  constructor(props) {
    super(props);
    this.state = {
      functionContext: {
        Code: '',
        Requirement: '',
        GitRepo: '',
        GitBranch: '',
        GitEntrypoint: '',
        ZipFileData: '',
        ZipFileName: '',
        ZipEntrypoint: '',
      },
      tabKey: this.props.mode ? this.props.mode : formConstants.INLINE_FUNCTION,
      programLanguage: this.props.programLanguage ? this.props.programLanguage : 'text',
    }
  }
  componentDidUpdate(prevProps) {
    if (this.props.mode != prevProps.mode ||
      this.props.programLanguage != prevProps.programLanguage ||
      shouldUpdate(this.state.functionContext, this.props.functionContext)) {
      this.setState({
        functionContext: { ...this.state.functionContext, ...this.props.functionContext },
        tabKey: this.props.mode ? this.props.mode : formConstants.INLINE_FUNCTION,
        programLanguage: this.props.programLanguage
      })
    }
  }
  handleCodeEditor = (target, name) => {
    return (context) => {
      let functionContext = this.state.functionContext
      functionContext[name] = context
      this.setState({
        functionContext: functionContext
      })
      this.props.onChange(this.state.tabKey, functionContext)
    }
  }
  handleChange = (e) => {
    let functionContext = this.state.functionContext
    functionContext[e.target.name] = e.target.value
    this.setState({
      functionContext: functionContext
    })
    this.props.onChange(this.state.tabKey, functionContext)
  }

  getBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        let encoded = reader.result.replace(/^data:(.*;base64,)?/, '');
        if ((encoded.length % 4) > 0) {
          encoded += '='.repeat(4 - (encoded.length % 4));
        }
        resolve(encoded);
      };
      reader.onerror = error => reject(error);
    });
  }

  handleFileChange = (files) => {
    const targetFile = files[0]
    let functionContext = this.state.functionContext
    functionContext.ZipFileName = targetFile.name
    this.getBase64(targetFile).then(encodedFile => {
      functionContext.ZipFileData = encodedFile
      this.setState({
        functionContext: functionContext
      })
      this.props.onChange(this.state.tabKey, functionContext)
    })
  }

  render() {
    const disabled = this.props.mode && this.props.mode.length > 0
    return <div>
      <Tabs
        id="controlled-tab-example"
        activeKey={this.state.tabKey}
        onSelect={tabKey => this.setState({ tabKey })}
      >
        <Tab eventKey={formConstants.INLINE_FUNCTION} title="Inline Codes"
          disabled={disabled && this.state.tabKey != formConstants.INLINE_FUNCTION}>
          <Form.Row>
            <Col>
              <h2 className="pb-2">Function</h2>
              <CodeEditor
                mode={this.state.programLanguage ? this.state.programLanguage : 'text'}
                wrapEnabled={true}
                rows={8}
                width="31.8vw"
                value={this.state.functionContext.Code}
                onChange={this.handleCodeEditor(this, 'Code')}
                name="Code"
              />
            </Col>
            <Col>
              <h2 className="pb-2">Requirement</h2>
              <CodeEditor
                mode="text"
                wrapEnabled={true}
                rows={8}
                width="31.8vw"
                value={this.state.functionContext.Requirement}
                onChange={this.handleCodeEditor(this, 'Requirement')}
                name="Requirement"
              />
            </Col>
          </Form.Row>
        </Tab>
        <Tab eventKey={formConstants.ZIP_FUNCTION}
          title="Compressed File (.zip)" disabled={disabled && this.state.tabKey != formConstants.ZIP_FUNCTION}>
          <DropzoneComponent
            config={{
              postUrl: 'no-url',
              allowedFiletypes: ['.zip'],
              iconFiletypes: ['.zip'],
              showFiletypeIcon: true,
            }}
            eventHandlers={{ addedfiles: this.handleFileChange }}
            djsConfig={{
              autoProcessQueue: false,
              addRemoveLinks: true
            }} >
            <div className="filepicker dropzone">
              {this.state.functionContext.ZipFileName ? this.state.functionContext.ZipFileName : ''}
            </div>
          </DropzoneComponent>
          <div>
            <h2 className="pb-2 pt-2">Entrypoint</h2>
            <FormControl
              className="datalab-input col-6"
              name="ZipEntrypoint"
              autoFocus
              type="text"
              value={this.state.functionContext.ZipEntrypoint}
              onChange={this.handleChange}
              placeholder="(Option)"
            />
          </div>
        </Tab>
        <Tab eventKey={formConstants.GIT_FUNCTION}
          title="Git Repository" disabled={disabled && this.state.tabKey != formConstants.GIT_FUNCTION}>
          <FormGroup controlId="gitRepo">
            <h2 className="pb-2">Git Repository URL</h2>
            <FormControl
              className="datalab-input col-6"
              name="GitRepo"
              autoFocus
              type="text"
              value={this.state.functionContext.GitRepo}
              onChange={this.handleChange}
              placeholder="Git Repository URL"
            />
          </FormGroup>
          <FormGroup controlId="gitBranch">
            <h2 className="pb-2">Branch</h2>
            <FormControl
              className="datalab-input col-6"
              name="GitBranch"
              autoFocus
              type="text"
              value={this.state.functionContext.GitBranch}
              onChange={this.handleChange}
              placeholder="Branch name"
            />
          </FormGroup>
          <div>
            <h2 className="pb-2">Entrypoint</h2>
            <FormControl
              className="datalab-input col-6"
              name="GitEntrypoint"
              autoFocus
              type="text"
              value={this.state.functionContext.GitEntrypoint}
              onChange={this.handleChange}
              placeholder="(Option)"
            />
          </div>
        </Tab>
      </Tabs>
    </div>
  }
}

const shouldUpdate = (context1, context2) => {
  if (context1 && context2) {
    return (context1.Code != undefined && context2.Code != undefined && context1.Code != context2.Code) ||
      (context1.Requirement != undefined && context2.Requirement != undefined && context1.Requirement != context2.Requirement) ||
      (context1.GitRepo != undefined && context2.GitRepo != undefined && context1.GitRepo != context2.GitRepo) ||
      (context1.GitBranch != undefined && context2.GitBranch != undefined && context1.GitBranch != context2.GitBranch) ||
      (context1.GitEntrypoint != undefined && context2.GitEntrypoint != undefined && context1.GitEntrypoint != context2.GitEntrypoint) ||
      (context1.ZipFileName != undefined && context2.ZipFileName != undefined && context1.ZipFileName != context2.ZipFileName) ||
      (context1.ZipEntrypoint != undefined && context2.ZipEntrypoint != undefined && context1.ZipEntrypoint != context2.ZipEntrypoint)
  } else {
    return false
  }
}

FunctionContextInput.shouldUpdate = shouldUpdate

export default FunctionContextInput