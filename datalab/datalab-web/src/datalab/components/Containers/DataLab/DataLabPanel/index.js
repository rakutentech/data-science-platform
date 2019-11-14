import React from 'react';
import SideBar from '../../../SideBar';
import PropTypes from 'prop-types';
import { groupBy } from '../../../../helper'
import DataLabListPanel from './DataLabListPanel'
import DataLabDetailPanel from './DataLabDetailPanel'
import DataLabForm from './DataLabForm'
import { withRouter } from 'react-router';
import { iconsImages } from '../../../../constants/icons_images'


const DataLabPanel = (props) => {
  const { appDataLabSettings, appInstanceTypeSettings, appStorageSettings } = props
  const groupedDataLabs = groupBy(['Group'], appDataLabSettings)
  const { params, url } = props.match
  const { typename, typegroup, instancename } = params
  let targetContext = <DataLabListPanel 
    typeName={typename}
    typeGroup={typegroup}
    appInstanceTypeSettings={appInstanceTypeSettings} />
  if(instancename){
    targetContext = <DataLabDetailPanel
      instanceName={instancename}
      typeName={typename}
      typeGroup={typegroup}
      appInstanceTypeSettings={appInstanceTypeSettings} />
  }else if(url.endsWith('/new')){
    targetContext = <DataLabForm
      appDataLabSettings={appDataLabSettings}
      appInstanceTypeSettings={appInstanceTypeSettings}
      appStorageSettings={appStorageSettings} />
  }
  return (
    <div>
      <SideBar.SubSideBar>
        <SideBar.SubSideBar.Header>Labs</SideBar.SubSideBar.Header>
        <SideBar.SubSideBar.Item
          icon={iconsImages.OK_ICON_GRAY}
          active_icon={iconsImages.OK_ICON_BLUE}
          href="/datalab" text="All instances" />
        <div className="sub-side-items">
          {appDataLabSettings.length > 0?
            Object.keys(groupedDataLabs).map(group => {
              return (
                <div key={group}>
                  {group && <SideBar.SubSideBar.Header>{group}</SideBar.SubSideBar.Header>}
                  {groupedDataLabs[group].map(dataLab => 
                    <SideBar.SubSideBar.Item 
                      icon={dataLab.icon || iconsImages.LAB_ICON_BLUR}
                      active_icon={dataLab.active_icon || iconsImages.LAB_ICON}
                      key={dataLab.Name} 
                      href={`/datalab/${group}/${dataLab.Name}`}
                      text={dataLab.Name} />
                  )}
                </div>
              )
            })
            :'Loading'
          }
        </div>
      </SideBar.SubSideBar>
      <div className="sub-main-context">
        {targetContext}
      </div>
    </div>
  )
}

DataLabPanel.propTypes = {
  dispatch: PropTypes.func,
  appDataLabSettings: PropTypes.array,
  appInstanceTypeSettings: PropTypes.array,
  appStorageSettings: PropTypes.array,
  match: PropTypes.object,
}

export default withRouter(DataLabPanel)