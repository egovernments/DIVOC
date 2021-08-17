import React, {useEffect, useState} from "react";
import {Accordion, Container, Modal, Row} from "react-bootstrap";
import "./index.css";
import {useHistory} from "react-router-dom";
import {CustomButton} from "../../CustomButton";
import {CITIZEN_TOKEN_COOKIE_NAME, PROGRAM_API, RECIPIENTS_API} from "../../../constants";
import axios from "axios";
import Card from "react-bootstrap/Card";
import {getUserNumberFromRecipientToken} from "../../../utils/reciepientAuth";
import {getCookie} from "../../../utils/cookies";
import {formatDate} from "../../../utils/CustomDate";
import {Loader} from "../../Loader";
import CloseImg from "../../../assets/img/icon-cross.svg";
import CheckImg from "../../../assets/img/check.svg";
import {pathOr} from "ramda";
import appConfig from "../../../config.js";
import {EligibilityWarning} from "../../EligibilityWarning";
import {ContextAwareToggle, CustomAccordion} from "../../CustomAccordion";
import {SelectComorbidity, SelectProgram} from "../AddMember";
import {ordinal_suffix_of} from "../../../utils/dateUtils";
import {CustomModal} from "../../CustomModal";
import {useTranslation} from "react-i18next";

const DELETE_MEMBER = "DELETE_MEMBER";
const DELETE_REGISTERED_PROGRAM = "DELETE_REGISTERED_PROGRAM";
const CANCEL_APPOINTMENT = "CANCEL_APPOINTMENT";
export const Members = () => {
    const history = useHistory();
    const [isLoading, setIsLoading] = useState(false);
    const [members, setMembers] = useState([]);
    const [programs, setPrograms] = useState([]);
    const [programsById, setProgramsById] = useState({});
    // const [marqueeMsg, setMarqueeMsg] = useState("Registrations are open only for citizens 50 years and above.");
    const [showModal, setShowModal] = useState(false);
    const [showProgramModal, setShowProgramModal] = useState(false);
    const [selectedMemberIndex, setSelectedMemberIndex] = useState(-1);
    const [selectedAppointmentIndex, setSelectedAppointmentIndex] = useState("");
    const [memberAction, setMemberAction] = useState(CANCEL_APPOINTMENT);
    const [programEligibility, setProgramEligibility] = useState([]);
    const { t } = useTranslation();

    function fetchRecipients() {
        setIsLoading(true);
        const token = getCookie(CITIZEN_TOKEN_COOKIE_NAME);
        const config = {
            headers: {"Authorization": token, "Content-Type": "application/json"},
        };
        setMembers([])
        axios
            .get(RECIPIENTS_API, config)
            .then((res) => {
                res.data.sort((a, b) => {
                    if (a.code < b.code) {
                        return -1;
                    }
                    if (a.code > b.code) {
                        return 1;
                    }
                    return 0;
                })
                setMembers(res.data);
                setIsLoading(false);
            })
            .catch(e => {
                console.log(e);
            })
    }

    useEffect(() => {
        fetchRecipients();
        fetchPrograms()
    }, []);

    useEffect(() => {
        if (!getUserNumberFromRecipientToken()) {
            history.push("/citizen")
        }
        const data = {
            "entityContext": {},
            "flagKey": "country_specific_features"
        };
        axios
            .post("/config/api/v1/evaluation", data)
            .then((res) => {
                return res.data;
            })
            .catch((err) => {
                console.log(err)
            })
            .then((result) => {
                // if (result["variantAttachment"]) {
                //     setMarqueeMsg(result["variantAttachment"].registrationMaxAgeMessage)
                // }
            })
    }, []);

    function fetchProgramEligibility(programs) {
        let data = {
            "flagKeys": ["programs"],
            entities: []
        };
        programs.forEach(program => {
            data.entities.push({
                "entityContext": {
                    "programId": program.id,
                    "programName": program.name
                }
            })
        });
        axios.post("/config/api/v1/evaluation/batch", data)
            .then(res => {
                const {data} = res;
                let eligibility = [];
                data.evaluationResults.forEach(result => {
                    const {evalContext: {entityContext: {programId, programName}}} = result;
                    if ("variantAttachment" in result) {
                        eligibility.push({
                            ...result["variantAttachment"],
                            programName,
                            programId
                        })
                    }
                });
                setProgramEligibility(eligibility)
            });

    }

    function fetchPrograms() {
        axios.get(PROGRAM_API)
            .then(res => {
                const programs = res.data.filter(p => new Date(p.endDate+ " 00:00") - new Date() > 0).map(obj => ({
                    name: obj.name,
                    id: obj.osid,
                    osid: obj.osid,
                    logoURL: obj.logoURL
                }));
                setPrograms(programs);
                let programsByIds = {};
                programs.forEach(program => {
                    programsByIds[program.id] = program
                });
                setProgramsById(programsByIds)
                fetchProgramEligibility(programs)
            })
            .catch(e => {
                console.log("throwened error", e);
            })
    }

    function onDeleteRecipientProgram(recipientOsid, programId) {
        const member = members[selectedMemberIndex];
        member.appointments.sort((a, b) => {
            if (a.programId < b.programId) {
                return -1;
            }
            if (a.programId > b.programId) {
                return 1;
            }
            return 0;
        });
        const appointment = member.appointments[selectedAppointmentIndex];
        const token = getCookie(CITIZEN_TOKEN_COOKIE_NAME);
        const config = {
            headers: {"Authorization": token, "Content-Type": "application/json"}
        };

        axios.delete(`/divoc/api/citizen/recipient/${member.osid}/program/${appointment.programId}`, config)
            .then(res => {
                setIsLoading(true);
                setTimeout(() => {
                    fetchRecipients();
                    fetchPrograms()
                }, 3000);

            })
            .catch((err) => {
                if (pathOr("", ["response", "data", "message"], err) !== "") {
                    alert(err.response.data.message);
                } else {
                    alert("Something went wrong. Please try again");
                }
            })
            .finally(() => {
                setShowModal(false);
                setSelectedMemberIndex(-1)
                setSelectedAppointmentIndex(-1)
            });
    }


    function callCancelAppointment() {
        const member = members[selectedMemberIndex];
        member.appointments.sort((a, b) => {
            if (a.programId < b.programId) {
                return -1;
            }
            if (a.programId > b.programId) {
                return 1;
            }
            return 0;
        });
        const appointment = member.appointments[selectedAppointmentIndex];
        const token = getCookie(CITIZEN_TOKEN_COOKIE_NAME);
        const config = {
            headers: {"Authorization": token, "Content-Type": "application/json"},
            data: {
                enrollmentCode: member.code,
                programId: appointment["programId"],
                dose: appointment["dose"],
            }
        };

        axios.delete("/divoc/api/citizen/appointment", config)
            .then(res => {
                setIsLoading(true);
                setTimeout(() => {
                    fetchRecipients();
                    fetchPrograms()
                }, 3000);

            })
            .catch((err) => {
                if (pathOr("", ["response", "data", "message"], err) !== "") {
                    alert(err.response.data.message);
                } else {
                    alert("Something went wrong. Please try again");
                }
            })
            .finally(() => {
                setShowModal(false);
                setSelectedMemberIndex(-1)
                setSelectedAppointmentIndex(-1)
            });
    }

    function callDeleteRecipient() {
        const token = getCookie(CITIZEN_TOKEN_COOKIE_NAME);
        const config = {
            headers: {"Authorization": token, "Content-Type": "application/json"},
            data: {
                enrollmentCode: members[selectedMemberIndex].code
            }
        };

        axios.delete("/divoc/api/citizen/recipients", config)
            .then(res => {
                setIsLoading(true);
                setTimeout(() => {
                    fetchRecipients();
                    fetchPrograms()
                }, 3000);

            })
            .catch((err) => {
                if (pathOr("", ["response", "data", "message"], err) !== "") {
                    alert(err.response.data.message);
                } else {
                    alert("Something went wrong. Please try again");
                }
            })
            .finally(() => {
                setShowModal(false);
                setSelectedMemberIndex(-1)
            });
    }

    return (
        <div className="main-container">
            {isLoading && <Loader/>}
            <Container fluid>
                <div className="members-container">
                    {/*<marquee style={{color: ""}}>{marqueeMsg}</marquee>*/}
                    <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap">
                        <div className="d-flex flex-wrap align-items-center">
                            <h3>{t('registration.title')}</h3> <span className="font-italic" style={{fontSize: "small"}}>({t('registration.titleSpan')})</span>
                        </div>
                        {members.length < appConfig.registerMemberLimit &&
                        <CustomButton className="blue-outline-btn" onClick={() => {
                            history.push("/addMember")
                        }}>
                            <span>+ Member</span>
                        </CustomButton>}
                    </div>
                    <EligibilityWarning programEligibility={programEligibility}/>
                    {members.length === 0 &&
                    <div className="container-fluid">
                        <Row>
                            <Card style={{
                                boxShadow: "0px 6px 20px #C1CFD933",
                                border: "1px solid #F8F8F8",
                                height: "100%",
                                width: "100%"
                            }}>
                                <Card.Body className="p-5">
                                    <span>{t('registration.emptyMembers')}</span>
                                </Card.Body>
                            </Card>
                        </Row>
                    </div>
                    }
                    <Row>
                        {
                            members.length > 0 &&
                            members.map((member, index) => {
                                return <MemberCard
                                    className={index === members.length - 1 && "pb-5"}
                                    index={index}
                                    member={member}
                                    programsById={programsById}
                                    onCancelAppointment={
                                        (appointmentIndex) => {
                                            setShowModal(true);
                                            setSelectedMemberIndex(index);
                                            setSelectedAppointmentIndex(appointmentIndex)
                                            setMemberAction(CANCEL_APPOINTMENT)
                                        }
                                    }
                                    onDeleteRegisteredProgram={
                                        (appointmentIndex) => {
                                            setShowModal(true);
                                            setSelectedMemberIndex(index);
                                            setSelectedAppointmentIndex(appointmentIndex)
                                            setMemberAction(DELETE_REGISTERED_PROGRAM)
                                        }
                                    }
                                    onDeleteMember={
                                        () => {
                                            setShowModal(true);
                                            setSelectedMemberIndex(index);
                                            setMemberAction(DELETE_MEMBER)
                                        }
                                    }
                                    fetchRecipients={fetchRecipients}
                                    setIsLoading={setIsLoading}
                                    onRegisterProgram={
                                        (memberIndex) => {
                                            setSelectedMemberIndex(memberIndex)
                                            setShowProgramModal(true)
                                        }
                                    }

                                />
                            })

                        }
                    </Row>

                </div>
                {selectedMemberIndex > -1 && members.length > 0 && showProgramModal && <RegisterProgram
                    showModal={showProgramModal}
                    onHideModal={() => {
                        setShowProgramModal(false);
                        setSelectedMemberIndex(-1);
                    }}
                    programs={programs}
                    member={members[selectedMemberIndex]}
                    fetchRecipients={fetchRecipients}
                    setIsLoading={setIsLoading}
                    programEligibility={programEligibility}
                />}
                {selectedMemberIndex > -1 && members.length > 0 && showModal &&
                <CancelAppointmentModal
                    showModal={showModal}
                    setShowModal={setShowModal}
                    memberAction={memberAction}
                    member={members[selectedMemberIndex]}
                    callCancelAppointment={callCancelAppointment}
                    callDeleteRecipient={callDeleteRecipient}
                    selectedAppointmentIndex={selectedAppointmentIndex}
                    onDeleteRecipientProgram={onDeleteRecipientProgram}
                    programsById={programsById}
                />}
            </Container>
        </div>
    );
};

