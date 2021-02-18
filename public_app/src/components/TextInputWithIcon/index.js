import React from "react";
import NextArrowImg from "../../assets/img/next-arrow.svg";
import "./index.css";

export const TextInputWithIcon = ({title, value, onChange, img}) => {
    return (
        <div className="text-input-container">
            <span>{title}</span>
            <div className="custom-input-wrapper">
                <input placeholder={title} value={value} onChange={evt => onChange(evt.target.value)}/>
                <img src={img} alt={""}/>
            </div>
        </div>
    )
}