// @flow
import React, { Fragment } from "react";
import ReactMarkdown from 'react-markdown'
import CodeBlock from './code-block.js'
import "./highlight.min.css"
import { Button, Header, Form, Input, TextArea, Icon, Modal } from 'semantic-ui-react'
import { Markup } from 'interweave';
import moment from "moment";
import path from 'path';
import UserAvatar from "../UserInfoBlocks/UserAvatar";
import CardBlock from '../CardBlock';
import { userConstants } from '../../constants/userConstants';
import { utils_general } from '../../utils/general';
import Select from 'react-select';
import CreatableSelect from 'react-select/lib/Creatable';
import axios from 'axios'
import isHtml from 'is-html'
import PropTypes from 'prop-types';
import ScrollButtons from "../modules/ScrollButtons";
import Tags from "../modules/Tags.js";
// import needle from 'needle'

var is_preview = window.location.pathname.includes('preview');
var is_edit = window.location.pathname.includes('edit');
var is_change
if (is_preview || is_edit) {
  is_change = true
}

export default class DetailContent extends React.Component {

  static propTypes = {
    notebookId: PropTypes.string,
    notebookDetail: {
      notebookId: PropTypes.string,
      title: PropTypes.string,
      subTitle: PropTypes.string,
      keywords: PropTypes.string,
      createTime: PropTypes.string,
      updateTime: PropTypes.string,
      recordStatus: PropTypes.string,
      path: PropTypes.string,
      authors: PropTypes.string,
      authorIds: PropTypes.string,
      tags: PropTypes.string,
      comments: PropTypes.string,
      existOne: PropTypes.boolean,
      viewCount: PropTypes.number
    },
    notebookMD: PropTypes.string,
    publishNotebookReturn: PropTypes.string,
    deleteNotebookReturn: PropTypes.string,
    getNotebookDetail: PropTypes.func,
    getTagsList: PropTypes.func,
    publishComment: PropTypes.func,
    updateComment: PropTypes.func,
    deleteComment: PropTypes.func,
    publishNotebook: PropTypes.func,
    deleteNotebook: PropTypes.func,
    getNotebookMD: PropTypes.func,
  };

  constructor() {
    super();
    this.state = {
      open_modal: false,
      markdown: '',
      notebook_tags: [],
      comments: '',
      textValue: '',
      notebook_details: {},
      authorNames: [],
      otherAuthors: [],
      input_tags: [],
      available_authors: [],
      subTitle: '',
      userId: '',
      userName: '',
      token: '',
      title: '',
      hasError: false,
      tag_key: '',
      commentTexts: [],
      commentTextsOrigin: [],
      commentTextsEdit: [],
      commentEditButtons: [],
      commentDeleteButtons: [],
      commentLinks: [],
      commentLinksOrigin: [],
      notebookDeleteButton: '',
      displayCode: {},
      displayAllCode: true,
      scrollBottom: false
    };
    // if (is_preview && !localStorage.getItem(userConstants.KEY_ACCESS_TOKEN)) {
    //   window.location.assign(process.env.REACT_APP_LOGIN_API_URL)
    // }
  }

  close_modal = () => this.setState({ open_modal: false })

  redirect_to_login = () => {
    localStorage.setItem('old_action', 'comment_login')
    utils_general.setOldUrl()
    window.location.assign(process.env.REACT_APP_LOGIN_API_URL)
  }

  loginHandle = () => {
    localStorage.setItem('old_action', 'comment_login')
    utils_general.setOldUrl()
  }

  getKeyByValue(object, value) {
    return Object.keys(object).find(key => object[key] === value);
  }

  async handlePreviewSubmit() {
    let empty_check = false, missing_items = ''
    if (this.state.title.length === 0) {
      missing_items += 'Title'
      empty_check = true
    }
    if (empty_check) {
      alert(`Please fill in all fields first: ${missing_items}`)
      return false
    }
    let ids = [localStorage.getItem(userConstants.KEY_USER_NAME)];
    let notebook_ID = this.props.notebookId
    if (this.state.authorNames) {
      this.state.authorNames.forEach(name => {
        ids.push(this.getKeyByValue(this.state.available_authors, name))
      })
    }
    let update_data = {
      notebookId: notebook_ID,
      recordStatus: '0',
      subTitle: this.state.subTitle,
      title: this.state.title,
      authorNames: [localStorage.getItem(userConstants.KEY_USER_NAME_DISPLAY)].concat(this.state.authorNames).filter(function (el) { return el; }),
      authorIds: ids,
      tags: this.state.input_tags,
      userId: localStorage.getItem(userConstants.KEY_USER_NAME)
    };
    if(is_edit){
      await this.props.publishNotebook(this.props.notebookId, this.state.userId, this.state.userName, this.state.token, update_data, 'update');
    }else{
      await this.props.publishNotebook(this.props.notebookId, this.state.userId, this.state.userName, this.state.token, update_data, 'publish');
    }
  }