const CancelAppointmentModal = ({showModal, setShowModal, memberAction, member, callDeleteRecipient,
                                    callCancelAppointment, selectedAppointmentIndex, onDeleteRecipientProgram, programsById}) => {
    const {t} = useTranslation();

    member.appointments.sort((a, b) => {
        if (a.programId < b.programId) {
            return -1;
        }
        if (a.programId > b.programId) {
            return 1;
        }
        return 0;
    })
    return (
        <>
            <CustomModal className="text-capitalize" title={memberAction === CANCEL_APPOINTMENT ? t('registration.cancelAppointment') : t('registration.deleteRegistration')}
                         showModal={true} onClose={() => {
                setShowModal(false)
            }} onPrimaryBtnClick={() => {
                memberAction === CANCEL_APPOINTMENT ? callCancelAppointment() : onDeleteRecipientProgram()
            }} primaryBtnText={memberAction === CANCEL_APPOINTMENT ? t('button.continue') : t('button.yesDelete')}>
                <div className="d-flex flex-column ">
                    {memberAction === DELETE_REGISTERED_PROGRAM && <spam>
                        {t('registration.programDeleteForBeneficiaryInfo', {
                            program: programsById[member["appointments"][selectedAppointmentIndex].programId].name,
                            beneficiaryName: member.name
                        })}
                    </spam>}
                    {memberAction === CANCEL_APPOINTMENT &&
                    <>
                        <span>For {member.name}</span>
                        <span className="mt-1">{t('entity.enrollmentNumber')}: {member.code}</span>
                        <span
                            className="mt-1 ">At {`${member["appointments"][selectedAppointmentIndex].facilityDetails.facilityName}, ${member["appointments"][selectedAppointmentIndex].facilityDetails.district}, \n ${member["appointments"][selectedAppointmentIndex].facilityDetails.state}, ${member["appointments"][selectedAppointmentIndex].facilityDetails.pincode}`}</span>
                        <span
                            className="mt-1">{formatDate(member["appointments"][selectedAppointmentIndex].appointmentDate || "")}, {member["appointments"][selectedAppointmentIndex].appointmentSlot || ""}</span>
                    </>
                    }
                </div>
            </CustomModal>

        </>
    )
}

