import React, { Component } from 'react';
import Logo from "./Logo"
import { Input, Icon } from 'semantic-ui-react'
import { history } from "../helpers/history";

class Header extends Component {
  constructor(props) {
    super(props)
    this.state = {
      searchKeyword: this.props.searchKeyword
    }
  }

  handleChange = (evt) => {
    this.setState({ searchKeyword: evt.target.value });
  }

  componentDidUpdate() {
    if (typeof history.location.state !== 'undefined' && history.location.state !== {}) {
      if (history.location.state.selected_tag !== undefined && this.props.searchKeyword !== '') {
        history.location.state = {}
        this.handleChange({ target: { value: '' } })
      }
    }
  }

  render() {
    return (
      <header>
        <div className="container">
          <Logo />
          <Input icon={<Icon name='search' link onClick={this.props.handleSearchIconPress} />}
            id="search" value={this.props.searchKeyword} onChange={this.props.handleChangeSearch} onKeyPress={this.props.handleKeyPress} placeholder='Search keywords, tag, author...' />
          <this.props.LoginLogoutContainer />
        </div>
      </header>
    )
  }
}


export default Header;