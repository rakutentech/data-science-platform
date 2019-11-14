import React, { Component } from 'react';
import PropTypes from 'prop-types';
import actions from '../../../../actions';
import { userConstants } from '../../../../constants/app';
import { formConstants } from '../../../../constants/form';
import { connect } from 'react-redux';
import LoadingPage from '../../../LoadingPage';
import CodeEditor from '../../../CodeEditor'
import { Form, Col } from 'react-bootstrap';
import config from 'config';


class FaaSUtilitiesPanel extends Component {
  static propTypes = {
    dispatch: PropTypes.func,
    functionInstance: PropTypes.object,
    appInstanceTypeSettings: PropTypes.array,
    instanceName: PropTypes.string,
    trigger: PropTypes.string,
  }
  constructor(props) {
    super(props);
    const { dispatch, instanceName } = this.props
    dispatch(actions.fetchResourceByPath(
      userConstants.GET_FUNCTION_INSTANCE_REQUEST, `/function/instances/${formConstants.EVENT_TRIGGER}/${instanceName}`))
  }
  render() {
    const { functionInstance } = this.props
    const localProfile = localStorage.getItem(userConstants.APP_USER) ?
      JSON.parse(localStorage.getItem(userConstants.APP_USER)) : {}
    const urlApi = config.apiUrl.includes('http') ? config.apiUrl : location.origin + config.apiUrl
    return <div>
      <div>
        {functionInstance.Name ?
          <div>
            <h1>Utilities</h1>
            <h2>Invoke job as below</h2>
            <Form.Row className="mb-3">
              <Col>
                <CodeEditor
                  mode="sh"
                  wrapEnabled={true}
                  rows={8}
                  width="40vw"
                  value={`curl -X POST -H Content-Type:application/json -H 'Authorization: Bearer ${localProfile.UserToken}' -d '{}' ${urlApi}/apis/${functionInstance.Owner}/${functionInstance.Name} --insecure`}
                  name="command"
                />
              </Col>
              <Col></Col>
            </Form.Row>
            <h1>Data Format</h1>
            <Form.Row>
              <Col>
                <h2>Inline</h2>
                <CodeEditor
                  mode="sh"
                  wrapEnabled={true}
                  rows={12}
                  width="20vw"
                  value={`{  
   "instanceTypeName": "xxxxxx",
   "args":[  
      "arg1",
      "arg2"
   ],
   "env":{  
      "http_proxy":"xxx"
   }
}`}
                  name="format1"
                />
              </Col>
              <Col>
                <h2>Zip/Git</h2>
                <CodeEditor
                  mode="sh"
                  wrapEnabled={true}
                  rows={12}
                  width="20vw"
                  value={`{
  "beforeExecution":"xxxxxxx",
  "command":"xxxxxxx",
  "instanceTypeName": "xxxxxx",
  "args":[  
     "arg1",
     "arg2"
  ],
  "env":{  
     "http_proxy":"xxx"
  }
}`}
                  name="format2"
                />
              </Col>
              <Col></Col>
              <Col></Col>
            </Form.Row>
          </div>
          :
          <LoadingPage />
        }
      </div>
    </div>
  }
}

export default connect((state) => {
  return {
    functionInstance: state.functionInstance.functionInstance
  }
})(FaaSUtilitiesPanel)