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
import {formatAppointmentSlot, formatDate} from "../../utils/date_utils";
import {useHistory} from "react-router";
import config from "../../config";
import {FORM_WALK_IN_ENROLL_PAYMENTS, FORM_WALK_IN_VERIFY_FORM} from "../WalkEnrollments/context";
import {BeneficiaryForm} from "../RegisterBeneficiaryForm";
import {useOnlineStatus} from "../../utils/offlineStatus";
import {getSelectedProgram, getSelectedProgramId} from "../ProgramSelection";
import {programDb} from "../../Services/ProgramDB";
import {DosesState} from "../DosesState";

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
            {props.warningMsg &&
                <p className="invalid-input" style={{fontSize:"100%"}}>{props.warningMsg}</p>
            }
            </div>
            <div hidden={props.patientDetailsError}>
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
            </div>
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
    const [warningMsg, setWarningMsg] = useState("");
    const [currentAppointmentSlot, setCurrentAppointmentSlot] = useState({});
    const [showPatientInfo, setShowPatientInfo] = useState(false);
    const [patientDetailsError, setPatientDetailsError] = useState(false);
    const isOnline = useOnlineStatus();
    const history = useHistory();

    useEffect(() => {
        getUserDetails(state.enrollCode, isOnline)
            .then((patient) => {
                appIndexDb.getCurrentAppointmentSlot().then(schedule => {
                    validateAppointment(patient, schedule).then(res=> {
                        setInvalidAppointment(!res);
                        setPatientDetails(patient);
                        setCurrentAppointmentSlot(schedule);
                    })
                })
                .catch((e) => {
                    console.log("error setting user details ", e)
                });
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

    async function validateAppointment(patient, currSch) {
        if (showPatientInfo) {
            return true
        }
        if (!patient) {
            return false
        }

        const selectedProgramId = getSelectedProgramId();

        let currentAppointment = patient["appointments"].filter(a => a["programId"] === selectedProgramId && !a.certified)[0];
        if (!currentAppointment || !currentAppointment.enrollmentScopeId) {
            let vaccine = {};
            let program = await programDb.getProgramByName(getSelectedProgram());
            patient["appointments"]
                .filter(a => a["programId"] === getSelectedProgramId() && a.vaccine)
                .map(a => program.medicines.filter(m => m.name === a.vaccine).map(v => vaccine = v));
            if (!vaccine || Object.keys(vaccine).length === 0) {
                setWarningMsg(<span>No open appointments found for {patient.name} ({state.enrollCode})</span>);
                setPatientDetailsError(true)
                return false
            }

            const lastDoseTaken = patient["appointments"].filter(a => a["programId"] === selectedProgramId && a.certified).length
            const sortedAppointments = patient["appointments"].filter(a => a["programId"] === selectedProgramId && a.certified)
                .sort((a, b) => {
                    if (parseInt(a.dose) > parseInt(b.dose)) return 1;
                    if (parseInt(a.dose) < parseInt(b.dose)) return -1;
                    return 0;
                });
            // check if all doses are been taken
            if (parseInt(sortedAppointments[sortedAppointments.length-1].dose) === vaccine.doseIntervals.length+1) {
                setWarningMsg(<span>{patient.name} ({state.enrollCode}) has already taken {vaccine.doseIntervals.length+1} doses
                    <br/>
                    <span style={{color:"black"}}>{vaccine.name}<DosesState appointments={patient["appointments"]}/></span>
                </span>);
                setPatientDetailsError(true)
                return false
            }

            // check if minimum next vaccine dose date is less than current day
            if (parseInt(((new Date() - new Date(sortedAppointments[sortedAppointments.length-1].appointmentDate))/(1000*60*60*24)).toFixed()) < vaccine.doseIntervals[lastDoseTaken-1].min) {
                let currentDate = new Date();
                setWarningMsg(<span>
                    {patient.name} ({state.enrollCode}) next dose should be taken after {formatDate(new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate()+vaccine.doseIntervals[lastDoseTaken-1].min))}
                    <br/>
                    <span style={{color:"black"}}>{vaccine.name}<DosesState appointments={patient["appointments"]}/></span>
                </span>);
                setPatientDetailsError(true);
                return false
            }
        }

        // check if not already added to queue
        let queue = await appIndexDb.getPatientDetailsFromQueue(state.enrollCode);
        if (queue && queue["appointments"].filter(a => a["programId"] === selectedProgramId && !a.certified).length > 0) {
            setWarningMsg(<span>{patient.name} ({state.enrollCode}) has already added to the queue</span>);
            setPatientDetailsError(true)
            return false
        }

        // check if appointment belong to same facility
        const appointment = patient["appointments"].filter(a => a["programId"] === selectedProgramId && !a.certified)[0]
        let userDetails = await appIndexDb.getUserDetails();
        if (userDetails.facilityDetails.facilityCode !== appointment.enrollmentScopeId) {
            setWarningMsg(<span>{patient.name}'s scheduled appointment: <br/>Not at this facility</span>);
            return false
        }

        // check if appointment belong to current slot
        if (appointment.appointmentSlot !== "" && !(appointment.appointmentDate === new Date().toISOString().slice(0, 10) &&
            appointment.appointmentSlot === currSch.startTime+"-"+currSch.endTime)) {
            setWarningMsg(<span>{patient.name}'s scheduled appointment: <br/>
                    Time: {formatAppointmentSlot(
                    appointment.appointmentDate,
                    appointment.appointmentSlot.split("-")[0],
                    appointment.appointmentSlot.split("-")[1],
                )}</span>);
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
                                warningMsg={warningMsg}
                                patientDetails={patientDetails}
                                patientDetailsError={patientDetailsError}
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
                        />
                    </div>
            }

        </div>
    );
}
