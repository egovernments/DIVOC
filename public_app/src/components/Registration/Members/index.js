import React, {useEffect, useState} from "react";
import {Col, Container, Modal, Row} from "react-bootstrap";
import "./index.css";
import {useHistory} from "react-router-dom";
import {CustomButton} from "../../CustomButton";
import {CITIZEN_TOKEN_COOKIE_NAME, PROGRAM_API, RECIPIENTS_API} from "../../../constants";
import axios from "axios";
import Card from "react-bootstrap/Card";
import {getUserNumberFromRecipientToken} from "../../../utils/reciepientAuth";
import {getCookie} from "../../../utils/cookies";
import Button from "react-bootstrap/Button";
import {formatDate, padDigit} from "../../../utils/CustomDate";
import {Loader} from "../../Loader";
import {CustomDropdown} from "../../CustomDropdown";
import CloseImg from "../../../assets/img/icon-cross.svg";
import {pathOr} from "ramda";

export const Members = () => {
    const history = useHistory();
    const [isLoading, setIsLoading] = useState(false);
    const [members, setMembers] = useState([]);
    const [programs, setPrograms] = useState([]);
    const [marqueeMsg, setMarqueeMsg] = useState("Registrations are open only for citizens 50 years and above.");
    const [showModal, setShowModal] = useState(false);
    const [selectedMemberIndex, setSelectedMemberIndex] = useState(-1);

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
        }
        axios
            .post("/config/api/v1/evaluation", data)
            .then((res) => {
                return res.data;
            })
            .catch((err) => {
                console.log(err)
            })
            .then((result) => {
                setMarqueeMsg(result["variantAttachment"].registrationMaxAgeMessage)
            })
    }, []);

    function fetchPrograms() {
        const mockPrograms = [
            {
                "description": "Covid 19 program",
                "endDate": "2021-02-24",
                "medicineIds": ["1-b6ebbbe4-b09e-45c8-b7a3-38828092da1a"],
                "name": "Covid-19 program",
                "osCreatedAt": "2021-02-16T06:51:58.271Z",
                "osUpdatedAt": "2021-02-17T07:56:29.012Z",
                "osid": "1-b58ec6ec-c971-455c-ade5-7dce34ea0b09",
                "startDate": "2021-02-01",
                "status": "Active"
            },
            {
                "description": "This is the Phase 3 of the vaccination drive happening in the country. Eligible beneficiaries will have to register themselves on the citizen portal. Based on the enrolment code and the ID proof, beneficiaries will be vaccinated and issued a digital certificate that can be downloaded from the citizen portal.",
                "endDate": "2021-06-30",
                "medicineIds": ["1-b6ebbbe4-b09e-45c8-b7a3-38828092da1a", "1-2a62ae65-1ea5-4a23-946b-062fe5f512f6", "1-9ac9eaf1-82bf-4135-b6ee-a948ae972fd4"],
                "name": "Polio Vaccination",
                "osCreatedAt": "2021-02-16T09:57:37.474Z",
                "osUpdatedAt": "2021-02-17T09:37:23.195Z",
                "osid": "1-7875daad-7ceb-4368-9a4b-7997e3b5b008",
                "startDate": "2021-02-01",
                "status": "Active"
            }
        ];
        axios.get(PROGRAM_API)
            .then(res => {
                if (res.status === 200) {
                    const programs = res.data.map(obj => ({name: obj.name, id: obj.osid}));
                    setPrograms(programs);
                }
                setPrograms([])
            })
            .catch(e => {
                console.log("throwened error", e);
                // mock data setup
                const ps = mockPrograms.map(obj => ({name: obj.name, id: obj.osid}));
                setPrograms(ps)
            })
    }

    function callCancelAppointment(member) {
        const token = getCookie(CITIZEN_TOKEN_COOKIE_NAME);
        const config = {
            headers: {"Authorization": token, "Content-Type": "application/json"},
            data: {
                enrollmentCode: members[selectedMemberIndex].code,
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
                setShowModal(false)
                setSelectedMemberIndex(-1)
            });
    }

    return (
        <div className="main-container">
            {isLoading && <Loader/>}
            <Container fluid>
                <div className="members-container">
                    <marquee style={{color: ""}}>{marqueeMsg}</marquee>
                    <div style={{display: "flex"}}>
                        <h3>Registered Beneficiaries <span className="font-italic" style={{fontSize: "small"}}>(You can add upto 4 members)</span>
                        </h3>
                    </div>
                    {members.length === 0 &&
                    <div>
                        <Row>
                            <Col className="col-sm-4 mt-3">
                                <p>No members have enrolled yet.</p>
                            </Col>
                        </Row>
                    </div>
                    }
                    <Row>
                        {
                            members.length > 0 &&
                            members.map((member, index) => {
                                return <MemberCard member={member} programs={programs} onDelete={() => {
                                    setShowModal(true)
                                    setSelectedMemberIndex(index)
                                }
                                }/>
                            })

                        }
                    </Row>
                    {members.length < 4 && <CustomButton className="mt-4" isLink={true} type="submit" onClick={() => {
                        history.push("/addMember")
                    }}>
                        <span>+ Member</span>
                    </CustomButton>}
                </div>
                {selectedMemberIndex > -1 && members.length > 0 && showModal && <Modal show={showModal} onHide={() => {
                    setShowModal(false)
                }} centered backdrop="static" keyboard={false}>
                    <div className="p-3 allotment-wrapper" style={{border: "1px solid #d3d3d3"}}>
                        <div className="d-flex justify-content-between align-items-center">
                            <div/>
                            <h5>Confirm Cancelling Appointment </h5>
                            <img src={CloseImg} className="cursor-pointer" alt={""}
                                 onClick={() => {
                                     setShowModal(false)
                                 }}/>
                        </div>
                        <div className="d-flex flex-column justify-content-center align-items-center">
                            <b>{members[selectedMemberIndex].name}</b>
                            <b className="text-center mt-1">Enrollment number: {members[selectedMemberIndex].code}</b>
                            <span
                                className="mt-1">{`${members[selectedMemberIndex]["appointments"][0].facilityDetails.facilityName}, ${members[selectedMemberIndex]["appointments"][0].facilityDetails.district}, ${members[selectedMemberIndex]["appointments"][0].facilityDetails.state}, ${members[selectedMemberIndex]["appointments"][0].facilityDetails.pincode}`}</span>
                            <span
                                className="mt-1">{formatDate(members[selectedMemberIndex]["appointments"][0].appointmentDate || "")}, {members[selectedMemberIndex]["appointments"][0].appointmentSlot || ""}</span>
                            <CustomButton className="blue-btn" onClick={() => {
                                callCancelAppointment(members[selectedMemberIndex])
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
    const program = props.programs.filter(p => p.id === member.programId)[0];

    // Need to think about the logic to support multiple appointment
    const isAppointmentBooked = !!member["appointments"][0].enrollmentScopeId;


    function formatAddress({addressLine1, addressLine2, district, state, pincode}) {
        return [district, state, pincode].filter(d => d && ("" + d).trim().length > 0).join(", ")
    }

    function getTime(fromTime) {
        if (fromTime > 11) {
            return padDigit(fromTime > 12 ? fromTime % 12 : fromTime) + ":00 PM"
        } else {
            return fromTime + ":00 AM"
        }
    }

    function showDeleteConfirmation() {
        props.onDelete()
    }

    return (
        <div className="col-xl-6 pt-3">
            <Card style={{boxShadow: "0px 6px 20px #C1CFD933", border: "1px solid #F8F8F8"}}>
                <Card.Body style={{fontSize: "14px"}}>
                    <div className="d-flex justify-content-between">
                            <span className="mb-2"
                                  style={{fontWeight: 600, fontSize: "18px", color: "#646D82"}}>{member.name}</span>
                        {isAppointmentBooked ? <CustomDropdown items={[{
                            name: "Cancel Appointment", onClick: () => {
                                showDeleteConfirmation()
                            }
                        }]}/> : <span/>}
                    </div>
                    <div className="mb-2">
                        {program ? program.name : ''}
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
                                                          state: {name: member.name}
                                                      })
                                                  }}>{isAppointmentBooked ? "Edit" : "Book"}
                                        <br/>Appointment</CustomButton>
                                </Col>
                            </Row>
                        </div>
                    }
                </Card.Body>
            </Card>
        </div>
    )
};
