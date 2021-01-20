import {
    FORM_AADHAAR_NUMBER,
    FORM_PRE_ENROLL_DETAILS,
    usePreEnrollment
} from "../../Home/Forms/PreEnrollmentFlow";
import React, {useEffect, useState} from "react";
import {Button, Col} from "react-bootstrap";
import "./index.scss"
import * as PropTypes from "prop-types";
import {BaseFormCard} from "../BaseFormCard";
import {getMessageComponent, LANGUAGE_KEYS} from "../../lang/LocaleContext";

export function PreEnrollmentDetails(props) {
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
        getUserDetails(state.enrollCode, state.mobileNumber)
            .then((patient) => {
                setPatientDetails(patient)
            })
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [state.enrollCode])
    if (!patientDetails) {
        return <div className={"no-details"}>No Patient Details Found</div>
    }
    return (
        <div className={"pre-enrollment-details"}>
            <h4>Confirm recipient details</h4>
            <PatientInfo patientDetails={patientDetails}/>

            <Col className="register-with-aadhaar">
                <h4>{getMessageComponent(LANGUAGE_KEYS.REGISTER_IDENTITY_NUMBER)}</h4>
                <div>
                    <Button variant="outline-primary" className="action-btn mb-3" onClick={() => {
                        goNext(FORM_PRE_ENROLL_DETAILS, FORM_AADHAAR_NUMBER, patientDetails)
                    }}>ENTER MANUALLY</Button>
                </div>
                <div>
                    <Button variant="outline-primary" className="action-btn" onClick={() => {
                        goNext(FORM_PRE_ENROLL_DETAILS, FORM_AADHAAR_NUMBER, patientDetails)
                    }}>{getMessageComponent(LANGUAGE_KEYS.SCAN_IDENTITY_NUMBER)}</Button>
                </div>
            </Col>
        </div>
    );
}
