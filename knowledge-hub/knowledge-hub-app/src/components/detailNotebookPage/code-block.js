import "./highlight.min.css"
const React = require('react')
const PropTypes = require('prop-types')
const hljs = require('highlight.js')

export default class CodeBlock extends React.PureComponent {
  constructor(props) {
    super(props)
    this.setRef = this.setRef.bind(this)
  }

  setRef(el) {
    this.codeEl = el
  }

  componentDidMount() {
    if(this.props.language){
    this.highlightCode()
    }
  }

  componentDidUpdate() {
    this.highlightCode()
  }

  highlightCode() {
    hljs.highlightBlock(this.codeEl)
  }

  render() {
    if(this.props.language){
      return (
      <pre>
        <code ref={this.setRef} className={`language-${this.props.language}`}>
          {this.props.value}
        </code>
      </pre>
      )
    } else {
      return (
        <pre className='plain-text'>
          {this.props.value}
        </pre>
      )
    }
  }
}

CodeBlock.defaultProps = {
  language: ''
}

CodeBlock.propTypes = {
  value: PropTypes.string,
  language: PropTypes.string
}

//module.exports = CodeBlock