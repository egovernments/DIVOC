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
import appConfig from "../../../config.json";
import {EligibilityWarning} from "../../EligibilityWarning";
import {ContextAwareToggle, CustomAccordion} from "../../CustomAccordion";
import {SelectComorbidity, SelectProgram} from "../AddMember";
import {ordinal_suffix_of} from "../../../utils/dateUtils";

const DELETE_MEMBER = "DELETE_MEMBER";
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
                const programs = res.data.map(obj => ({
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
                    <div className="d-flex justify-content-between align-items-center mb-3">
                        <h3>Registered Beneficiaries <span className="font-italic" style={{fontSize: "small"}}>(You can add upto 4 members)</span>
                        </h3>
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
                                    <span>No members have enrolled yet.</span>
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
                />}
            </Container>
        </div>
    );
};

const CancelAppointmentModal = ({showModal, setShowModal, memberAction, member, callDeleteRecipient, callCancelAppointment, selectedAppointmentIndex}) => {
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
        <Modal show={showModal} onHide={() => {
            setShowModal(false)
        }} centered backdrop="static" keyboard={false}>
            <div className="p-3 allotment-wrapper" style={{border: "1px solid #d3d3d3"}}>
                <div className="d-flex justify-content-between align-items-center">
                    <div/>
                    <h5>{memberAction === CANCEL_APPOINTMENT ? "Confirm Cancelling Appointment" : "Confirm Removing Member"}</h5>
                    <img src={CloseImg} className="cursor-pointer" alt={""}
                         onClick={() => {
                             setShowModal(false)
                         }}/>
                </div>
                <div className="d-flex flex-column justify-content-center align-items-center">
                    <b>{member.name}</b>
                    <b className="text-center mt-1">Enrollment number: {member.code}</b>
                    {memberAction === CANCEL_APPOINTMENT &&
                    <>
                                <span
                                    className="mt-1 text-center">{`${member["appointments"][selectedAppointmentIndex].facilityDetails.facilityName}, ${member["appointments"][selectedAppointmentIndex].facilityDetails.district}, \n ${member["appointments"][selectedAppointmentIndex].facilityDetails.state}, ${member["appointments"][selectedAppointmentIndex].facilityDetails.pincode}`}</span>
                        <span
                            className="mt-1">{formatDate(member["appointments"][selectedAppointmentIndex].appointmentDate || "")}, {member["appointments"][selectedAppointmentIndex].appointmentSlot || ""}</span>
                    </>
                    }
                    <CustomButton className="blue-btn" onClick={() => {
                        memberAction === CANCEL_APPOINTMENT ? callCancelAppointment() : callDeleteRecipient()
                    }}>CONFIRM</CustomButton>
                </div>
            </div>
        </Modal>
    )
}

const MemberCard = (props) => {
    const history = useHistory();
    const member = props.member;

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

    function onDeleteRecipientProgram(recipientOsid, programId) {
        props.setIsLoading(true)
        const token = getCookie(CITIZEN_TOKEN_COOKIE_NAME);
        const config = {
            headers: {"Authorization": token, "Content-Type": "application/json"}
        };

        axios.delete(`/divoc/api/citizen/recipient/${recipientOsid}/program/${programId}`, config)
            .then(res => {
                setTimeout(() => {
                    props.fetchRecipients();
                }, 5000)

            })
            .catch((err) => {
            });
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
                        <span className="appointment-title">Program</span>
                        <span className="font-weight-bold">{props.programsById[programId]?.name}</span>
                    </div>
                    <div className="appointment-details">
                        <span className="appointment-title">Enrolment Number</span>
                        <span className="font-weight-bold">{member.code}</span>
                    </div>
                    <div className="appointment-schedule">
                        {
                            programWiseAppointments.map(appointment => (
                                <AppointmentTimeline
                                    registeredDate={formatDate(appointment.osUpdatedAt)}
                                    showDeleteRecipientProgram={canShowDeleteRecipientProgram(appointment)}
                                    onDeleteRecipientProgram={() => {
                                        onDeleteRecipientProgram(member.osid, programId)
                                    }}
                                    showBookAppointment={canShowDeleteRecipientProgram(appointment)}
                                    onBookAppointment={() => {
                                        onBookAppointment(programId, member, appointment.dose)
                                    }}
                                    showCancelAppointment={isAppointmentCancellationAllowed(appointment)}
                                    onCancelAppointment={() => {
                                        props.onCancelAppointment(appointment.index)
                                    }}
                                    isAppointmentScheduled={appointment.enrollmentScopeId !== ""}
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
                                    <span className="appointment-add-program mr-2">+</span><span> New Program</span>
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
    function onDownloadCertificate() {
        const bearerToken = getCookie(CITIZEN_TOKEN_COOKIE_NAME);
        const token = bearerToken.split(" ")[1];
        let certificateURL = "";
        if (window.location.host.split(":")[0] === "localhost") {
            certificateURL = "https://divoc.xiv.in"
        }
        window.open(`${certificateURL}/cert/api/certificate/${certificateId}?authToken=${token}`, '_blank').focus();
    }

    return (
        <div className={`d-flex justify-content-between position-relative ${isAppointmentScheduled && "w-50"}`}>
            {!certified && <span className="appointment-line"/>}
            {!isAppointmentScheduled && dose === "1" && <div className="d-flex flex-column" style={{zIndex: 1}}>
                <img src={CheckImg} className="appointment-active-circle"/>
                <span className="appointment-active-title font-weight-bold">Registered</span>
                <span className="appointment-active-title">{registeredDate}</span>
                {showDeleteRecipientProgram && <CustomButton isLink onClick={onDeleteRecipientProgram}
                                                             className="appointment-link-btn">Delete</CustomButton>}
            </div>}
            {!certified && <div className="d-flex flex-column" style={{zIndex: 1}}>
                {
                    isAppointmentScheduled ? <img src={CheckImg} className="appointment-active-circle"/> :
                        <span className="appointment-inactive-circle"/>
                }
                <span
                    className={`${isAppointmentScheduled ? "appointment-active-title font-weight-bold" : "appointment-inactive-title"}`}>Scheduled ({ordinal_suffix_of(dose)} Dose)</span>
                {isAppointmentScheduled &&
                <span className="appointment-active-title">{formatDate(appointmentDate)} {appointmentSlot}</span>}
                {isAppointmentScheduled && <span
                    className="appointment-active-title">{facilityDetails.facilityName}, {facilityDetails.district}, {facilityDetails.state}, {facilityDetails.pincode}</span>}
                {showBookAppointment &&
                <CustomButton isLink onClick={onBookAppointment} className="appointment-link-btn">Book
                    Appointment</CustomButton>}
                {
                    showCancelAppointment &&
                    <CustomButton isLink onClick={onCancelAppointment} className="appointment-link-btn">Cancel
                        Appointment</CustomButton>
                }
            </div>}
            <div className="d-flex flex-column" style={{zIndex: 1}}>
                {
                    certified ? <img src={CheckImg} className="appointment-active-circle"/> :
                        <span className="appointment-inactive-circle"/>
                }
                <span
                    className={`${certified ? "appointment-active-title font-weight-bold" : "appointment-inactive-title"}`}>Vaccinated</span>
                {
                    certified && <>
                        <span className="appointment-active-title">{formatDate(registeredDate)}</span>
                        <CustomButton isLink onClick={onDownloadCertificate} className="appointment-link-btn">Download
                            Certificate</CustomButton>
                    </>
                }
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