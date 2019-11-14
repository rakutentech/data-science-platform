import React, { Component } from 'react';
import AceEditor from 'react-ace';
import PropTypes from 'prop-types';
import 'brace/theme/monokai';
import 'brace/ext/language_tools';

class CodeEditor extends Component {
  static propTypes = {
    name: PropTypes.string,
    rows: PropTypes.number,
    width: PropTypes.string,
    mode: PropTypes.string,
    value: PropTypes.string,
    onChange: PropTypes.func,
    wrapEnabled: PropTypes.bool,
    className: PropTypes.string,
  }

  constructor(props) {
    super(props);
    const { mode } = this.props
    this.state = {
      mode: 'text'
    }
    import(`brace/snippets/${mode}`).then(() => {
      import(`brace/mode/${mode}`).then(() => {
        this.setState({ mode: mode })
      })
    })
  }
  componentDidUpdate(prevProps) {
    if (prevProps.mode != this.props.mode) {
      const { mode } = this.props
      import(`brace/snippets/${mode}`).then(() => {
        import(`brace/mode/${mode}`).then(() => {
          this.setState({ mode: mode })
        })
      })
    }
  }
  render() {
    return (
      <AceEditor
        mode={this.state.mode}
        theme="monokai"
        setOptions={{
          enableBasicAutocompletion: true,
          enableLiveAutocompletion: true,
          enableSnippets: this.state.mode === 'text' ? false : true,
          showLineNumbers: true,
          tabSize: 2
        }}
        showPrintMargin={true}
        showGutter={true}
        highlightActiveLine={true}
        wrapEnabled={this.props.wrapEnabled}
        onChange={this.props.onChange}
        className={this.props.className}
        minLines={this.props.rows}
        maxLines={this.props.rows}
        width={this.props.width}
        value={this.props.value}
        name={this.props.name}
        editorProps={{ $blockScrolling: true }}
      />
    )
  }
}

export default CodeEditor