  // async publishSubmit(update_data) {
  //   await this.props.publishNotebook(this.props.notebookId, this.state.userId, this.state.userName, this.state.token, update_data);
  // }

  clickNotebookDelete() {
    const notebookDeleteButton = <div className='deleteNotebook'>
      <div className='removeNotebook'>
        <Button onClick={this.HandleNotebookDelete.bind(this)}>Confirm, Remove</Button>
      </div>
      <div className='cancelNotebookDelete'>
        <Button onClick={this.cancelNotebookDelete.bind(this)}>Cancel</Button></div>
    </div>
    this.setState({ notebookDeleteButton: notebookDeleteButton })
  }

  cancelNotebookDelete() {
    var notebookDeleteButton =
      <Form.Field className='deleteNotebook removeNotebook' control={Button} onClick={this.clickNotebookDelete.bind(this)}>Remove Post</Form.Field>
    this.setState({ notebookDeleteButton: notebookDeleteButton })
  }

  async HandleNotebookDelete() {
    await this.props.deleteNotebook(this.props.notebookId, this.state.userId, this.state.userName, this.state.token)
  }

  handleChangeSelectA = (selectedOption) => {
    this.setState({ authorNames: [...new Set(selectedOption.map(x => x.label))] });
    this.setState({ otherAuthors: [...new Set(selectedOption.map(x => x.label))] });
  }

  handleChangeSelectT = (selectedOption) => {
    this.setState({ input_tags: [...new Set(selectedOption.map(x => x.value))] });
  }

  handleChangeD = (evt) => {
    this.setState({ subTitle: evt.target.value });
  }

  handleChangeTitle = (evt) => {
    this.setState({ title: evt.target.value });
  }

  updateCommentTexts(commentTexts) {
    this.setState({ commentTexts: commentTexts })
  }

  updateCommentLinks(commentLinks) {
    this.setState({ commentLinks: commentLinks })
  }

  clickCommentEdit(comment, commentId) {
    var commentTexts = this.state.commentTexts
    var commentTextsEdit = this.state.commentTextsEdit
    var commentLinks = this.state.commentLinks
    var commentTextsOrigin = this.state.commentTextsOrigin
    var commentLinksOrigin = this.state.commentLinksOrigin
    var commentEditButtons = this.state.commentEditButtons
    var commentDeleteButtons = this.state.commentDeleteButtons

    if (commentTextsEdit[commentId] && commentTextsEdit[commentId] !== comment) {
      comment = commentTextsEdit[commentId]
    }

    commentLinksOrigin[commentId] = commentLinks[commentId]
    this.setState({ commentLinksOrigin: commentLinksOrigin })
    commentTextsOrigin[commentId] = commentTexts[commentId]
    this.setState({ commentTextsOrigin: commentTextsOrigin })

    commentTexts[commentId] = <Form><Form.TextArea onChange={this.setEditComment.bind(this, commentId)} value={comment} name='textarea'></Form.TextArea></Form>
    this.setState({ commentTexts: commentTexts })
    commentEditButtons[commentId] = <div className='editComment'>
      <Button color='green' onClick={this.updateComment.bind(this, commentId, comment)}>Save</Button>
      <Button basic onClick={this.cancelComment.bind(this, commentId, comment)}>Cancel</Button>
    </div>
    commentDeleteButtons[commentId] = <div className='deleteComment'>
      <div className='removeComment'>
        <Button basic color='brown' onClick={this.clickCommentDelete.bind(this, commentId)}>Delete</Button>
      </div>
    </div>

    this.setState({ commentEditButtons: commentEditButtons })
    this.setState({ commentDeleteButtons: commentDeleteButtons })
    commentLinks[commentId] = ''
    this.setState({ commentLinks: commentLinks })
    this.adjustCommentStyle('Edit', commentId)
  }

  clickCommentDelete(commentId) {
    var commentDeleteButtons = this.state.commentDeleteButtons
    commentDeleteButtons[commentId] = <div className='deleteComment'>
      <div className='confirmDeleteComment'>Are you sure ?</div>
      <div className='cancelCommentDelete'><Button basic onClick={this.cancelCommentDelete.bind(this, commentId)}>Cancel</Button></div>
      <div className='removeComment'><Button basic color='brown' onClick={this.removeComment.bind(this, commentId)}>Yes, Delete</Button></div>
    </div>
    this.setState({ commentDeleteButtons: commentDeleteButtons })
  }

