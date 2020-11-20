import React, {useState} from 'react';
import './Base.scss'
import Alert from "react-bootstrap/Alert";
import {Card} from "react-bootstrap";

export const DivocHeader = () => {
    return (
        <div className={"header"}>
            <p>Header</p>
        </div>
    );
};


export const DivocFooter = () => {
    return (
        <div className={"footer"}>
            <p>Terms and Condition</p>
        </div>
    );
};

export const Loader = () => {
    return (
        <div className={"loader"}>
            Loading..
        </div>
    );
};


export function AppLogo(props) {
    return (
        <div className={"logo-container"}>
            <h1>
                <span className={"first"}>LO</span>
                <span className={"second"}>GO</span>
            </h1>
        </div>
    );
}

export function ErrorAlert({message, onClose}) {

    if (message) {
        return (
            <Alert variant="danger" onClose={onClose} dismissible>
                <p>{message}</p>
            </Alert>
        );
    }
    return <div/>
}


export function BaseCard({children}) {
    return (
        <Card>
            <div>{children}</div>
        </Card>
    );
}

