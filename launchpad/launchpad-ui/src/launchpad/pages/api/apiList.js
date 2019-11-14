import React, {Component} from 'react';
import {Badge, Button, Card, Col, Form, Pagination, Row} from 'react-bootstrap'
import {connect} from 'react-redux';
import PropTypes from 'prop-types';
import actions from '../../actions'
import {apiConstant} from '../../constants/app';
import '../../../assets/styles/pages/apiList.scss'
import LoadingPage from '../../../launchpad/components/LoadingPage'
import _ from 'lodash'
import {convertUTCToLocalTime} from '../../services/utils'
import {NotificationContainer} from 'react-notifications';


class APIList extends Component {
  static propTypes = {
    apiList: PropTypes.object,
    getAPIList: PropTypes.func,
    getSpecificAPI: PropTypes.func
  };

  constructor(props) {
    super(props);
    this.props.getAPIList(1);
    this.callAjax = _.debounce(this.callAjax, 500);
    this.state ={
      active: 1,
      search: ''
    }
  }

  searchAPI = (event) => {
    event.persist();
    this.callAjax(event.target.value);
  };

  callAjax = (value) => {
    this.props.getSpecificAPI(value, 1);
    this.setState({
      search: value,
      active: 1
    })
  };

  handlePagination = (pageNum) => {
    this.setState({
      active: pageNum
    });
    if (this.state.search === '') {
      this.props.getAPIList(pageNum);
    } else {
      this.props.getSpecificAPI(this.state.search, pageNum);
    }

  };

  render() {
    const { apiList }  = this.props;

    let item = [];
    if (apiList) {
      for (let number = 1; number <= apiList.pages; number++) {
        item.push(
          <Pagination.Item key={number} active={number === this.state.active} onClick={() => this.handlePagination(number)}>
            {number}
          </Pagination.Item>,
        )
      }
    }

    return (
      <div>
        { apiList ?
          <div className='api-list-outer'>
            <Row className='api-list-header'>
              <Col md={1} className='header-text'>
                <span>API</span>
                <span className='header-text-count'>({apiList.total})</span>
              </Col>
              <Col md={4}>
                <Form>
                  <Form.Group controlId="formBasicEmail">
                    <Form.Control type="text" placeholder="Search and filter..." onChange={this.searchAPI}/>
                  </Form.Group>
                </Form>
              </Col>
              <Col md={{span:2, offset:5}}>
                <Button href="apis/create" variant="success" className='header-btn'><img src="../../../assets/static/images/toolbar/Add.svg" className='header-btn-img' /> Create API</Button>
              </Col>
            </Row>
            <Row className='api-list-body'>
              {apiList.list.map((api, index) => {
                return (
                  <Col md={4} key={index} className='api-border'>
                    <Card border="info">
                      <Card.Header className='api-header'>
                        <Card.Link href={ 'apis/edit/' + api.id} >{api.api_name}</Card.Link>
                        {api.api_status === 'Ready' ?
                          <Badge className='api-header-status' variant="info">{api.api_status}</Badge>
                          :
                          <Badge className='api-header-status' variant="warning">{api.api_status}</Badge>
                        }
                      </Card.Header>
                      <Card.Body className='api-body'>
                        <Card.Text className='access-url'>
                          {api.access_url}
                        </Card.Text>
                        <Card.Text className='api-desc'>
                          {api.api_des !== '' ? api.api_des : 'no description now'}
                        </Card.Text>
                        <Card.Text className='api-info'>
                          <span className='api-version'>version: {api.api_version}</span>
                          <span className='api-refresh'>{convertUTCToLocalTime(api.updated_at)}</span>
                        </Card.Text>
                      </Card.Body>
                    </Card>
                  </Col>
                )
              })}
              <Col md={12} className='text-center'>
                <Pagination className='justify-content-center'>
                  {item}
                </Pagination>
              </Col>
            </Row>
          </div> :
          <LoadingPage/>
        }
        <NotificationContainer/>
      </div>
    )
  }
}

const mapStateToProps = (state) => {
  return {
    apiList: state.apiList.response.data
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    getAPIList : (pageNum) => {
      dispatch(actions.fetchResourceByPath(apiConstant.GET_API_LIST, `?keyword=&pageNum=${pageNum}&pageSize=9`));
    },
    getSpecificAPI: (keyword, pageNum) => {
      dispatch(actions.fetchResourceByPath(apiConstant.GET_API_LIST, `?keyword=${keyword}&pageNum=${pageNum}&pageSize=9`))
    }
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(APIList);