  setComment(e) {
    this.setState({ textValue: e.target.value })
  }

  cancelComment(commentId, comment) {
    let commentTexts = this.state.commentTexts
    let commentLinks = this.state.commentLinks
    let commentTextsOrigin = this.state.commentTextsOrigin
    let commentLinksOrigin = this.state.commentLinksOrigin
    let commentEditButtons = this.state.commentEditButtons
    let commentDeleteButtons = this.state.commentDeleteButtons

    commentTexts[commentId] = commentTextsOrigin[commentId]
    commentLinks[commentId] = commentLinksOrigin[commentId]
    this.setState({ commentTexts: commentTexts })
    let commentTextsEdit = this.state.commentTextsEdit
    commentTextsEdit[commentId] = comment
    this.setState({ commentTextsEdit: commentTextsEdit })
    this.setState({ commentLinks: commentLinks })
    commentEditButtons[commentId] = ''
    this.setState({ commentEditButtons: commentEditButtons })
    commentDeleteButtons[commentId] = ''
    this.setState({ commentDeleteButtons: commentDeleteButtons })

    this.adjustCommentStyle('noEdit', commentId)
  }

  cancelCommentDelete(commentId) {
    var commentDeleteButtons = this.state.commentDeleteButtons
    commentDeleteButtons[commentId] = <div className='deleteComment'>
      <div className='removeComment'>
        <Button basic color='brown' onClick={this.clickCommentDelete.bind(this, commentId)}>Delete</Button>
      </div>
    </div>
    this.setState({ commentDeleteButtons: commentDeleteButtons })
  }

  setEditComment(commentId, e) {
    var commentTexts = this.state.commentTexts
    var commentTextsEdit = this.state.commentTextsEdit
    const comment = e.target.value
    commentTexts[commentId] = <Form><Form.TextArea onChange={this.setEditComment.bind(this, commentId)} value={comment} name='textarea'></Form.TextArea></Form>
    this.setState({ commentTexts: commentTexts })
    commentTextsEdit[commentId] = comment
    this.setState({ commentTextsEdit: commentTextsEdit })
  }

  async addComment() {
    const comment = this.state.textValue
    if (comment.length === 0)
      return 0
    if (this.state.token) {
      const userName = localStorage.getItem(userConstants.KEY_USER_NAME_DISPLAY)
      const userId = localStorage.getItem(userConstants.KEY_USER_NAME)
      let g = await this.props.publishComment(this.props.notebookId, userId, userName, this.state.token, comment);
      if (g) {
        await this.getDetail(userConstants.RECORD_STATUS);
        this.setState({ comments: this.props.notebookDetail.comments })
        this.setState({ textValue: '' })
      } else {
        this.setState({ open_modal: true })
      }
    } else {
      this.setState({ open_modal: true })
    }
  }

  async updateComment(commentId, comment) {
    var commentTexts = this.state.commentTexts
    var commentTextsEdit = this.state.commentTextsEdit
    var commentLinks = this.state.commentLinks
    var commentLinksOrigin = this.state.commentLinksOrigin
    var commentEditButtons = this.state.commentEditButtons
    var commentDeleteButtons = this.state.commentDeleteButtons
    var content

    const new_comment = this.state.commentTextsEdit[commentId] || comment
    if (this.state.token) {
      const userName = localStorage.getItem(userConstants.KEY_USER_NAME_DISPLAY)
      const userId = localStorage.getItem(userConstants.KEY_USER_NAME)
      let g = await this.props.updateComment(this.props.notebookId, userId, userName, this.state.token, new_comment, commentId);
      if (g) {
        await this.getDetail(userConstants.RECORD_STATUS);
        this.adjustCommentStyle('noEdit', commentId)
        this.setState({ comments: this.props.notebookDetail.comments })
      } else {
        this.setState({ open_modal: true })
      }
    } else {
      this.setState({ open_modal: true })
    }

    commentEditButtons[commentId] = ''
    this.setState({ commentEditButtons: commentEditButtons })
    content = new_comment.replace(/\n/g, '<br>') + '<span class="editedComment" color="grey">  (Edited)</span>'
    commentTexts[commentId] = <Markup content={content}></Markup>
    this.setState({ commentTexts: commentTexts })
    commentDeleteButtons[commentId] = ''
    this.setState({ commentDeleteButtons: commentDeleteButtons })
    commentLinks[commentId] = commentLinksOrigin[commentId]
    this.setState({ commentLinks: commentLinks })
    commentTextsEdit[commentId] = new_comment
    this.setState({ commentTextsEdit: commentTextsEdit })
  }

