import React from 'react';
import './Base.scss'
import Alert from "react-bootstrap/Alert";
import {Button, Card, Col, Row} from "react-bootstrap";
import PropTypes from "prop-types";
import Nav from "react-bootstrap/Nav";
import {Link} from "react-router-dom";
import back from "./back.png"

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
        <Card className={"my-card"}>{children}</Card>
    );
}


BottomItem.propTypes = {
    src: PropTypes.string.isRequired,
    href: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired
};

export function BottomItem({src, href, title}) {
    return <Nav.Item>
        <Link eventKey={title} to={href}>
            <div className={'bottom-item'}>
                <img className={'icon'} src={src} alt={""}/>
                <h6 className={'title'}>{title}</h6>
            </div>
        </Link>
    </Nav.Item>;
}

FormCard.propTypes = {
    title: PropTypes.string.isRequired,
    content: PropTypes.object.isRequired,
    onBack: PropTypes.func.isRequired
};

export function FormCard({title, content, onBack}) {
    return (
        <div className={"form-card"}>
            <BaseCard>
                <Col className={"column"}>
                    <Row className={"appBar"}>
                        <Col xs={1}>
                            <img className={"back"} src={back} onClick={onBack} alt={""}/>
                        </Col>
                        <Col xs={9}>
                            <h5 className={"title"}>{title}</h5>
                        </Col>
                    </Row>
                    <hr className={"line"}/>
                    {content}
                </Col>
            </BaseCard>
        </div>
    );
}

