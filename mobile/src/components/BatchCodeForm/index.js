import React, {useState} from "react";
import "./index.scss";
import {Form} from "react-bootstrap";
import SampleSignatureImg from "../../assets/img/sample-signature.png";
import Button from "react-bootstrap/Button";
import {CONSTANT} from "../../utils/constants";
import {BaseFormCard} from "../BaseFormCard";
import {ACTION_PATIENT_COMPLETED, useConfirmVaccine} from "../../ConfirmVaccination";

export const BatchCodeForm = () => {
    const {markPatientComplete, goNext} = useConfirmVaccine();
    const [batchCode, setBatchCode] = useState()

    function onActionBtnClick() {
        markPatientComplete(batchCode).then((value) => {
            goNext(ACTION_PATIENT_COMPLETED, `/queue`,{});
        })
    }

    function onBatchCodeChange(e) {
        setBatchCode(e.target.value)
    }


    return (
        <div className="enter-batch-wrapper">
            <Form.Group>
                <Form.Label className="d-block text-center">Enter Batch ID</Form.Label>
                <Form.Control type="text" placeholder="BATCHNO12345566" onChange={onBatchCodeChange}/>
            </Form.Group>

            <Button variant="outline-primary" className="action-btn" onClick={onActionBtnClick}>{
                "CONFIRM"
            }</Button>
        </div>
    );
}
