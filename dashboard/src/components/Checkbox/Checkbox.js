import React from 'react';
import styles from './Checkbox.module.css';
function Checkbox({
    title,
    handleCheckboxChange,
    defaultValue,
}) {

    return (
        <div className={styles['checkbox']}>
            <input type="checkbox" onChange={handleCheckboxChange} defaultChecked={defaultValue} />
            <p>{title}</p>
        </div>
    );
}

export default Checkbox;