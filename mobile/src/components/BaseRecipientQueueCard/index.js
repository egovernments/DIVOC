import {BaseCard} from "../../Base/Base";
import {Card} from "react-bootstrap";
import BackBtnImg from "../../assets/img/back-btn.svg";
import React from "react";
import "./index.scss"
import * as PropTypes from "prop-types";
import {useHistory} from "react-router";

export const BaseRecipientQueueCard = ({title, children}) => {
    const history = useHistory();
    return (
        <div className="base-queue-card">
            <BaseCard>
                <Card.Header className="d-flex justify-content-between">
                    <img src={BackBtnImg} alt={""} onClick={() => {
                        history.goBack()
                    }}/>
                    <span>{title}</span>
                    <span/>
                </Card.Header>
                <Card.Body>
                    {children}
                </Card.Body>
            </BaseCard>
        </div>
    );
}

BaseRecipientQueueCard.propTypes = {
    title: PropTypes.string,
    children: PropTypes.element.isRequired
};