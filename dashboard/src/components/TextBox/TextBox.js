import React from 'react';
import styles from './TextBox.module.css';

function TextBox({ number, text, color }) {
    return(
        <div className={styles['details']}>
            <div style={{color: color}} className={styles['numbers']}>{number}</div>
            <div className={styles['texts']}>{text}</div>
        </div>
    );
}

export default TextBox;