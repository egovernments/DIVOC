
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
                dropdownList.forEach((state, index) => {
                    let newData = {}
                    newData.id = index;
                    newData.selected = false;
                    newData.key = "projects";
                    newData.name = state
                    data.push(state)
                });
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