const MemberCard = (props) => {
    const history = useHistory();
    const member = props.member;
    const { t } = useTranslation();

    function isAppointmentCancellationAllowed(appointment) {
        const currentDate = new Date();
        const appointmentDate = new Date(appointment.appointmentDate + " " + appointment.appointmentSlot.split("-")[0]);
        const remainingHours = (appointmentDate - currentDate) / 1000 / 60 / 60;
        return remainingHours > 24;
    }

    function canShowDeleteRecipientProgram(appointment) {
        return !appointment.enrollmentScopeId
    }

    function onBookAppointment(programId, member, dose) {
        history.push({
            pathname: `/${member.code}/${programId}/appointment`,
            state: {
                name: member.name,
                nationalId: member.nationalId,
                identity: member.identity,
                program: "",
                recipientPinCode: member?.address?.pincode,
                dose
            }
        })
    }

    function getAppointmentDetails() {
        let appointments = {};
        member.appointments.sort((a, b) => {
            if (a.programId < b.programId) {
                return -1;
            }
            if (a.programId > b.programId) {
                return 1;
            }
            return 0;
        })
        member.appointments.forEach((appointment, index) => {
            if (appointment.programId !== "") {
                if (appointment.programId in appointments) {
                    appointments[appointment.programId].push({...appointment, index})
                } else {
                    appointments[appointment.programId] = [{...appointment, index}]
                }
            }
        });
        return Object.keys(appointments).map((programId, index) => {
            const programWiseAppointments = appointments[programId];
            return (
                <div className="appointment-wrapper">
                    <div className="appointment-details">
                        <span className="appointment-title text-capitalize">{t('entity.program')}</span>
                        <span className="font-weight-bold">{props.programsById[programId]?.name}</span>
                    </div>
                    <div className="appointment-details">
                            <span className="appointment-title text-capitalize">{t('entity.enrollmentNumber')}</span>
                        <span className="font-weight-bold">{member.code}</span>
                    </div>
                    <div className="appointment-schedule">
                        {
                            programWiseAppointments.map(appointment => (
                                <AppointmentTimeline
                                    registeredDate={formatDate(appointment.osUpdatedAt)}
                                    showDeleteRecipientProgram={canShowDeleteRecipientProgram(appointment)}
                                    onDeleteRecipientProgram={() => {
                                        props.onDeleteRegisteredProgram(appointment.index)
                                    }}
                                    showBookAppointment={canShowDeleteRecipientProgram(appointment)}
                                    onBookAppointment={() => {
                                        onBookAppointment(programId, member, appointment.dose)
                                    }}
                                    showCancelAppointment={isAppointmentCancellationAllowed(appointment)}
                                    onCancelAppointment={() => {
                                        props.onCancelAppointment(appointment.index)
                                    }}
                                    isAppointmentScheduled={appointment.enrollmentScopeId !== "" || appointment.certified}
                                    appointmentDate={appointment.appointmentDate}
                                    appointmentSlot={appointment.appointmentSlot}
                                    facilityDetails={appointment.facilityDetails}
                                    certified={appointment.certified}
                                    certificateId={appointment.certificateId}
                                    dose={appointment.dose}
                                />
                            ))
                        }

                    </div>
                </div>
            )
        })
    }

    let registeredProgramIds = [];
    member.appointments.forEach(appointment => {
        if (!registeredProgramIds.includes(appointment.programId) && appointment.programId !== "") {
            registeredProgramIds.push(appointment.programId)
        }
    });
    return (
        <div className={`col-xl-12 pt-3 ${props.className}`}>
            <CustomAccordion>
                <Card className="member-card">
                    <Card.Header className="member-card-header">
                        <ContextAwareToggle eventKey={"" + 0} title={member.name} onTitleClick={() => {
                            history.push({
                                pathname: `/member/${member.code}`,
                                state: {
                                    member
                                }
                            })
                        }}/>
                    </Card.Header>
                    <Accordion.Collapse eventKey={"" + 0}>
                        <Card.Body className="member-card-body">
                            {
                                getAppointmentDetails()
                            }
                            {
                                registeredProgramIds.length < Object.keys(props.programsById).length &&
                                <CustomButton CustomButton isLink onClick={() => props.onRegisterProgram(props.index)}
                                              className="appointment-link-btn d-flex align-items-center">
                                    <span className="appointment-add-program mr-2">+</span><span> {t('registration.newProgram')}</span>
                                </CustomButton>
                            }
                        </Card.Body>
                    </Accordion.Collapse>
                </Card>
            </CustomAccordion>
        </div>
    )
};

