import React from "react";
import NextArrowImg from "../../assets/img/next-arrow.svg";
import "./index.css";

export const TextInputWithIcon = ({title, value, onChange, img, ...props}) => {
    return (
        <div className="text-input-container">
            {/*<span>{title}</span>*/}
            <div className="custom-input-wrapper">
                <input onKeyDown={(event) => {
                    if(event.key === 'Enter') {
                        props.onClick()
                    }
                }} placeholder={title} value={value} onChange={evt => onChange(evt.target.value)}/>
                <img src={img} alt={""} onClick={props.onClick}/>
            </div>
        </div>
    )
}