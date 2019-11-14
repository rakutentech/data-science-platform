import React from 'react';
import PropTypes from 'prop-types';
import FaaSListPanel from './FaaSListPanel'
import FaaSDetailPanel from './FaaSDetailPanel'
import FaaSUtilitiesPanel from './FaaSUtilitiesPanel'
import FaaSForm from './FaaSForm'
import { withRouter } from 'react-router';

const FaaSPanel = (props) => {
  const { appFunctionSettings, appInstanceTypeSettings } = props
  const { params, url } = props.match
  const { trigger, instancename } = params
  let targetContext = <FaaSListPanel 
    appInstanceTypeSettings={appInstanceTypeSettings} />
  if(instancename){
    if(url.endsWith('/utilities')){
      targetContext = <FaaSUtilitiesPanel
        instanceName={instancename}/>
    }else{
      targetContext = <FaaSDetailPanel
        appFunctionSettings={appFunctionSettings}
        trigger={trigger}
        appInstanceTypeSettings={appInstanceTypeSettings}
        instanceName={instancename} />
    }
  }else if(url.endsWith('/new')){
    targetContext = <FaaSForm
      appFunctionSettings={appFunctionSettings}
      appInstanceTypeSettings={appInstanceTypeSettings} />
  }
  return (
    <div className="main-context">
      {targetContext}
    </div>
  )
}

FaaSPanel.propTypes = {
  dispatch: PropTypes.func,
  appFunctionSettings: PropTypes.array,
  appInstanceTypeSettings: PropTypes.array,
  match: PropTypes.object,
}

export default withRouter(FaaSPanel)