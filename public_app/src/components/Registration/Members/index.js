import React, {useEffect, useState} from "react";
import {Col, Container, Row} from "react-bootstrap";
import "./index.css";
import {useHistory} from "react-router-dom";
import {CustomButton} from "../../CustomButton";
import {CITIZEN_TOKEN_COOKIE_NAME, PROGRAM_API, RECIPIENTS_API} from "../../../constants";
import axios from "axios";
import Card from "react-bootstrap/Card";
import {getUserNumberFromRecipientToken} from "../../../utils/reciepientAuth";
import {getCookie} from "../../../utils/cookies";
import Button from "react-bootstrap/Button";
import IconLocation from "../../../assets/img/icon-location.svg"
import IconTime from "../../../assets/img/icon-time.svg"
import {formatDate, padDigit} from "../../../utils/CustomDate";
import {Loader} from "../../Loader";
import {pathOr} from "ramda";

export const Members = () => {
    const history = useHistory();
    const [isLoading, setIsLoading] = useState(false);
    const [members, setMembers] = useState([]);
    const [programs, setPrograms] = useState([]);

    useEffect(() => {
        setIsLoading(true);
        const token = getCookie(CITIZEN_TOKEN_COOKIE_NAME);
        const config = {
            headers: {"recipientToken": token, "Content-Type": "application/json"},
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

        fetchPrograms()
    }, []);

    useEffect(() => {
        if (!getUserNumberFromRecipientToken()) {
            history.push("/citizen")
        }
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

    const MemberCard = (props) => {
        const member = props.member;
        const program = programs.filter(p => p.id === member.programId)[0];
        const appointment = JSON.parse(localStorage.getItem(member.code));

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

        return (
            <div className="col-xl-6 pt-3">
                <Card style={{boxShadow: "0px 6px 20px #C1CFD933", border: "1px solid #F8F8F8"}}>
                    <Card.Body style={{fontSize: "14px"}}>
                        <span className="mb-2"
                              style={{fontWeight: 600, fontSize: "18px", color: "#646D82"}}>{member.name}</span>
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
                            <div className={`d-flex ${appointment ? "justify-content-between" : "justify-content-end"} align-items-center`}>
                                <Row
                                    className={` justify-content-center align-items-center ${appointment ? "d-flex" : "d-none"}`}>
                                    <Col lg={6}>
                                        <img src={IconLocation}/>
                                        <span
                                            className="pl-2 pr-2">{pathOr("", ["facilityName"], appointment)} ,{formatAddress(pathOr({}, ["facilityAddress"], appointment))}</span>
                                    </Col>
                                    <Col lg={6}>
                                        <img src={IconTime}/>
                                        <span
                                            className="pl-2 pr-2">{formatDate(pathOr({}, ["allotmentDate"], appointment))}
                                            <br/>{getTime(pathOr("", ["allotmentTime"], appointment))} - {getTime(pathOr("", ["allotmentTime"], appointment) + 1)}</span>
                                    </Col>
                                </Row>
                                <CustomButton className="blue-btn m-0" onClick={() => {
                                    history.push({
                                        pathname: `/${member.code}/${member.programId}/appointment`,
                                        state: {name: member.name}
                                    })
                                }}>{appointment ? "Edit" : "Book"} <br/>Appointment</CustomButton>
                            </div>
                        }
                    </Card.Body>
                </Card>
            </div>
        )
    };

    return (
        <div className="main-container">
            {isLoading && <Loader/>}
            <Container fluid>
                <div className="members-container">
                    <div style={{display: "flex"}}>
                        <h5>Registered Beneficiaries <span className="font-italic" style={{fontSize: "small"}}>(You can add upto 4 members)</span>
                        </h5>
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
                            members.map(member => {
                                return <MemberCard member={member}/>
                            })

                        }
                    </Row>
                    <Button className="mt-4" variant="link" type="submit" onClick={() => {
                        history.push("/addMember")
                    }}>
                        <b style={{fontSize: "larger"}}>+ Member</b>
                    </Button>
                </div>
            </Container>
        </div>
    );
};
