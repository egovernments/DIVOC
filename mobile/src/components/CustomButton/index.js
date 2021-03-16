import React from "react";
import "./index.css";
import Button from "react-bootstrap/Button";

export const CustomButton = ({children, className, isLink, ...props}) => {
    if (isLink) {
        return (
            <Button id="custom-link-button" className={className ? className : null} variant="link" type="submit" {...props}>
                {children}
            </Button>
        )
    }
    return (
        <button className={`custom-button ${className}`} {...props}>{children}</button>
    )
}
