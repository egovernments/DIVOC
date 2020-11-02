
import React, { useState, useEffect } from 'react';
import Dropdown from 'react-dropdown';
import 'react-dropdown/style.css';

function DropDown({ 
        dropdownList, 
        placeHolder,
        setSelectedItem,
    }) {
    const [listOfStates,setListOfStates] = useState([])

    useEffect(() => {
        normalizeStateNames();
    }, [])

    const normalizeStateNames = () => {
        let data = []
        Object.keys(dropdownList).map(state => {
            let newData = {}
            newData.value = state;
            newData.label = dropdownList[state]
            data.push(newData)
        })
        setListOfStates(data)
    }


    const handleChange = (selectedItemFromDropdown) => {
        setSelectedItem(selectedItemFromDropdown.value)
    };

     
    return(
        <div>
            <Dropdown 
                options={listOfStates} 
                onChange={handleChange} 
                placeholder={placeHolder}
                value={listOfStates[listOfStates.length - 1]}
            />
        </div>
    );
}
 
export default DropDown;