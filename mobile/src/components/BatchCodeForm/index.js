import React, {useState} from "react";
import "./index.scss";
import {Form} from "react-bootstrap";
import SampleSignatureImg from "../../assets/img/sample-signature.png";

export const BatchCodeForm = () => {
    const [vaccinatorIdx, setVaccinatorIdx] = useState(-1);
    return(
        <div className="enter-batch-wrapper">
            <Form.Group>
                <Form.Label className="d-block text-center">Enter Batch ID</Form.Label>
                <Form.Control type="text" placeholder="BATCHNO12345566" />
            </Form.Group>
        </div>
    );
}