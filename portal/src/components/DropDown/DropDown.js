import React from 'react';
import Dropdown from 'react-dropdown';
import 'react-dropdown/style.css';
import styles from './DropDown.module.css';


function DropDown({setSelectedOption, placeholder, options, selectedOption}) {

    const handleChange = (selectedItemFromDropdown) => {
        setSelectedOption(selectedItemFromDropdown.value)
    };
    return (
        <div className="drop-down-wrapper m-3">
            <Dropdown
                value={selectedOption}
                options={options}
                onChange={handleChange}
                placeholder={placeholder}
                placeholderClassName={styles['place-holder']}
                menuClassName={styles['menu-items']}
                controlClassName={styles['control-class']}
            />
        </div>
    );
}

export default DropDown;