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
import {pathOr} from "ramda";
import appConfig from "../../../config.json";
import {EligibilityWarning} from "../../EligibilityWarning";
import {ContextAwareToggle, CustomAccordion} from "../../CustomAccordion";

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
    const [selectedMemberIndex, setSelectedMemberIndex] = useState(-1);
    const [memberAction, setMemberAction] = useState(CANCEL_APPOINTMENT);
    const [programEligibility, setProgramEligibility] = useState([]);

    function fetchRecipients() {
        setIsLoading(true);
        const token = getCookie(CITIZEN_TOKEN_COOKIE_NAME);
        const config = {
            headers: {"Authorization": token, "Content-Type": "application/json"},
        };
        axios
            .get(RECIPIENTS_API, config)
            .then((res) => {
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
                const programs = res.data.map(obj => ({name: obj.name, id: obj.osid}));
                setPrograms(programs);
                let programsByIds = {};
                programs.forEach(program => {
                    programsByIds[program.id] = program
                });
                debugger
                setProgramsById(programsByIds)
                fetchProgramEligibility(programs)
            })
            .catch(e => {
                console.log("throwened error", e);
            })
    }

    function callCancelAppointment() {
        const member = members[selectedMemberIndex];
        const token = getCookie(CITIZEN_TOKEN_COOKIE_NAME);
        const config = {
            headers: {"Authorization": token, "Content-Type": "application/json"},
            data: {
                enrollmentCode: member.code,
                // TODO: MULTI_PROGRAMS_SUPPORT Hard coded logic, in future (program,dose) needed to delete an appointment
                programId: member["appointments"][0]["programId"],
                dose: member["appointments"][0]["dose"],
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
                            members.concat(members).map((member, index) => {
                                return <MemberCard
                                    key={index}
                                    member={member}
                                    programsById={programsById}
                                    onCancelAppointment={
                                        () => {
                                            setShowModal(true);
                                            setSelectedMemberIndex(index);
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
                                />
                            })

                        }
                    </Row>

                </div>
                {selectedMemberIndex > -1 && members.length > 0 && showModal && <Modal show={showModal} onHide={() => {
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
                            <b>{members[selectedMemberIndex].name}</b>
                            <b className="text-center mt-1">Enrollment number: {members[selectedMemberIndex].code}</b>
                            {memberAction === CANCEL_APPOINTMENT &&
                            <>
                                <span
                                    className="mt-1">{`${members[selectedMemberIndex]["appointments"][0].facilityDetails.facilityName}, ${members[selectedMemberIndex]["appointments"][0].facilityDetails.district}, ${members[selectedMemberIndex]["appointments"][0].facilityDetails.state}, ${members[selectedMemberIndex]["appointments"][0].facilityDetails.pincode}`}</span>
                                <span
                                    className="mt-1">{formatDate(members[selectedMemberIndex]["appointments"][0].appointmentDate || "")}, {members[selectedMemberIndex]["appointments"][0].appointmentSlot || ""}</span>
                            </>
                            }
                            <CustomButton className="blue-btn" onClick={() => {
                                memberAction === CANCEL_APPOINTMENT ? callCancelAppointment() : callDeleteRecipient()
                            }}>CONFIRM</CustomButton>
                        </div>
                    </div>
                </Modal>}
            </Container>
        </div>
    );
};

const MemberCard = (props) => {
    const history = useHistory();
    const member = props.member;

    // Need to think about the logic to support multiple appointment
    const isAppointmentBooked = !!member["appointments"][0].enrollmentScopeId;

    function isAppointmentCancellationAllowed(appointment) {
        const currentDate = new Date();
        const appointmentDate = new Date(appointment.appointmentDate + " " + appointment.appointmentSlot.split("-")[0]);
        const remainingHours = (appointmentDate - currentDate) / 1000 / 60 / 60;
        return remainingHours > 24;
    }

    function getDropdownItems() {
        let items = [
            {
                name: "Remove Member",
                onClick: () => {
                    props.onDeleteMember()
                },
                disabled: isAppointmentBooked,
                tooltip: "You cannot remove a member with an appointment booked."
            }
        ];
        if (isAppointmentBooked) {

            const isAppointmentCancellationAllowed = true;
            items.push({
                name: "Cancel Appointment",
                onClick: () => {
                    props.onCancelAppointment()
                },
                disabled: !isAppointmentCancellationAllowed,
                tooltip: "Cancellation within 24 hours of appointment is not allowed"
            })
        }
        return items;
    }

    function canShowDeleteRecipientProgram(appointment) {
        return !appointment.enrollmentScopeId
    }

    function onBookAppointment(programId, member) {
        history.push({
            pathname: `/${member.code}/${programId}/appointment`,
            state: {
                name: member.name,
                nationalId: member.nationalId,
                identity: member.identity,
                program: "",
                recipientPinCode: member?.address?.pincode
            }
        })
    }

    function getAppointmentDetails() {
        let appointments = {};
        member.appointments.forEach(appointment => {
            if (appointment.programId in appointments) {
                appointments[appointment.programId].push(appointment)
            } else {
                appointments[appointment.programId] = [appointment]
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
                                    }}
                                    showBookAppointment={canShowDeleteRecipientProgram(appointment)}
                                    onBookAppointment={() => {
                                        onBookAppointment(programId, member)
                                    }}
                                    showCancelAppointment={isAppointmentCancellationAllowed(appointment)}
                                    onCancelAppointment={()=>{}}
                                />
                            ))
                        }

                    </div>
                </div>
            )
        })
    }

    return (
        <div className="col-xl-12 pt-3">
            <CustomAccordion>
                <Card className="member-card">
                    <Card.Header className="member-card-header">
                        <ContextAwareToggle eventKey={"" + props.key} title={member.name}/>
                    </Card.Header>
                    <Accordion.Collapse eventKey={"" + props.key}>
                        <Card.Body className="member-card-body">{
                            getAppointmentDetails()
                        }</Card.Body>
                    </Accordion.Collapse>
                </Card>
            </CustomAccordion>
            {/*<Card style={{boxShadow: "0px 6px 20px #C1CFD933", border: "1px solid #F8F8F8", height: "100%"}}>
                <Card.Body style={{fontSize: "14px"}}>
                    <div className="d-flex justify-content-between">
                            <span className="mb-2"
                                  style={{fontWeight: 600, fontSize: "18px", color: "#646D82"}}>{member.name}</span>
                        <CustomDropdown items={getDropdownItems()}/>
                    </div>
                    <div className="d-flex justify-content-between align-items-center">
                        <div className="">
                            <div><span
                                style={{color: "#646D82"}}>Registration Date:</span> {formatDate(member.osCreatedAt)}
                            </div>
                            <div><span style={{color: "#646D82"}}> Enrollment number:</span> {member.code}</div>
                        </div>
                    </div>
                    {
                        <div className={"w-100"}>
                            <Row
                                className={`d-flex ${isAppointmentBooked ? "justify-content-between" : "justify-content-end"} align-items-center`}>
                                <Col lg={isAppointmentBooked ? 12 : 6}
                                     className={`${!isAppointmentBooked && "invisible"}`}>
                                    <span style={{color: "#646D82"}}> Appointment: </span>
                                    <span>{isAppointmentBooked && `${member["appointments"][0].facilityDetails.facilityName}, ${member["appointments"][0].facilityDetails.district}, ${member["appointments"][0].facilityDetails.state}, ${member["appointments"][0].facilityDetails.pincode}`}</span>
                                    <br/>
                                    <span className="invisible"> Appointment: </span>
                                    <span
                                        className="">{formatDate(member["appointments"][0].appointmentDate || "")}, {member["appointments"][0].appointmentSlot || ""}</span>
                                </Col>
                                <Col lg={6} className="d-flex justify-content-end">
                                    <CustomButton className={`blue-btn m-0 ${isAppointmentBooked && "d-none"}`}
                                                  onClick={() => {
                                                      history.push({
                                                          pathname: `/${member.code}/${member["appointments"][0].programId}/appointment`,
                                                          state: {
                                                              name: member.name,
                                                              nationalId: member.nationalId,
                                                              identity: member.identity,
                                                              program: "",
                                                              recipientPinCode: member?.address?.pincode
                                                          }
                                                      })
                                                  }}>{isAppointmentBooked ? "Edit" : "Book"}
                                        <br/>Appointment</CustomButton>
                                </Col>
                            </Row>
                        </div>
                    }
                </Card.Body>
            </Card>*/}
        </div>
    )
};

