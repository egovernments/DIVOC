import {
    FORM_PRE_ENROLL_DETAILS,
    usePreEnrollment
} from "../../Home/Forms/PreEnrollmentFlow";
import React, {useEffect, useState} from "react";
import {Button, Col} from "react-bootstrap";
import "./index.scss"
import * as PropTypes from "prop-types";
import {BaseFormCard} from "../BaseFormCard";
import {getMessageComponent, LANGUAGE_KEYS} from "../../lang/LocaleContext";
import {appIndexDb} from "../../AppDatabase";
import {EnrolmentItems, VaccinationProgress} from "../../Home/Home";
import {formatAppointmentSlot} from "../../utils/date_utils";
import {useHistory} from "react-router";
import config from "../../config";
import {FORM_WALK_IN_ENROLL_PAYMENTS, FORM_WALK_IN_VERIFY_FORM} from "../WalkEnrollments/context";
import {BeneficiaryForm} from "../RegisterBeneficiaryForm";
import {useOnlineStatus} from "../../utils/offlineStatus";
import {getSelectedProgramId} from "../ProgramSelection";

export function PreEnrollmentDetails(props) {
    return (

        <BaseFormCard title={getMessageComponent(LANGUAGE_KEYS.VERIFY_RECIPIENT)}>
            <PatientDetails/>
        </BaseFormCard>
    )
}

PatientInfo.propTypes = {patientDetails: PropTypes.func};

export function PatientInfo(props) {
    const {state, goNext} = usePreEnrollment()

    const onContinue = (formData) => {
        goNext(FORM_WALK_IN_VERIFY_FORM, FORM_WALK_IN_ENROLL_PAYMENTS, formData)
    };

    return (
        <BaseFormCard title={getMessageComponent(LANGUAGE_KEYS.VERIFY_RECIPIENT)}>
            <BeneficiaryForm verifyDetails={true} state={state} onContinue={onContinue} buttonText={getMessageComponent(LANGUAGE_KEYS.BUTTON_CONTINUE)}/>
        </BaseFormCard>
    )
}

