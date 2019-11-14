import React, {Component} from 'react';

class BadRequest extends Component {
  render() {
    return (
      <div className="page-wrap d-flex flex-row align-items-center">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-md-12 text-center">
              <span className="display-1 d-block">400</span>
              <div className="mb-4 lead">Bad Request.</div>
              <a href="JavaScript:history.go(-1)" className="btn btn-link">Back to Previous Page</a>
            </div>
          </div>
        </div>
      </div>
    )
  }
}

export default BadRequest