const AppointmentTimeline = ({
                                 registeredDate, showDeleteRecipientProgram, onDeleteRecipientProgram, showBookAppointment,
                                 onBookAppointment, showCancelAppointment, onCancelAppointment, isAppointmentScheduled,
                                 appointmentDate, appointmentSlot, facilityDetails, certified, certificateId, dose
                             }) => {
    const { t } = useTranslation();

    function onDownloadCertificate() {
        const bearerToken = getCookie(CITIZEN_TOKEN_COOKIE_NAME);
        const token = bearerToken.split(" ")[1];
        let certificateURL = "";
        if (window.location.host.split(":")[0] === "localhost") {
            certificateURL = "https://divoc.xiv.in"
        }
        window.open(`${certificateURL}/certificate/api/certificate/${certificateId}?authToken=${token}`, '_blank').focus();
    }

    return (
        <div className={`appointment-timeline ${isAppointmentScheduled && "w-50"}`}>
            {!certified && <span className={`appointment-line ${isAppointmentScheduled && "appointment-line-mini"}`}/>}
            {!isAppointmentScheduled && dose === "1" && <div className="timeline-node" style={{zIndex: 1}}>
                <img src={CheckImg} className="appointment-active-circle"/>
                <div className="timeline-node-text">
                    <span className="appointment-active-title font-weight-bold">{t('entity.registration')}</span>
                    <span className="appointment-active-title">{registeredDate}</span>
                    {showDeleteRecipientProgram && <CustomButton isLink onClick={onDeleteRecipientProgram}
                                                                 className="appointment-link-btn text-capitalize">{t('registration.delete')}</CustomButton>}
                </div>
            </div>}
            {!certified && <div className="timeline-node" style={{zIndex: 1}}>
                {
                    isAppointmentScheduled ? <img src={CheckImg} className="appointment-active-circle"/> :
                        <span className="appointment-inactive-circle"/>
                }
                <div className="timeline-node-text">
                <span
                    className={`${isAppointmentScheduled ? "appointment-active-title font-weight-bold" : "appointment-inactive-title"} text-capitalize`}>{t('entity.scheduled')} ({ordinal_suffix_of(dose)} {t('entity.dose')})</span>
                    {isAppointmentScheduled &&
                    <span className="appointment-active-title">{formatDate(appointmentDate)} {appointmentSlot}</span>}
                    {isAppointmentScheduled && <span
                        className="appointment-active-title">{facilityDetails.facilityName}, {facilityDetails.district}, {facilityDetails.state}, {facilityDetails.pincode}</span>}
                    {showBookAppointment &&
                    <CustomButton isLink onClick={onBookAppointment} className="appointment-link-btn text-capitalize">{t('registration.bookAppointment')}</CustomButton>}
                    {
                        showCancelAppointment &&
                        <CustomButton isLink onClick={onCancelAppointment} className="appointment-link-btn text-capitalize">{t('registration.cancelAppointment')}</CustomButton>
                    }
                </div>
            </div>}
            <div className="timeline-node" style={{zIndex: 1}}>
                {
                    certified ? <img src={CheckImg} className="appointment-active-circle"/> :
                        <span className="appointment-inactive-circle"/>
                }
                <div className="timeline-node-text">
                <span
                    className={`${certified ? "appointment-active-title font-weight-bold" : "appointment-inactive-title"} text-capitalize d-flex flex-wrap`}>
                    {t('entity.vaccinated')} <span className="ml-1 ml-lg-0"> ({ordinal_suffix_of(dose)} {t('entity.dose')})</span>
                    {certified &&
                    <span className="appointment-active-title font-weight-normal ml-1">{formatDate(registeredDate)}</span>}
                </span>
                    {
                        certified && <>
                            <CustomButton isLink onClick={onDownloadCertificate} className="appointment-link-btn">
                                {t('registration.downloadCertificate')}
                            </CustomButton>
                        </>
                    }
                </div>
            </div>
        </div>
    )
}

