
import React from 'react';
import Dropdown from 'react-dropdown';
import 'react-dropdown/style.css';
import styles from './DropDown.module.css';


function DropDown({ formData, setFormData}) {
    const options = ['C-19 Program'];
    
    const handleChange = (selectedItemFromDropdown) => {
        setFormData({ ...formData, program: selectedItemFromDropdown });
    };
    return(
        <div style={{width: '80%'}}>
            <Dropdown
                options={options}
                onChange={handleChange}
                placeholder='Please select vaccine program'
                // value={options[0]}
                className={styles['dropdown']}
                placeholderClassName={styles['place-holder']}
                menuClassName={styles['menu-items']}
                controlClassName={styles['control-class']}
            />
        </div>
    );
}
export default DropDown;