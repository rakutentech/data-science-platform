import React, { Component } from 'react';
import { FormGroup, FormControl, Form, Col } from 'react-bootstrap';
import PropTypes from 'prop-types';

class TagsInput extends Component {
    static propTypes = {
      tags: PropTypes.object,
      onChange: PropTypes.func
    }

    constructor(props) {
      super(props);
      const { tags } = this.props
      this.state = {
        tags : Object.keys(tags).map((key, index) => [index, key, tags[key]]),
        newTagKey: '',
        newTagValue: ''
      }
    }
    handleNewTagChange = (e) => {
      let tags = [].concat(this.state.tags)
      const index = tags.length
      let newTagKey = this.state.newTagKey
      let newTagValue = this.state.newTagValue
      if(e.target.name == 'newTagKey'){
        newTagKey = e.target.value
      }else if(e.target.name == 'newTagValue'){
        newTagValue = e.target.value
      }
      this.setState({
        newTagKey: newTagKey,
        newTagValue: newTagValue
      })
      tags[index] = [index, newTagKey, newTagValue]
      const availableTags = tags
        .filter(tag => tag[1] && tag[2])
        .reduce((map, tag) => {
          map[tag[1]] = tag[2]
          return map
        }, {})
      this.props.onChange(availableTags)
    }
    handleTagChange = (e) => {
      let tags = this.state.tags
      const index = parseInt(e.target.getAttribute('index'))
      const tag = tags[index]
      if(e.target.name == 'tagKey'){
        tags[index] = [index, e.target.value, tag[2]]
      }else if(e.target.name == 'tagValue'){
        tags[index] = [index, tag[1], e.target.value]
      }
      this.setState({
        tags: tags
      })
      const availableTags = tags
        .filter(tag => tag[1] && tag[2])
        .reduce((map, tag) => {
          map[tag[1]] = tag[2]
          return map
        }, {})
      this.props.onChange(availableTags)
    }
    newTag = (e) => {
      e.preventDefault();
      e.stopPropagation();
      const tags = [...this.state.tags, 
        [this.state.tags.length, this.state.newTagKey, this.state.newTagValue]]
      this.setState({
        tags : tags,
        newTagKey: '',
        newTagValue: ''
      })
    }
    removeTag = (e) => {
      e.preventDefault();
      e.stopPropagation();
      const index = parseInt(e.target.getAttribute('index'))
      let tags = []
      const targetTags = this.state.tags
      let newIndex = 0
      for(let i =0;i<targetTags.length;i++){
        if(i != index){
          tags = [...tags, [newIndex, targetTags[i][1], targetTags[i][2]]]
          newIndex++
        }
      }
      this.setState({
        tags: tags
      })
    }
    render(){
      return  <div>
        {this.state.tags.map(tag => 
          <Form.Row key={tag[0]}> 
            <Col className="mr-2">
              <FormGroup controlId="tagKey"  className="mb-2">
                <FormControl
                  name="tagKey"
                  type="text"
                  index={tag[0]}
                  value={tag[1]}
                  onChange={this.handleTagChange}
                  placeholder="key"
                />
              </FormGroup>
            </Col>
            <Col>
              <FormGroup controlId="tagValue"  className="mb-2">
                <FormControl
                  name="tagValue"
                  type="text"
                  index={tag[0]}
                  value={tag[2]}
                  onChange={this.handleTagChange}
                  placeholder="value"
                />
              </FormGroup>
            </Col>
            <Col>
              <button className="remove-tag-button" index={tag[0]} onClick={this.removeTag}></button>
            </Col>
          </Form.Row>
        )}
       
        <Form.Row>  
          <Col className="mr-2">
            <FormGroup controlId="newTagKey"  className="mb-2">
              <FormControl
                name="newTagKey"
                type="text"
                value={this.state.newTagKey}
                onChange={this.handleNewTagChange}
                placeholder="key"
              />
            </FormGroup>
          </Col>
          <Col>
            <FormGroup controlId="newTagValue"  className="mb-2">
              <FormControl
                name="newTagValue"
                type="text"
                value={this.state.newTagValue}
                onChange={this.handleNewTagChange}
                placeholder="value"
              />
            </FormGroup>
          </Col>
          <Col>
            <button className="new-tag-button" onClick={this.newTag}></button>
          </Col>
        </Form.Row>
      </div>
    }
}

export default TagsInput