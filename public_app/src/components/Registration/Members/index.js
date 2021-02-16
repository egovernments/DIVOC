import React, {useEffect, useState} from "react";
import {CardDeck, CardGroup, Col, Container, Row} from "react-bootstrap";
import "./index.css";
import {useHistory} from "react-router-dom";
import {CustomButton} from "../../CustomButton";
import {useKeycloak} from "@react-keycloak/web";
import {RECIPIENT_CLIENT_ID, RECIPIENT_ROLE, SIDE_EFFECTS_DATA} from "../../../constants";
import axios from "axios";
import Card from "react-bootstrap/Card";

export const Members = () => {
    const history = useHistory();
    const {keycloak} = useKeycloak();
    const [formSchema, setFormSchema] = useState({schema:{}, uiSchema: {}});
    const [members, setMembers] = useState([]);

    useEffect(() => {
        const mockMembers = [
            {
                "name": "Rajesh Ravi",
                "enrollmentId": "001304100",
                "programId": "04567851cughbv"
            },
            {
                "name": "Rajesh Ravi",
                "enrollmentId": "001304100",
                "programId": "04567851cughbv"
            }
        ]
        axios
            .get("/divoc/api/v1/registrations")
            .then((res) => {
                if (res.status === '200') {
                    setMembers(res.body)
                } else {
                    setMembers([])
                }
            });
        // setMembers(mockMembers)
    }, []);

    useEffect(() => {
        if (keycloak.authenticated) {
            if (!keycloak.hasResourceRole(RECIPIENT_ROLE, RECIPIENT_CLIENT_ID)) {
                keycloak.logout();
            }
        }
    }, []);
    const onSideEffectsSubmit = async ({formData}, e) => {
        if (Object.keys(formData).length > 0) {
            localStorage.setItem(SIDE_EFFECTS_DATA, JSON.stringify(formData));
            history.push("/feedback/verify")
        } else {
            alert("No symptoms selected")
        }
    };

    const MemberCard = (props) => {
        const member = props.member;
        // TODO: fetch program and get program name
        const program = props.member.programId;
        return (
            <Card style={{ width: '18rem' }}>
                <Card.Body>
                    <Card.Title>{member.name}</Card.Title>
                    <Card.Subtitle>Enrollment number: {member.enrollmentId}</Card.Subtitle>
                    <Card.Text>
                        {program}
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
                    <CustomButton className="green-btn" type="submit" onClick={() => {history.push("/addMember")
                    }}>
                        <span>Add Member</span>
                    </CustomButton>
                </div>
            </Container>
        </div>
    );
};
