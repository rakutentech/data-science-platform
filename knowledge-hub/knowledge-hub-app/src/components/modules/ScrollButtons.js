import React, { Component } from 'react';
import { GoTop, ShowCode, Download } from '../assets';

function FlyButtons(props) {
  var scroll_button = ''
  switch(props.title) {
    case 'Go-top':
      scroll_button = <GoTop />
      break;
    case 'Download':
      scroll_button = <Download />
      break;
    default:
      scroll_button = <ShowCode />
  }
  return (
    <div className="fly-btn" onClick={props.callback}>
      {scroll_button}
      {props.title}
    </div>
  )
}

class ScrollButtons extends Component {
  constructor() {
    super();
    this.state = {
      showGoTop: false,
      showCodeTitle: 'Hide-code'
    }
    this.handleScroll = this.handleScroll.bind(this);
  }

  goTop = () => {
    window.scrollTo(0, 0)
  }

  changeTitle () {
    if (this.state.showCodeTitle === 'Hide-code') {
      this.setState({ showCodeTitle: 'Show-code' })
    } else {
      this.setState({ showCodeTitle: 'Hide-code' })
    }
  }

  componentDidMount() {
    window.addEventListener('scroll', this.handleScroll);
  }

  handleScroll(e) {
    if (window.pageYOffset > 200) {
      this.setState({
        showGoTop: true,
      });
    } else {
      this.setState({
        showGoTop: false,
      });
    }
  }

  render() {
    if (this.props.title === 'Go-top') {
      return (
        <div className="fly_btns">
        {
          this.state.showGoTop ? <FlyButtons title='Go-top' callback={this.goTop} /> : ''
        }
        </div>
      )
    } else if (this.props.title === 'Show-code') {
      return (
        <div className={`fly_btns2 ${this.state.showCodeTitle}`}>
          <FlyButtons title={this.state.showCodeTitle} callback={this.changeTitle.bind(this)} />
        </div>
      );
    } else {
      return (
        <div className='fly_btns3'>
          <FlyButtons title='Download' />
        </div>
      );
    }
  }
}

export default ScrollButtons;