function WarningInfo(props) {
    const [recipientDetails, setRecipientDetails] = useState([]);
    const [currentSlot, setCurrentSlot] = useState("");
    const history = useHistory();
    const appointment = props.patientDetails["appointments"].filter(a => a["programId"] === getSelectedProgramId() && !a.certified)[0]

    useEffect(() => {
        appIndexDb.recipientDetails().then(beneficiary => setRecipientDetails(beneficiary));
        if (props.currentAppointmentSlot && props.currentAppointmentSlot.startTime)
            setCurrentSlot(formatAppointmentSlot(new Date(), props.currentAppointmentSlot.startTime, props.currentAppointmentSlot.endTime))
    }, []);
    return (
        <div className={"home-container"}>
            <div>
            {props.otherFacilityError &&
                <p className="invalid-input" style={{fontSize:"100%"}}>{props.patientDetails.name}'s scheduled appointment: <br/>Not at this facility</p>
            }
            {props.otherSlotError &&
                <p className="invalid-input" style={{fontSize:"100%"}}>{props.patientDetails.name}'s scheduled appointment: <br/>
                    Time: {formatAppointmentSlot(
                        appointment.appointmentDate,
                        appointment.appointmentSlot.split("-")[0],
                        appointment.appointmentSlot.split("-")[1],
                    )}
                </p>
            }
            </div>
            <div className="mt-4">
                <p className="mb-0" style={{ color:"#777777"}}>Current Appointment Slot</p>
                <p>{currentSlot || "N/A"}</p>
            </div>
            {   recipientDetails.length > 0 &&
                <div className="enroll-container mt-4" style={{height:"110px"}}>
                    <EnrolmentItems title={getMessageComponent(LANGUAGE_KEYS.RECIPIENT_QUEUE)}
                                     value={recipientDetails[0].value}
                    />
                    <EnrolmentItems title={getMessageComponent(LANGUAGE_KEYS.CERTIFICATE_ISSUED)}
                                    value={recipientDetails[1].value}
                    />
                </div>
            }
            <div className="register-with-aadhaar">
                <div>
                    <Button hidden={props.patientDetailsError} variant="outline-primary" className="primary-btn w-100 mt-5 mb-2" onClick={() => {
                        props.onContinue()
                    }}>{getMessageComponent(LANGUAGE_KEYS.PRE_ENROLLMENT_CONTINUE)}</Button>
                </div>
                <div>
                    <Button variant="outline-primary" className="action-btn w-100 mt-3" onClick={() => {
                        history.push(config.urlPath + '/')
                    }} style={{textTransform:"uppercase"}}>{getMessageComponent(LANGUAGE_KEYS.HOME)}</Button>
                </div>
            </div>
        </div>
    )
}
function PatientDetails(props) {
    const {state, goNext, getUserDetails} = usePreEnrollment()
    const [patientDetails, setPatientDetails] = useState()
    const [invalidAppointment, setInvalidAppointment] = useState(false);
    const [userDetails, setUserDetails] = useState()
    const [otherFacilityError, setOtherFacilityError] = useState(false);
    const [otherSlotError, setOtherSlotError] = useState(false);
    const [currentAppointmentSlot, setCurrentAppointmentSlot] = useState({});
    const [showPatientInfo, setShowPatientInfo] = useState(false);
    const isOnline = useOnlineStatus();
    const history = useHistory();

    useEffect(() => {
        getUserDetails(state.enrollCode, isOnline)
            .then((patient) => {
                appIndexDb.getUserDetails()
                    .then((userDetails) => {
                        appIndexDb.getCurrentAppointmentSlot().then(schedule => {
                            setCurrentAppointmentSlot(schedule);
                            setInvalidAppointment(!validateAppointment(patient, userDetails, schedule));
                            setPatientDetails(patient);
                            setUserDetails(userDetails);
                        })
                    })
                    .catch((e) => {
                        console.log("error getting facility user details ", e)
                    })
            });
    }, [state.enrollCode]);

    if (!patientDetails) {
        return (
            <div className={"home-container"}>
                {isOnline && <p className="invalid-input" style={{fontSize:"100%"}}>Enrollment number "{state.enrollCode}" not found</p>}
                {!isOnline && <p className="invalid-input" style={{fontSize:"100%"}}>Appointment is not scheduled for current day</p>}
                <div>
                    <Button variant="outline-primary" className="action-btn w-100 mt-3" onClick={() => {
                        history.push(config.urlPath + '/')
                    }} style={{textTransform:"uppercase"}}>{getMessageComponent(LANGUAGE_KEYS.HOME)}</Button>
                </div>
            </div>
        );
    }

    function validateAppointment(patient, userDetails, currSch) {
        if (showPatientInfo) {
            return true
        }
        if (!patient) {
            return false
        }

        // check if appointment belong to same facility
        const selectedProgramId = getSelectedProgramId()
        const appointment = patient["appointments"].filter(a => a["programId"] === selectedProgramId && !a.certified)[0]
        if (userDetails.facilityDetails.facilityCode !== appointment.enrollmentScopeId) {
            setOtherFacilityError(true);
            return false
        }

        // check if appointment belong to current slot
        if (!(appointment.appointmentDate === new Date().toISOString().slice(0, 10) &&
            appointment.appointmentSlot === currSch.startTime+"-"+currSch.endTime)) {
            setOtherSlotError(true);
            return false
        }

        return true;
    }

    function getFormData(patientDetails) {
        return {...patientDetails, state:patientDetails.address.state, district:patientDetails.address.district}
    }

    function onContinue() {
        setShowPatientInfo(true);
        setInvalidAppointment(false);
        goNext(FORM_PRE_ENROLL_DETAILS, FORM_WALK_IN_VERIFY_FORM, patientDetails)
    }
    function onFormContinue() {
        goNext(FORM_WALK_IN_VERIFY_FORM, FORM_WALK_IN_ENROLL_PAYMENTS, patientDetails)
    }
    return (
        <div className={"pre-enrollment-details"}>
            {
                invalidAppointment &&
                        <div>
                            <WarningInfo
                                otherFacilityError={otherFacilityError}
                                otherSlotError={otherSlotError}
                                patientDetails={patientDetails}
                                currentAppointmentSlot={currentAppointmentSlot}
                                onContinue={onContinue}
                            />
                        </div>
            }
            {
                !invalidAppointment &&
                    <div>
                        <BeneficiaryForm
                            verifyDetails={true}
                            showCurrentSlot={true}
                            state={getFormData(patientDetails)}
                            onContinue={onFormContinue}
                            buttonText={getMessageComponent(LANGUAGE_KEYS.BUTTON_CONTINUE)}
                        />;
                    </div>
            }

        </div>
    );
}
