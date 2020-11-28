import React from "react";
import "./index.scss"
import {BaseRecipientQueueCard} from "../components/BaseRecipientQueueCard";
import {Redirect, useHistory} from "react-router";
import {SelectVaccinator} from "../components/SelectVaccinator";
import {CONSTANT} from "../utils/constants";
import Button from "react-bootstrap/Button";

export function ConfirmVaccination(props) {
    const history = useHistory();
    const {pageName, recipient_id} = props.match.params;

    function getForm() {
        switch (pageName) {
            case CONSTANT.SELECT_VACCINATOR:
                return <SelectVaccinator/>;
            case CONSTANT.BATCH_CODE:
                return <span>1</span>;
            default:
                return <Redirect to="/queue"/>
        }
    }

    function onActionBtnClick(){
        switch (pageName) {
            case CONSTANT.SELECT_VACCINATOR:
                return history.push(`/confirm/vaccination/${recipient_id}/${CONSTANT.BATCH_CODE}`);
            case CONSTANT.BATCH_CODE:
                return history.push(`/queue`);
            default:
                return <Redirect to="/queue"/>
        }
    }

    return (
        <div className="confirm-vaccination-container">
            <BaseRecipientQueueCard title={"Confirm Vaccinator and Batch"}>
                <div className="pt-3 form-wrapper">
                    {
                        getForm()
                    }
                </div>
                {

                }
                <Button variant="outline-primary" className="action-btn" onClick={onActionBtnClick}>{
                    pageName === CONSTANT.BATCH_CODE ? "CONFIRM" : "NEXT"
                }</Button>
            </BaseRecipientQueueCard>
        </div>
    );
}


