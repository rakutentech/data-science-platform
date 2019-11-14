import React, { Component } from 'react';
import { Confluence, MailInCircle } from "./assets";

class Footer extends Component {
  render() {
    return (
      <footer>
        <div className="container">
          <div className="copyright txt-12-gray">Copyright © 2019 DScP</div>
          <div className="social">
            <a href="/">
              <Confluence />
            </a>
            <a href="/">
              <MailInCircle />
            </a>
          </div>
        </div>
      </footer>
    );
  }
}

export default Footer;