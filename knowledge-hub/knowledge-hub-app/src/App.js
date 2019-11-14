import React from "react";

import { Router, Route, Switch } from "react-router-dom";
import { connect } from "react-redux";

import ListNotebookPageContainer from "./containers/ListNotebookPageContainer";
import DetailNotebookPageContainer from "./containers/DetailNotebookPageContainer";
import UserPostsContainer from "./containers/UserPostsContainer";
import NotificationContainer from "./containers/NotificationContainer";
import LoginLogoutContainer from "./containers/LoginLogoutContainer";

import { history } from "./helpers/history";
import { alertActions } from "./actions/alertActions";

import Header from "./components/Header"
import Footer from "./components/Footer"
import PopUpNotification from "./components/modules/PopUpNotification";

class App extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      searchKeyword: localStorage.getItem('searchKeyword') || "",
      is_notification: false,
      notification_title: '',
      is_notification_temp: false,
      selected_tag: localStorage.getItem('selected_tag') || null,
    }
    localStorage.removeItem('searchKeyword')
    localStorage.removeItem('selected_tag')
    const { dispatch } = this.props;
    history.listen((location, action) => {
      dispatch(alertActions.clear());
    });
  }

  handleSearchIconPress = () => {
    let search_text = document.getElementById('search').value
    this.removeHistoryState()
    localStorage.setItem('searchKeyword', search_text)
    window.location.assign(`${process.env.REACT_APP_KH_HOST}`)
  }

  handleKeyPress = (event) => {
    if (parseInt(event.which) === 13 || parseInt(event.keyCode) === 13) {
      localStorage.setItem('searchKeyword', document.getElementById('search').value)
      window.location.assign(`${process.env.REACT_APP_KH_HOST}`)
    }
  }

  removeHistoryState = () => {
    this.setState({ selected_tag: null })
  }

  setHistoryState = (selected_tag) => {
    this.setState({ selected_tag: selected_tag })
    this.setState({ searchKeyword: '' })
    document.getElementById('search').value = ''
  }

  updateSearchKeyword = () => {
    this.setState({ searchKeyword: '' })
  }

  handleChangeSearch = () => {
    this.setState({ searchKeyword: document.getElementById('search').value })
  }

  withSearch = () => {
    return (
      <ListNotebookPageContainer
        selected_tag={this.state.selected_tag}
        history={history}
        removeHistoryState={this.removeHistoryState}
        setHistoryState={this.setHistoryState}
        updateSearchKeyword={this.updateSearchKeyword}
        searchKeyword={this.state.searchKeyword} />
    )
  }

  componentDidMount() {
    if (localStorage.getItem('notification_status')) {
      switch (localStorage.getItem('notification_status')) {
        case 'updated_success':
          this.setState({
            notification_title: 'A new version is available.',
            is_notification: true,
            is_notification_temp: true,
          })
          localStorage.removeItem('notification_status')
          break;
        default:
      }
    }
  }

  render() {
    let { is_notification, notification_title, is_notification_temp } = this.state

    return (
      <Router history={history}>
        <div className="app">
          {is_notification && <PopUpNotification is_temp={is_notification_temp} title={notification_title} />}
          <Header handleChangeSearch={this.handleChangeSearch} searchKeyword={this.state.searchKeyword} LoginLogoutContainer={LoginLogoutContainer} handleSearchIconPress={this.handleSearchIconPress} handleKeyPress={this.handleKeyPress} />
          <Switch>
            {/* <Route exact path={process.env.PUBLIC_URL + "/"} component={ListNotebookPageContainer} /> */}
            <Route exact path={process.env.PUBLIC_URL + "/"} searchKeyword={this.state.searchKeyword} component={this.withSearch} />
            <Route path={process.env.PUBLIC_URL + "/detail"} setHistoryState={this.setHistoryState} component={DetailNotebookPageContainer} />
            <Route path={process.env.PUBLIC_URL + "/preview"} component={DetailNotebookPageContainer} />
            <Route path={process.env.PUBLIC_URL + "/edit"} component={DetailNotebookPageContainer} />
            <Route path={process.env.PUBLIC_URL + "/userposts"} component={UserPostsContainer} />
            <Route path={process.env.PUBLIC_URL + "/notification"} component={NotificationContainer} />
          </Switch>
          <Footer />
          {/* <ScrollButtons title='Go-top' /> */}
        </div>
      </Router>
    );
  }
}

function mapStateToProps(state) {
  const { alert } = state;
  return {
    alert
  };
}

const connectedApp = connect(mapStateToProps)(App);
export { connectedApp as App };