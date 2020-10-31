import React from 'react';
import DropDown from '../DropDown/DropDown';
import {STATE_NAMES} from '../../constants';
import styles from './Report.module.css';

function Report() {
    return(
        <div className={styles['dropdown-row']}>  
            <div className={'dropdown'}>
                <span>Select State</span>
                <DropDown dropdownList={STATE_NAMES} placeHolder="Select State"/>  
            </div>
            <div className={'dropdown'}>
                <span>Select City</span>
                <DropDown dropdownList={STATE_NAMES} placeHolder="Select City"/>
            </div> 
        </div>
    );
}

export default Report;