  async removeComment(commentId) {
    var commentTexts = this.state.commentTexts
    var commentTextsEdit = this.state.commentTextsEdit
    var commentLinks = this.state.commentLinks
    var commentEditButtons = this.state.commentEditButtons
    var commentDeleteButtons = this.state.commentDeleteButtons
    if (this.state.token) {
      const userName = localStorage.getItem(userConstants.KEY_USER_NAME_DISPLAY)
      const userId = localStorage.getItem(userConstants.KEY_USER_NAME)
      let g = await this.props.deleteComment(this.props.notebookId, userId, userName, this.state.token, commentId);
      if (g) {
        await this.getDetail(userConstants.RECORD_STATUS);
        this.adjustCommentStyle('noEdit', commentId)
        this.setState({ comments: this.props.notebookDetail.comments })
      } else {
        this.setState({ open_modal: true })
      }
    } else {
      this.setState({ open_modal: true })
    }

    delete commentEditButtons[commentId]
    this.setState({ commentEditButtons: commentEditButtons })
    delete commentDeleteButtons[commentId]
    this.setState({ commentDeleteButtons: commentDeleteButtons })
    delete commentTexts[commentId]
    this.setState({ commentTexts: commentTexts })
    delete commentTextsEdit[commentId]
    this.setState({ commentTextsEdit: commentTextsEdit })
    delete commentLinks[commentId]
    this.setState({ commentLinks: commentLinks })
  }

  adjustCommentStyle(adjustType, commentId) {
    var footerElementId = 'commentFooter' + commentId
    var textElementId = 'commentText' + commentId
    if (adjustType === 'Edit') {
      document.getElementById(footerElementId).style.height = '70px'
      document.getElementById(textElementId).style.margin = '12px 30px 10px 40px'
    } else {
      document.getElementById(footerElementId).style.height = '0px'
      document.getElementById(textElementId).style.margin = '12px 30px 30px 40px'
    }
  }

  getUserInfo() {
    const token = localStorage.getItem(userConstants.KEY_ACCESS_TOKEN)
    const userName = localStorage.getItem(userConstants.KEY_USER_NAME_DISPLAY)
    const userId = localStorage.getItem(userConstants.KEY_USER_NAME)
    if (token !== undefined && token !== null) {
      this.setState({ token: token })
    }
    if (userId !== undefined && userId !== null) {
      this.setState({ userId: userId })
    }
    if (userName !== undefined && userName !== null) {
      this.setState({ userName: userName })
    }
  }

  async getDetail(recordStatus) {
    const userName = this.state.userName
    const userId = this.state.userId
    await this.props.getNotebookDetail(this.props.notebookId, recordStatus, userId, userName)
  }

