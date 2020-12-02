import {
    FORM_AADHAR_NUMBER,
    FORM_PRE_ENROLL_CODE,
    FORM_PRE_ENROLL_DETAILS,
    usePreEnrollment
} from "../../Home/Forms/PreEnrollmentFlow";
import React, {useEffect, useState} from "react";
import {Button, Col} from "react-bootstrap";
import {FormCard} from "../../Base/Base";
import "./index.scss"
import * as PropTypes from "prop-types";
import {BaseFormCard} from "../BaseFormCard";

export function PreEnrollmentDetails(props) {
    const {goBack} = usePreEnrollment()
    // return (
    //     <FormCard onBack={() => {
    //         goBack();
    //     }} content={<PatientDetails/>} title={"Verify Recipient"}/>
    // );
    return (

        <BaseFormCard title={"Verify Vaccination Recipient"}>
            <PatientDetails/>
        </BaseFormCard>
    )
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
    }, [state.enrollCode])
    if (!patientDetails) {
        return <div className={"no-details"}>No Patient Details Found</div>
    }
    return (
        <div className={"pre-enrollment-details"}>
            <h4>Confirm recipient details</h4>
            <PatientInfo patientDetails={patientDetails}/>

            <Col className="register-with-aadhar">
                <h4>Register with Aadhar</h4>
                <div>
                    <Button variant="outline-primary" className="action-btn mb-3" onClick={() => {
                        goNext(FORM_PRE_ENROLL_DETAILS, FORM_AADHAR_NUMBER, patientDetails)
                    }}>ENTER MANUALLY</Button>
                </div>
                <div>
                    <Button variant="outline-primary" className="action-btn" onClick={() => {
                        goNext(FORM_PRE_ENROLL_DETAILS, FORM_AADHAR_NUMBER, patientDetails)
                    }}>SCAN WITH AADHAR</Button>
                </div>
            </Col>
        </div>
    );
}
