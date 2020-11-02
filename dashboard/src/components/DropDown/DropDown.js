
import React, { useState, useEffect } from 'react';
import Dropdown from 'react-dropdown';
import 'react-dropdown/style.css';

function DropDown({ dropdownList, placeHolder}) {
    const [listOfItems,setStateList] = useState([])

    useEffect(() => {
                normalizeStateNames();
    }, [])

    const normalizeStateNames = () => {
                let data = []
                Object.keys(dropdownList).map(state => {
                    let newData = {}
                    newData.selected = false;
                    newData.key = state;
                    newData.name = dropdownList[state]
                    data.push(dropdownList[state])
                })
                setStateList(data)
    }

    const handleChange = (selectedOption) => {
                console.log("selected state", selectedOption)
    };

    return(
        <div>
            <Dropdown 
                options={listOfItems} 
                onChange={handleChange} 
                placeholder={placeHolder}
            />
        </div>
    );
}
 
export default DropDown;