  async componentDidMount() {
    await this.getUserInfo()

    const old_action = localStorage.getItem('old_action')
    var old_action_data = ''
    var comment = ''
    var commentId = ''
    if (old_action && old_action.includes('comment')) {
      if (localStorage.getItem('old_action_data')) {
        old_action_data = JSON.parse(localStorage.getItem('old_action_data'))
        comment = old_action_data.comment
        commentId = old_action_data.commentId
      }
      if (old_action === 'publish_comment') {
        await this.props.publishComment(this.props.notebookId, this.state.userId, this.state.userName, this.state.token, comment)
      } else if (old_action === 'update_comment') {
        await this.props.updateComment(this.props.notebookId, this.state.userId, this.state.userName, this.state.token, comment, commentId)
      } else if (old_action === 'delete_comment') {
        await this.props.deleteComment(this.props.notebookId, this.state.userId, this.state.userName, this.state.token, commentId)
      }
      localStorage.removeItem('old_action')
      localStorage.removeItem('old_action_data')
      this.setState({ scrollBottom: true })
    }

    document.body.classList.add("background-white");
    const userName = this.state.userName
    const userId = this.state.userId

    await this.props.getNotebookDetail(this.props.notebookId, is_preview ? userConstants.RECORD_STATUS_PREVIEW : userConstants.RECORD_STATUS, userId, userName)
    const notebookDetail = this.props.notebookDetail;

    await this.props.getNotebookMD(notebookDetail.path, userId, userName)
    const basepath = process.env.REACT_APP_KH_API_URL + "files?filePath=" + path.dirname(notebookDetail.path)
    var markdown
    if (this.props.notebookMD) {
      markdown = this.props.notebookMD.replace(/^!\[(.+?)\]\(((?!.*http).+?)\)$/mg, "![$1](" + basepath + "/$2)")
      markdown = markdown.replace(/<img src=('|")((?!.*http).+?)('|")(.*?)>/g, "<img src='" + basepath + "/$2' $4 />")
      markdown = markdown.replace(/<style/g, "<style type='text/css'")
    }

    let header = { headers: { "userId": userId } };

    if (is_change) {
      document.getElementById('root').style.background = 'var(--white-color)'
      await axios.get(process.env.REACT_APP_KH_API_URL + `tags`, header)
        .then(response => {
          let obj_tags = [];
          response.data.data.forEach((k) => {
            obj_tags.push({ 'value': k, 'label': k, isDisabled: false })
          })
          this.setState({ notebook_tags: obj_tags })
        })

      await axios.get(process.env.REACT_APP_KH_API_URL + `authors`, header)
        .then(response => {
          this.setState({ available_authors: response.data.data })
        })
      this.setState({ authorNames: this.props.notebookDetail.authors })
      this.setState({ authorIds: this.props.notebookDetail.authorIds })
      this.setState({ input_tags: this.props.notebookDetail.tags })
      this.setState({ subTitle: this.props.notebookDetail.subTitle || '' })
      this.setState({ title: this.props.notebookDetail.existOne ? this.props.notebookDetail.title : '' })
      if (this.state.authorNames) {
        var author_index = this.state.authorNames.indexOf(userName)
        if (author_index !== -1) {
          var otherAuthors = this.state.authorNames
          delete otherAuthors[author_index]
          this.setState({ otherAuthors: otherAuthors })
        }
      }
    }

    const notebookDeleteButton =
      <Form.Field className='deleteNotebook removeNotebook' control={Button} onClick={this.clickNotebookDelete.bind(this)}>Remove Post</Form.Field>

    this.setState({ notebookDeleteButton: notebookDeleteButton })
    this.setState({ markdown: markdown })
    this.setState({ notebook_details: this.props.notebookDetail })
    this.setState({ comments: this.props.notebookDetail.comments })

    document.body.classList.add('back-white');
    let elements1 = document.getElementsByClassName('app');
    elements1[0].classList.add('back-white');
    let footer = document.getElementsByTagName('footer')
    footer[0].style.marginTop = 0
    document.title = `Knowledge Hub - ${this.props.notebookDetail.title}`

    if (this.state.scrollBottom) {
      window.scrollTo(0, document.body.scrollHeight);
    }
  }

  componentWillUmount() {
    document.body.classList.remove('back-white');
    let elements = document.getElementsByClassName('app');
    elements[0].classList.remove('back-white');
    let footer = document.getElementsByTagName('footer')
    footer[0].style.marginTop = '56px';
  }

  setDisplayCode(displayCode) {
    this.setState({ displayCode: displayCode })
  }

  visibleCode(index) {
    var displayCode = this.state.displayCode
    if (displayCode[index] === 'hide') {
      displayCode[index] = 'show'
    } else {
      displayCode[index] = 'hide'
    }
    this.setState({ displayCode: displayCode })
  }

  visibleAllCode() {
    let displayCode = {}
    var key
    if (this.state.displayAllCode) {
      for (key in this.state.displayCode) {
        displayCode[key] = 'hide'
      }
      this.setState({ displayAllCode: false })
    } else {
      for (key in this.state.displayCode) {
        displayCode[key] = 'show'
      }
      this.setState({ displayAllCode: true })
    }
    this.setState({ displayCode: displayCode })
  }

  handleEditPost() {
    const href = window.location.href.replace('detail', 'edit')
    window.location.assign(href)
  }

  setHistoryState = (selected_tag) => {
    localStorage.setItem('selected_tag', selected_tag)
    window.location.assign(`${process.env.REACT_APP_KH_HOST}`)
  }

  render() {
    const { open_modal } = this.state
    const { markdown } = this.state
    const { comments } = this.state
    const { commentTexts } = this.state
    const { commentLinks } = this.state
    const { displayCode } = this.state
    const notebookDetail = this.props.notebookDetail
    const userId = localStorage.getItem(userConstants.KEY_USER_NAME)
    var commentId
    var commentHtml
    var hide_code_button = ''
    var scroll_buttons = ''
    var edit_post_block = ''

    function renderHtml(markdown) {
      var htmls = []
      var lines = ''
      const md_type = 0
      const html_type = 1
      const python_type = 2
      const html_start = 3
      const html_end = 4
      const python_start = 5
      const python_end = 6

      var last_flag = 999
      var new_flag = ''
      var code_flag = ''
      var skip_flag = ''
      var end_tag = ''
      var start_tag = ''
      var temp_end_tag = ''
      var temp_start_tag = ''
      var regex_end_tag = ''
      var regex_start_tag = ''

      if (markdown) {
        markdown += '\n'
        markdown.split('\n').forEach(function (line) {
          var line_eval = line.replace(/^\s+/, '')
          if (line_eval.match(/^```python/)) {
            code_flag = python_start
            new_flag = python_type
          } else if ((last_flag === python_type) && (line_eval.match(/^```$/))) {
            code_flag = python_end
            new_flag = python_type
          } else if (code_flag !== python_start) {
            if ((end_tag.match(/(script|div)/) !== undefined) && (line_eval.match(/^IPython/))) {
              skip_flag = true
            } else {
              skip_flag = false
            }
            if ((isHtml(line) || (last_flag === html_start)) && (line_eval.match(/<(?!.*\s[0-9]+\s).+?[^/]>/))) {
              regex_end_tag = new RegExp(end_tag)
              regex_start_tag = new RegExp(start_tag)
              if ((last_flag === html_start) && (line_eval.match(regex_end_tag) && (!line_eval.match(regex_start_tag)))) {
                new_flag = html_end
                end_tag = ''
              } else if (last_flag !== html_start) {
                temp_start_tag = line.match(/<.*?>/)[0].split(' ')[0].replace(/>/, '')
                temp_end_tag = temp_start_tag.replace(/</, '</')
                regex_end_tag = new RegExp(temp_end_tag)
                if (line.match(/\/\*?$/)) {
                  new_flag = html_start
                  end_tag = '</script'
                  start_tag = '<script'
                } else if (line_eval.match(regex_end_tag)) {
                  new_flag = html_type
                  end_tag = ''
                } else {
                  new_flag = html_start
                  end_tag = temp_end_tag
                  start_tag = temp_start_tag
                }
              }
            } else if ((last_flag !== html_start) && (isHtml(line_eval) && (line_eval.match(/^<.*?\/>/)))) {
              new_flag = html_type
            } else if (last_flag === html_start) {
              new_flag = html_start
            } else {
              new_flag = md_type
            }
          }

          if (!skip_flag) {
            if (new_flag === html_end) {
              lines = lines + '\n' + line
            } else if (last_flag !== new_flag) {
              if (last_flag === 999) {
                last_flag = new_flag
              }
              if (last_flag >= 1) {
                if (last_flag === python_type) {
                  htmls.push({ content: lines, content_type: 'python' })
                } else {
                  htmls.push({ content: lines, content_type: 'html' })
                }
              } else {
                htmls.push({ content: lines, content_type: 'markdown' })
              }
              lines = line
            } else {
              lines = lines + '\n' + line
            }
            last_flag = new_flag
          }
        })
        if (last_flag >= 1) {
          htmls.push({ content: lines, content_type: 'html' })
        } else {
          htmls.push({ content: lines, content_type: 'markdown' })
        }
      }
      return htmls;
    }

    let authors = notebookDetail.authors;
    const createTime = moment(notebookDetail.createTime).format("MMM DD, YYYY")
    const updateTime = moment(notebookDetail.updateTime).format("MMM DD, YYYY")
    const viewCount = notebookDetail.viewCount;
    const htmls = renderHtml(markdown)
    let preview_text = ''

    let comment_block, tags_block, right_side, right_button, class_name, modal = '',
      default_short_description = 'Here is the short description',
      default_title = 'Here is your title'

    if (is_change) {
      authors = [localStorage.getItem(userConstants.KEY_USER_NAME_DISPLAY)]
      preview_text = <Header style={{ textAlign: 'left' }} as='h3' className='txt-c-gray'>Post Preview</Header>
      let def_tags
      if (this.state.input_tags) {
        def_tags = this.state.input_tags.map((tag, index) => {
          return (
            { value: tag, label: tag, isDisabled: false }
          )
        })
      }

      let def_authors = this.state.otherAuthors.map((author, index) => {
        return (
          { value: author, label: author, isDisabled: false }
        )
      })
      let authors_option = [];
      let as = this.state.available_authors;
      // eslint-disable-next-line array-callback-return
      Object.keys(as).map(function (key, index) {
        authors_option.push({ 'value': key, 'label': as[key], isDisabled: false })
      });
      let displayed_name = localStorage.getItem(userConstants.KEY_USER_NAME_DISPLAY) || '';

      /*otherAuthors.map((author, index) => {
        this.handleChangeSelectA(author)
      })*/

      if (is_preview) {
        right_button = (
          <div className='right_button'>
            <Form.Group style={{ marginTop: '32px' }} widths='equal'>
              <Form.Field control={Button} onClick={this.handlePreviewSubmit.bind(this)} color='green'>{notebookDetail.existOne ? 'Update' : 'Publish'}</Form.Field>
              <Form.Field className='txt-c-gray' onClick={() => window.close('', '_parent', '')} control={Button}>Discard</Form.Field>
            </Form.Group>
          </div>
        )
      } else {
        right_button = (
          <div className='right_button'>
            <Form.Group className='updateMetadata' style={{ marginTop: '32px' }} widths='equal'>
              <Form.Field className='updateNotebookButton' control={Button} onClick={this.handlePreviewSubmit.bind(this)} color='green'>Update</Form.Field>
            </Form.Group>
            <Form.Group className='updateMetadata' widths='equal'>
              {this.state.notebookDeleteButton}
            </Form.Group>
          </div>
        )
      }

      right_side = (
        <Form className='padding_of_fixed_header'>
          <Header as='h3' className='txt-c-gray'>Metadata Settings</Header>
          <Header as='h5'>
            Author: {displayed_name}
            <Header.Subheader className='txt-c-gray'>If you have multiple authors, separate them by comma.</Header.Subheader>
          </Header>
          <div id="preview_page_authors_div">
            <Select
              id="preview_page_author_select"
              value={def_authors}
              options={authors_option}
              name='authorNames'
              onChange={this.handleChangeSelectA}
              isMulti
              placeholder='Add the contributors...'
            />
          </div>
          <Form.Field onChange={this.handleChangeTitle} value={this.state.title} className='notebook_title' control={Input} label='Title' placeholder='Title' />
          <Header className='tags_title' as='h5'>Tags</Header>
          <CreatableSelect
            value={def_tags}
            name='input_tags'
            onChange={this.handleChangeSelectT}
            isMulti
            options={this.state.notebook_tags}
            placeholder='Add a tag...'
          />
          <Form.Field
            name='subTitle'
            onChange={this.handleChangeD}
            className='short_desc_title'
            control={TextArea}
            value={this.state.subTitle}
            label='Short Description'
            placeholder='Short Description...' />

          {right_button}
        </Form>
      )
      class_name = 'preview_page'
    } else {
      if (this.state.showAllCode) {
        hide_code_button = <div className='hideAllCode scroll-button hide' onClick={this.visibleAllCode.bind(this)}><ScrollButtons title='Show-code' /></div>
      } else {
        hide_code_button = <div className='hideAllCode scroll-button show' onClick={this.visibleAllCode.bind(this)}><ScrollButtons title='Show-code' /></div>
      }
      let dl_path = process.env.REACT_APP_KH_API_URL + "files?filePath=" + this.props.notebookDetail.notebookFilePath
      scroll_buttons = (
        <div className='scrollButtons'>
          <a className='download scroll-button' href={dl_path}>
            <ScrollButtons title='Download' />
          </a>
          {hide_code_button}
          <div className='scroll-button'><ScrollButtons title='Go-top' /></div>
        </div>
      )

      if (notebookDetail.authorIds && userId === notebookDetail.authorIds[0]) {
        edit_post_block = <div className="edit_post" onClick={this.handleEditPost.bind(this)}>
          <img src={process.env.PUBLIC_URL + '/edit_post.svg'} alt='' />
          <label>Edit Post</label>
        </div>
      }

      modal = (
        <Modal open={open_modal} onClose={this.close_modal} basic size='small'>
          <Header icon='sign in' content='Sorry, only authorized users can comment the note.' />
          <Modal.Actions>
            <Button basic color='red' onClick={this.close_modal} inverted>
              <Icon name='remove' /> Cancel
            </Button>
            <Button color='green' onClick={this.redirect_to_login} inverted>
              <Icon name='checkmark' /> Login
            </Button>
          </Modal.Actions>
        </Modal>
      )

      tags_block = notebookDetail.tags && <div className={`tags small_container`}><Tags setHistoryState={this.setHistoryState} tags={notebookDetail.tags} />{edit_post_block}</div>
      let user_comment_block = ''
      if (localStorage.getItem(userConstants.KEY_USER_NAME)) {
        user_comment_block = (
          <Fragment>
            <UserAvatar disable_name authors={[localStorage.getItem(userConstants.KEY_USER_NAME_DISPLAY)]} />
            <Form>
              <Form.TextArea placeholder='Please leave your message...' onChange={this.setComment.bind(this)} value={this.state.textValue} name='textarea'></Form.TextArea>
              <Button onClick={this.addComment.bind(this)} basic color='green'>
                Post Comment
              </Button>
            </Form>
          </Fragment>
        )
      } else {
        user_comment_block = (
          <Fragment>
            <div className='login_inform'>Please log in first to leave a comment</div>
            <a href={process.env.REACT_APP_LOGIN_API_URL} onClick={this.loginHandle} className="login_btn">
              Login
            </a>
          </Fragment >
        )
      }
      comment_block = (
        <div className='comments_back small_container'>
          <div className='comments' id='comments'>
            <div className='header_title'>Comments</div>
            {comments.length > 0 ? (
              <CardBlock>
                {comments &&
                  comments.map((comment, index) => {
                    //const userId = localStorage.getItem(userConstants.KEY_USER_NAME)
                    commentId = comment.commentId
                    commentHtml = comment.comment
                    if (comment.updateTime !== comment.createTime) {
                      commentHtml += '<span class="editedComment" color="grey">  (edited)</span>'
                    }

                    if (userId === comment.userId) {
                      if (!commentTexts[commentId]) {
                        commentTexts[commentId] = <Markup content={commentHtml}></Markup>
                        this.updateCommentTexts.bind(this, commentTexts)
                        commentLinks[commentId] = <Button basic onClick={this.clickCommentEdit.bind(this, comment.comment, commentId)}>Edit</Button>
                        this.updateCommentLinks.bind(this, commentLinks)
                      }
                      var footerElementId = 'commentFooter' + commentId
                      var textElementId = 'commentText' + commentId
                      return (
                        <div key={index} className='comment'>
                          <div className='commentHeader'>
                            <UserAvatar authors={[comment.userName]} date_info={moment(comment.createTime).format("MMM DD, YYYY")} />
                            {this.state.commentLinks[commentId]}
                          </div>
                          <div className='commentBody'>
                            <div className='commentText' id={textElementId}>
                              {this.state.commentTexts[commentId]}
                            </div>
                            <div className='commentFooter' id={footerElementId}>
                              <div className='commentButton' >{this.state.commentEditButtons[commentId]}</div>
                              <div className='deleteButton' >{this.state.commentDeleteButtons[commentId]}</div>
                            </div>
                          </div>
                        </div>
                      )
                    } else {
                      return (
                        <div key={index} className='comment'>
                          <UserAvatar authors={[comment.userName]} date_info={moment(comment.createTime).format("MMM DD, YYYY")} />
                          <div className='commentText'>
                            <Markup content={commentHtml}></Markup>
                          </div>
                        </div>
                      )
                    }
                  })
                }
              </CardBlock>
            ) : ''}
            <CardBlock class_name='new_comment' >
              <div className='comment-box'>
                {user_comment_block}
              </div>
            </CardBlock>
          </div>
        </div>)
    }

    return (
      <div className={class_name}>
        {modal}
        <div className='detail padding_of_fixed_header' style={is_change ? {} : { display: 'grid' }}>
          <div className='header'>
            {preview_text}
            <div className='title small_container'>{is_change ? default_title : notebookDetail.title}</div>
            <div className='date small_container'>Published on {createTime} · Last updated on {updateTime} · {viewCount} views</div>
            <UserAvatar authors={authors} />
            <div className='sub_title small_container'>{is_change ? default_short_description : notebookDetail.subTitle}</div>
          </div>
          <div className='article'>
            <div className='markdown small_container'>
              {htmls.map && htmls.map((line, index) => {
                let markdown_content = '';
                let id_element = `markdown${index}`;
                let {
                  content,
                  content_type,
                } = line
                if (content_type === 'html') {
                  const container = document.getElementById(id_element);
                  if (container && !container.hasChildNodes()) {
                    container.appendChild(document.createRange().createContextualFragment(content));
                  }
                } else if (content.length > 0) {
                  if ((content_type === 'markdown') || (is_change)) {
                    markdown_content = <ReactMarkdown source={content} renderers={{ code: CodeBlock }} />
                  } else {
                    if (displayCode[index] === undefined) {
                      displayCode[index] = 'show'
                      this.setDisplayCode.bind(this, displayCode)
                    }
                    if (displayCode[index] === 'show') {
                      markdown_content = <div className='show_python'>
                        <div className='hide_code show'>
                          <Button className='hide_button code_button' onClick={this.visibleCode.bind(this, index)}>hide</Button>
                        </div>
                        <ReactMarkdown source={content} renderers={{ code: CodeBlock }} />
                      </div>
                    } else {
                      markdown_content = <div className='hide_python'>
                        <div className='hide_code hide'>
                          <Button className='show_button code_button' onClick={this.visibleCode.bind(this, index)}>show</Button>
                          {'// Code block'}
                        </div>
                      </div>
                    }
                  }
                }
                return (
                  <div key={index} id={id_element}>
                    {markdown_content}
                  </div>
                )
              })}
            </div>
            {tags_block}
          </div>
          {comment_block}
        </div>
        {right_side}
        {scroll_buttons}
      </div>
    )
  }
}