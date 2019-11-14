import React, {Component} from 'react';

class ServerError extends Component {
  render() {
    return (
      <div className="page-wrap d-flex flex-row align-items-center">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-md-12 text-center">
              <span className="display-1 d-block">500</span>
              <div className="mb-4 lead">Internal Server Error.</div>
              <a href="JavaScript:history.go(-1)" className="btn btn-link">Back to Previous Page</a>
            </div>
          </div>
        </div>
      </div>
    )
  }
}

export default ServerError
