import React from 'react';
import styles from './Checkbox.module.css';
class Checkbox extends React.Component {
    constructor(props) {
        super(props);
        this.state = {value:this.props.defaultValue};
        this.toggleCheckBox = this.toggleCheckBox.bind(this);
        this.checkbox = null;
    }

    toggleCheckBox() {
        this.setState({value: !this.state.value});
        this.props.handleCheckboxChange();
    }

    render() {
        return (
            <span className={styles['checkbox']} onClick={this.toggleCheckBox}>
            <input ref={this.checkbox} type="checkbox" checked={this.state.value} onChange={this.toggleCheckBox}/>
            <div className={styles['wrapper']} style={{backgroundColor:this.state.value?this.props.color:''}}>&nbsp;</div>
            <span style={{color: this.props.color}}>{this.props.title}</span>
        </span>
        );
    }
}

export default Checkbox;