import React, {useState} from "react";
import "./index.scss";
import {Form} from "react-bootstrap";
import SampleSignatureImg from "../../assets/img/sample-signature.png";
import Button from "react-bootstrap/Button";
import {CONSTANT} from "../../utils/constants";
import {BaseFormCard} from "../BaseFormCard";
import {ACTION_PATIENT_COMPLETED, useConfirmVaccine} from "../../ConfirmVaccination";
import {appIndexDb} from "../../AppDatabase";
import {SyncFacade} from "../../SyncFacade";
import {Loader} from "../../Base/Base";

export const BatchCodeForm = () => {
    const {markPatientComplete, goNext} = useConfirmVaccine();
    const [batchCode, setBatchCode] = useState()
    const [loading, setLoading] = useState(false)

    function onActionBtnClick() {
        if (batchCode) {
            setLoading(true)
            markPatientComplete(batchCode).then((value) => {
                return SyncFacade.push()
            }).then((value => {
                goNext(ACTION_PATIENT_COMPLETED, `/queue`, {});
            })).catch((e) => {
                console.log(e);
                setLoading(false)
            })
        }
    }

    function onBatchCodeChange(e) {
        setBatchCode(e.target.value)
    }

    if (loading) {
        return <Loader/>
    }


    return (
        <div className="enter-batch-wrapper">
            <Form.Group>
                <Form.Label className="d-block text-center">Enter Batch ID</Form.Label>
                <Form.Control type="text" placeholder="XXXXXXXXXXXXX" onChange={onBatchCodeChange}/>
            </Form.Group>

            <Button variant="outline-primary" className="action-btn" onClick={onActionBtnClick}>{
                "CONFIRM"
            }</Button>
        </div>
    );
}
