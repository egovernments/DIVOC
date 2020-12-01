import {FORM_AADHAR_NUMBER, FORM_PRE_ENROLL_DETAILS, usePreEnrollment} from "../../Home/Forms/PreEnrollmentFlow";
import React, {useEffect, useState} from "react";
import {Button, Col, Row} from "react-bootstrap";
import {FormCard} from "../../Base/Base";
import "./index.scss"
import * as PropTypes from "prop-types";

export function PreEnrollmentDetails(props) {
    const {goBack} = usePreEnrollment()
    return (
        <FormCard onBack={() => {
            goBack();
        }} content={<PatientDetails/>} title={"Verify Recipient"}/>
    );
}

PatientInfo.propTypes = {patientDetails: PropTypes.func};

export function PatientInfo(props) {
    return <div className={"patient-info"}>
        <h5>{props.patientDetails.name}</h5>
        <h5>{props.patientDetails.gender}</h5>
        <h5>{props.patientDetails.dob}</h5>
    </div>;
}

function PatientDetails(props) {
    const {state, goNext, getUserDetails} = usePreEnrollment()
    const [patientDetails, setPatientDetails] = useState()
    useEffect(() => {
        getUserDetails(state.enrollCode)
            .then((patient) => {
                setPatientDetails(patient)
            })
    }, state.enrollCode)
    if (!patientDetails) {
        return <div className={"no-details"}>No Patient Details Found</div>
    }
    return (
        <div className={"pre-enrollment-details"}>
            <h4>Confirm recipient details</h4>
            <PatientInfo patientDetails={patientDetails}/>

            <Col className={"register-with-aadhar"}>
                <h4>Register with Aadhar</h4>
                <div>
                    <Button onClick={() => {
                        goNext(FORM_PRE_ENROLL_DETAILS, FORM_AADHAR_NUMBER, patientDetails)
                    }}>Enter Manually</Button>
                </div>
                <div>
                    <Button onClick={() => {
                        goNext(FORM_PRE_ENROLL_DETAILS, FORM_AADHAR_NUMBER, patientDetails)
                    }}>Scan with Aadhar</Button>
                </div>
            </Col>
        </div>
    );
}
