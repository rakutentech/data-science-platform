import React from 'react'
import { Link } from 'react-router-dom';
import { iconsImages } from '../../../../constants/icons_images'

const HomePanel = () => {
  return (
    <div>
      <div className="welcome-bar" style={{ 'backgroundImage': `url(${iconsImages.WELCOME})` }}>
        <div className="welcome-bar__message">Welcome!<br /> Thank you for using DataLab</div>
      </div>
      <div className="welcome-description-bar">
        <div className="welcome-description-bar__message">
          <b>DataLab</b> is an easy to use interactive tool for data exploration, analysis, visualization and machine learning
        </div>
      </div>
      <div className="welcome-detail-bar">
        <div className="welcome-detail-bar__message">
          <div><Link to="/datalab">Create instance</Link></div>
        </div>
      </div>
    </div>
  )
}

export default HomePanel