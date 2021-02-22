import React from "react";
import "./index.css";

export const CustomButton = ({children, className, ...props}) => {
    return (
        <button className={`custom-button ${className}`} {...props}>{children}</button>
    )
}