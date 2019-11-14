import React, { Component, Fragment } from 'react';
import { GreenArrowIcon, SuccessIcon } from '../assets';

class PopUpNotification extends Component {
  constructor() {
    super();
    this.state = {
      show: true
    }
  }

  dismissNtf = () => {
    this.setState({ show: false })
  }

  componentDidMount() {
    if (this.props.is_temp !== undefined) {
      setTimeout(
        // this.dismissNtf(),
        function () {
          this.setState({ show: false });
        }
          .bind(this),
        2000
      );
    }
  }

  render() {
    return (
      <Fragment>
        {
          this.state.show ? (
            <div className={`global_notification ${this.props.is_alert !== undefined && 'global_alert'}`}>
              {(this.props.is_temp === undefined || this.props.is_temp === false) ? <GreenArrowIcon /> : <SuccessIcon />}
              <div className="global_notification_body">
                <h3>{this.props.title}</h3>
                {this.props.body_text || ''}
                {this.props.is_dismiss && <div className="dismiss" onClick={this.dismissNtf}>Dismiss</div>}
              </div>
            </div>
          ) : ''
        }
      </Fragment>
    );
  }
}

export default PopUpNotification;