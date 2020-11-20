import React, {useState} from 'react';
import './Base.scss'
import Alert from "react-bootstrap/Alert";

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

export function AlertComponent(props) {
    const [show, setShow] = useState(true);

    if (show) {
        return (
            <Alert variant="danger" onClose={() => setShow(false)} dismissible>
                <Alert.Heading>Oh snap! You got an error!</Alert.Heading>
                <p>{props.message}</p>
            </Alert>
        );
    }
    return <div/>
}