const RegisterProgram = ({showModal, onHideModal, member, programs, fetchRecipients, setIsLoading, programEligibility}) => {
    const [currentView, setCurrentView] = useState(0);
    const [formData, setFormData] = useState({
        programId: "",
        programName: "",
        yob: "" + member.yob,
        choice: "yes",
        comorbidities: []

    });

    function registerProgram() {
        setIsLoading(true);
        const token = getCookie(CITIZEN_TOKEN_COOKIE_NAME);
        const config = {
            headers: {"Authorization": token, "Content-Type": "application/json"}
        };
        let data = {
            comorbidities: formData.comorbidities
        }
        axios.post(`/divoc/api/citizen/recipient/${member.osid}/program/${formData.programId}`, data, config)
            .then(res => {
                setIsLoading(true);
                setTimeout(() => {
                    fetchRecipients();
                }, 5000)
            })
            .catch((err) => {
            })
            .finally(() => {
                onHideModal()
            });
    }

    function setValue(evt) {
        setFormData((fd) => {
            return {
                ...fd,
                [evt.target.name]: evt.target.value
            }
        })
    }

    let registeredProgramIds = [];
    member.appointments.forEach(appointment => {
        if (!registeredProgramIds.includes(appointment.programId)) {
            registeredProgramIds.push(appointment.programId)
        }
    });
    let programAvailable = programs.filter(program => !registeredProgramIds.includes(program.osid));
    return (
        <Modal size={"xl"} show={showModal} onHide={onHideModal} centered backdrop="static" keyboard={false}
               className="select-program-modal">
            <div className="position-absolute" style={{right: 20, top: 20}}>
                <img src={CloseImg} className="cursor-pointer" alt={""}
                     onClick={onHideModal}/>
            </div>
            {currentView === 0 && <SelectProgram navigation={{
                previous: onHideModal,
                next: () => {
                    if (formData.programId !== "") {
                        setCurrentView(1)
                    }
                }
            }} formData={formData} setValue={setValue} programs={programAvailable} showBack={false}/>}
            {currentView === 1 &&
            <SelectComorbidity
                navigation={{
                    previous: () => {
                        setCurrentView(0)
                    }, next: () => {
                        registerProgram()
                    }
                }}
                formData={formData}
                setValue={setValue}
                programs={programs}
                hideYOB={true}
            />
            }
        </Modal>
    )
}
