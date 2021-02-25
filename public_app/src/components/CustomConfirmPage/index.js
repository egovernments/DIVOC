import React from "react";
import "./index.css";
import Button from "react-bootstrap/Button";
import ValidImg from "../../assets/img/certificate-valid.svg";
import {CustomButton} from "../CustomButton";

export const CustomConfirmPage = ({children, onDone}) => {
    return (
        <div className="confirm-container">
            <img src={ValidImg} alt={""} className="mb-3"/>
            {children}
            <CustomButton className="green-btn" onClick={onDone}>Done</CustomButton>
        </div>
    )
}
