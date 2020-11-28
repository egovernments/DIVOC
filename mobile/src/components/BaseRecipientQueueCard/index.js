import {BaseCard} from "../../Base/Base";
import {Card} from "react-bootstrap";
import BackBtnImg from "../../assets/img/back-btn.svg";
import React from "react";
import "./index.scss"
import * as PropTypes from "prop-types";

export const BaseRecipientQueueCard = ({title, children}) => (
    <BaseCard>
        <Card.Header className="d-flex justify-content-between">
            <img src={BackBtnImg} alt={""}/>
            <span>{title}</span>
            <span/>
        </Card.Header>
        <Card.Body>
            {children}
        </Card.Body>
    </BaseCard>
);

BaseRecipientQueueCard.propTypes = {
    title: PropTypes.string,
    children: PropTypes.element.isRequired
};