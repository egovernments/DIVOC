import React, {useEffect, useState} from "react";
import {CardDeck, CardGroup, Col, Container, Row} from "react-bootstrap";
import "./index.css";
import {useHistory} from "react-router-dom";
import {CustomButton} from "../../CustomButton";
import {useKeycloak} from "@react-keycloak/web";
import {PROGRAM_API, RECIPIENT_CLIENT_ID, RECIPIENT_ROLE, RECIPIENTS_API, SIDE_EFFECTS_DATA} from "../../../constants";
import axios from "axios";
import Card from "react-bootstrap/Card";

export const Members = () => {
    const history = useHistory();
    const {keycloak} = useKeycloak();
    const [members, setMembers] = useState([]);
    const [programs, setPrograms] = useState([]);

    useEffect(() => {
        const mockMembers = [
            {
                "name": "Rajesh Ravi",
                "code": "001304100",
                "programId": "1-7875daad-7ceb-4368-9a4b-7997e3b5b008"
            },
            {
                "name": "Asha Ravi",
                "code": "001304102",
                "programId": "1-7875daad-7ceb-4368-9a4b-7997e3b5b008"
            }
        ];
        axios
            .get(RECIPIENTS_API)
            .then((res) => {
                if (res.status === '200') {
                    setMembers(res.body)
                } else {
                    setMembers([])
                }
            })
            .catch(e => {
                console.log(e);
                // mock data setup
                setMembers(mockMembers)
            })

        fetchPrograms()
    }, []);

    useEffect(() => {
        if (keycloak.authenticated) {
            if (!keycloak.hasResourceRole(RECIPIENT_ROLE, RECIPIENT_CLIENT_ID)) {
                keycloak.logout();
            }
        }
    }, []);

    function fetchPrograms() {
        const mockPrograms = [
            {
                "description":"Covid 19 program",
                "endDate":"2021-02-24",
                "medicineIds":["1-b6ebbbe4-b09e-45c8-b7a3-38828092da1a"],
                "name":"C-19",
                "osCreatedAt":"2021-02-16T06:51:58.271Z",
                "osUpdatedAt":"2021-02-17T07:56:29.012Z",
                "osid":"1-b58ec6ec-c971-455c-ade5-7dce34ea0b09",
                "startDate":"2021-02-01",
                "status":"Active"
            },
            {
                "description":"This is the Phase 3 of the vaccination drive happening in the country. Eligible beneficiaries will have to register themselves on the citizen portal. Based on the enrolment code and the ID proof, beneficiaries will be vaccinated and issued a digital certificate that can be downloaded from the citizen portal.",
                "endDate":"2021-06-30",
                "medicineIds":["1-b6ebbbe4-b09e-45c8-b7a3-38828092da1a","1-2a62ae65-1ea5-4a23-946b-062fe5f512f6","1-9ac9eaf1-82bf-4135-b6ee-a948ae972fd4"],
                "name":"Polio Vaccination",
                "osCreatedAt":"2021-02-16T09:57:37.474Z",
                "osUpdatedAt":"2021-02-17T09:37:23.195Z",
                "osid":"1-7875daad-7ceb-4368-9a4b-7997e3b5b008",
                "startDate":"2021-02-01",
                "status":"Active"
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
        return (
            <Card style={{ width: '18rem' }}>
                <Card.Body>
                    <Card.Title>{member.name}</Card.Title>
                    <Card.Subtitle>Enrollment number: {member.code}</Card.Subtitle>
                    <Card.Text>
                        {program ? program.name: ''}
                    </Card.Text>
                </Card.Body>
            </Card>
        )
    };

    return (
        <div className="main-container">
            <Container fluid>
                <div className="side-effect-container">
                    <h5>Enrolled Members</h5>
                    <span className="font-italic">(You can add upto 4 members)</span>
                    {members.length === 0 &&
                        <div>
                            <Row>
                                <Col className="col-sm-4">
                                    <p>You have not enrolled any members.</p>
                                    <p>Get Started by adding members to enrol and book them for vaccination.</p>
                                </Col>
                            </Row>
                        </div>
                    }
                    {
                        members.length > 0 &&
                            <CardDeck>
                                {
                                    members.map(member => {
                                        return <MemberCard member={member} />
                                    })
                                }
                            </CardDeck>

                    }
                    <CustomButton className="blue-btn" type="submit" onClick={() => {history.push("/addMember")
                    }}>
                        <span>Add Member</span>
                    </CustomButton>
                </div>
            </Container>
        </div>
    );
};
