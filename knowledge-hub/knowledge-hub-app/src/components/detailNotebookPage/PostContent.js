import React, { Component } from 'react';
import ReactMarkdown from 'react-markdown'
import CodeBlock from './code-block.js'
import UserAvatar from '../UserInfoBlocks/UserAvatar';
import moment from "moment";
import path from 'path';
import { userConstants } from '../../constants/userConstants';

class PostContent extends Component {
    constructor() {
        super();
        this.state = { markdown: '' };
    }

    async getDetail() {
        await this.props.getNotebookDetail(this.props.notebookId, userConstants.RECORD_STATUS_PREVIEW, localStorage.getItem(userConstants.KEY_USER_NAME), localStorage.getItem(userConstants.KEY_USER_NAME_DISPLAY))
    }

    async componentDidMount() {
        await this.getDetail();
        const notebookDetail = this.props.notebookDetail;

        const userId = localStorage.getItem(userConstants.KEY_USER_NAME)
        const userName = localStorage.getItem(userConstants.KEY_USER_NAME_DISPLAY)
        await this.props.getNotebookMD(notebookDetail.path, userId, userName)
        const basepath = process.env.REACT_APP_KH_API_URL + "files?filePath=" + path.dirname(notebookDetail.path)
        var markdown = this.props.notebookMD.replace(/!\[(.*?)\]\((.*?)\)/g, "![$1](" + basepath + "/$2)")
        markdown = markdown.replace(/<img src='(.*?)'>/g, "<img src='" + basepath + "/$1'/>")
        markdown = markdown.replace(/<style/g, "<style type='text/css'")

        this.setState({ markdown: markdown })
    }

    render() {
        const { markdown } = this.state;

        function isHtml(line) {
            if (line.match(/<.*?>/)) {
                return true
            } else {
                return false
            }
        }

        function renderHtml(markdown) {
            var htmls = []
            var lines = ''
            const md_type = 0
            const html_type = 1
            const html_start = 2
            const html_end = 3

            var last_flag = 999
            var new_flag = ''
            var end_tag = ''
            var temp_end_tag = ''
            var regex = ''
            if (markdown) {
                markdown += '\n'
                markdown.split('\n').forEach(function (line) {

                    if (line.match(/<.*?[^/]>/)) {
                        regex = new RegExp(end_tag)
                        if ((last_flag === html_start) && (line.match(regex))) {
                            new_flag = html_end
                            end_tag = ''
                        } else if (last_flag !== html_start) {
                            temp_end_tag = line.match(/<.*?>/)[0].split(' ')[0].replace(/</, '</')
                            regex = new RegExp(temp_end_tag)
                            if (line.match(regex)) {
                                new_flag = html_type
                                end_tag = ''
                            } else {
                                new_flag = html_start
                                end_tag = temp_end_tag
                            }
                        }
                    } else if (line.match(/<.*?\/>/)) {
                        new_flag = html_type
                    } else if (last_flag === html_start) {
                        new_flag = html_start
                    } else {
                        new_flag = md_type
                    }

                    if (new_flag === html_end) {
                        lines = lines + '\n' + line
                    } else if (last_flag !== new_flag) {
                        htmls.push(lines)
                        lines = line
                    } else {
                        lines = lines + '\n' + line
                    }
                    last_flag = new_flag
                })
                htmls.push(lines)
            }
            return htmls;
        }

        const htmls = renderHtml(markdown)
        const createTime = moment(this.props.notebookDetail.createTime).format("MMM DD, YYYY")
        const updateTime = moment(this.props.notebookDetail.createTime).format("MMM DD, YYYY [at] h:mm")


        return (
            <React.Fragment>
                <div className='header'>
                    <div className='title small_container'>{this.props.notebookDetail.title}</div>
                    <div className='sub_title small_container'>{this.props.notebookDetail.subTitle}</div>
                    <div className='date small_container'>Published on {createTime} · Last update on {updateTime}</div>
                    <UserAvatar authors={this.props.notebookDetail.authors} />
                </div>
                <div className='article'>
                    <div className='markdown small_container'>
                        {htmls && htmls.map((line, index) => {
                            let markdown_content;
                            let id_element = `markdown${index}`;
                            if (isHtml(line)) {
                                const container = document.getElementById(id_element);
                                if (container) {
                                    container.appendChild(document.createRange().createContextualFragment(line));
                                }
                            } else {
                                markdown_content = <ReactMarkdown source={line} renderers={{ code: CodeBlock }} />
                            }
                            return (
                                <div key={index} id={id_element}>
                                    {markdown_content}
                                </div>
                            )
                        })}
                    </div>
                </div>
            </React.Fragment>
        );
    }
}

export default PostContent;