const AppointmentTimeline = ({
                                 registeredDate, showDeleteRecipientProgram, onDeleteRecipientProgram, showBookAppointment,
                                 onBookAppointment, showCancelAppointment, onCancelAppointment
                             }) => {
    return (
        <div className="d-flex justify-content-between position-relative">
            <span className="appointment-line"/>
            <div className="d-flex flex-column" style={{zIndex: 1}}>
                <span className="appointment-inactive-circle"/>
                <span className="appointment-active-title font-weight-bold">Registered</span>
                <span className="appointment-active-title">{registeredDate}</span>
                {showDeleteRecipientProgram && <CustomButton isLink onClick={onDeleteRecipientProgram}
                                                             className="appointment-link-btn">Delete</CustomButton>}
            </div>
            <div className="d-flex flex-column" style={{zIndex: 1}}>
                <span className="appointment-inactive-circle"/>
                <span className="appointment-inactive-title">Scheduled</span>
                {showBookAppointment &&
                <CustomButton isLink onClick={onBookAppointment} className="appointment-link-btn">Book
                    Appointment</CustomButton>}
            </div>
            <div className="d-flex flex-column" style={{zIndex: 1}}>
                <span className="appointment-inactive-circle"/>
                <span className="appointment-inactive-title">Vaccinated</span>
            </div>
        </div>
    )
}
