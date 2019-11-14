import React, { Component } from 'react';

class CardBlock extends Component {
    render() {
        const style = {
            background: '#FFFFFF',
            boxShadow: '0px 0px 8px #D8DDE3',
            borderRadius: '4px',
            padding: '24px'
        }
        const class_name = this.props.class_name?this.props.class_name+' card_block':'card_block';
        return (
            <div style={style} onClick={this.props.on_click} className={class_name}>
                {this.props.children}
            </div>
        );
    }
}

export default CardBlock;