import React from "react";
import DropDown from "../DropDown/DropDown";
import "./index.css";


export const CustomDropdownWidget= (props) => {
    const setSelectedOption = () => {
        props.onChange(props.value)
    }
    return (
        <div className="custom-dropdown">
        <DropDown 
            selectedOption={props.value}
            options={props.options.enumOptions}
            placeholder={props.label}
            setSelectedOption={setSelectedOption}
        />
        </div>
        
    );
};