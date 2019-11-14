import React, {Component} from 'react';
import {Card, Col, Row} from 'react-bootstrap'
import {connect} from 'react-redux';
import PropTypes from 'prop-types';
import actions from '../../actions'
import {modelConstant} from '../../constants/app';
import '../../../assets/styles/pages/modelList.scss'
import LoadingPage from '../../../launchpad/components/LoadingPage'
import {NotificationContainer} from 'react-notifications';

class ModelList extends Component {
  static propTypes = {
    modelList: PropTypes.object,
    getModelList: PropTypes.func
  };

  constructor(props) {
    super(props);
    this.props.getModelList()
  }
  render() {
    const {modelList} = this.props;
    return (
      <div>
        {modelList ?
          <Row className='model-list-outer'>
            <Col md={12}>
              <div className='model-list-title'>
                <span>Models</span><span className='model-list-title-count'> ({modelList.total})</span>
              </div>
              <Row className='model-outer'>
                {modelList.list.map((model, index) => {
                  return (
                    <Col md={3} key={index} className='model-border'>
                      <Card border="success">
                        <Card.Header className='model-header'><Card.Link
                          href={'/model_versions/' + model.experiment_id}>{model.name}</Card.Link></Card.Header>
                        <Card.Body className='model-body'>
                          <div className='model-desc'>
                            The model description is N/A now.
                          </div>
                          <div className='model-info'>
                            <div className='model-version'>location: {model.artifact_location}</div>
                            {/*<div className='model-refresh'>updated: {convertUTCToLocalTime(model.update_time)}</div>*/}
                            <div className='model-refresh'>updated: N/A</div>
                          </div>
                        </Card.Body>
                      </Card>
                    </Col>
                  )
                })}
              </Row>
            </Col>
          </Row> :
          <LoadingPage />
        }
        <NotificationContainer/>
      </div>
    )
  }
}

const mapStateToProps = (state) => {
  return {
    modelList: state.modelList.response.data
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    getModelList : () => {
      dispatch(actions.fetchResource(modelConstant.GET_MODEL_LIST));
    }
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(ModelList);
