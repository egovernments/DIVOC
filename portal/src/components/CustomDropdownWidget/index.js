import React from "react";
import DropDown from "../DropDown/DropDown";
import "./index.css";
import SmallCloseImg from "../../assets/img/small-close.svg"


export const CustomDropdownWidget = (props) => {
    const valuesMap = {}
    props.options.enumOptions.forEach((data) => {
        valuesMap[data.value] = data.label;
    });
    const setSelectedOption = (evt) => {
        if (props.multiple) {
            if (!props.value.includes(evt)) {
                props.onChange(props.value.concat(evt))
            } else {
                props.onChange(props.value.filter(v => v !== evt))
            }
        } else {
            props.onChange(evt)
        }
    };

    return (
        <div className="custom-dropdown">
            <DropDown
                selectedOption={props.multiple ? props.value[props.value.length - 1] || "" : props.value}
                options={props.options.enumOptions}
                placeholder={props.label}
                setSelectedOption={setSelectedOption}
            />
            {
                props.multiple && <div className="mt-3">
                    {
                        props.value.map(v => (
                            <span className="mr-3">{valuesMap[v]} <img title="delete" className="pointer-event" style={{cursor: "pointer"}} src={SmallCloseImg}
                                                                       onClick={() => setSelectedOption(v)}/></span>
                        ))
                    }
                </div>
            }
        </div>

    );
};