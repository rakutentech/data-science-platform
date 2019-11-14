import React, { Component } from 'react';
import { LogoSVG } from "./assets";
import { history } from "../helpers/history";

class Logo extends Component {
  constuctor() {
  }

  routeChange() {
    history.push('', {})
    window.location.assign(process.env.REACT_APP_KH_HOST)
  }
  render() {
    const main_div = {
      width: '185px',
      height: '40px'
    }
    const second_li = {
      color: 'var(--dark-purple-color)',
      fontWeight: '800',
      fontSize: '18px',
      lineHeight: '15px'
    }
    return (
      <div style={main_div} onClick={() => this.routeChange()} id="logo" >
        <LogoSVG />
        <ul style={{ display: 'inline-block', margin: 0, padding: '0 0 0 8px' }}>
          <li className="txt-12-gray">DScP</li>
          <li style={second_li}>Knowledge Hub</li>
        </ul>
      </div >
    );
  }
}

export default Logo;