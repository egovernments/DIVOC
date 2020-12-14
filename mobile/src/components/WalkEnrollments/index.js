import React, {useState} from "react";
import {Redirect} from "react-router";
import {BaseFormCard} from "../BaseFormCard";
import "./index.scss"
import {Button, Card, FormGroup} from "react-bootstrap";
import {useWalkInEnrollment, WALK_IN_ROUTE, WalkInEnrollmentProvider} from "./context";
import Form from "react-bootstrap/Form";
import Row from "react-bootstrap/Row";
import PropTypes from 'prop-types';
import Col from "react-bootstrap/Col";
import {BaseCard} from "../../Base/Base";
import tempIcon from "assets/img/vaccination-active-status.svg"

export const FORM_WALK_IN_ENROLL_FORM = "form";
export const FORM_WALK_IN_ENROLL_PAYMENTS = "payments";

const nationality = ["Indian", "Chinese", "Sri Lanka"]

export function WalkEnrollmentFlow(props) {
    return (
        <WalkInEnrollmentProvider>
            <WalkInEnrollmentRouteCheck pageName={props.match.params.pageName}/>
        </WalkInEnrollmentProvider>
    );
}

function WalkInEnrollmentRouteCheck({pageName}) {
    const {state} = useWalkInEnrollment();
    switch (pageName) {
        case FORM_WALK_IN_ENROLL_FORM :
            return <WalkEnrollment/>;
        case FORM_WALK_IN_ENROLL_PAYMENTS : {
            if (state.name) {
                return <WalkEnrollmentPayment/>
            }
            break;
        }
        default:
    }
    return <Redirect
        to={{
            pathname: '/' + WALK_IN_ROUTE + '/' + FORM_WALK_IN_ENROLL_FORM
        }}
    />
}


function WalkEnrollment(props) {
    const {state, goNext} = useWalkInEnrollment()
    const [userDetails, setUserDetails] = useState(state);

    const onInputChanged = function (formType, value) {
        userDetails[formType] = value
        setUserDetails(userDetails)
    }
    return (
        <div className="new-enroll-container">
            <BaseFormCard title={"Enroll Recipient"}>
                <div className="pt-3 form-wrapper">
                    <Form>
                        <Form.Group controlId="formBasicName">
                            <Form.Label>Name</Form.Label>
                            <Form.Control
                                type="text"
                                placeholder="Name"
                                value={userDetails.name}
                                onChange={(e) => {
                                    onInputChanged("name", e.target.value)
                                }}
                            />
                        </Form.Group>

                        <Form.Group controlId="fromGender">
                            <Form.Label>Select Gender</Form.Label>
                            <Form.Control as="select" value={userDetails.gender} onChange={(e) => {
                                onInputChanged("gender", e.target.value)
                            }}>
                                <option>Male</option>
                                <option>Female</option>
                            </Form.Control>
                        </Form.Group>

                        <Form.Group controlId="fromNationality">
                            <Form.Label>Select Nationality</Form.Label>
                            <Form.Control as="select" value={userDetails.nationalId} onChange={(e) => {
                                onInputChanged("nationalId", e.target.value)
                            }}>
                                {
                                    nationality.map(
                                        (item, index) => <option>{item}</option>)
                                }
                            </Form.Control>
                        </Form.Group>

                        <FormGroup>
                            <Form.Label>Date of Birth</Form.Label>
                            <Form.Control type="date" placeholder="MMM/DD/YYYY"
                                          value={userDetails.dob}
                                          onChange={(e) => {
                                              onInputChanged("dob", e.target.value)
                                          }}/>
                        </FormGroup>

                        <Form.Group controlId="formBasicEmail">
                            <Form.Label>Email</Form.Label>
                            <Form.Control type="email"
                                          placeholder="Enter email"
                                          value={userDetails.email}
                                          onChange={(e) => {
                                              onInputChanged("email", e.target.value)
                                          }}
                            />
                        </Form.Group>

                        <FormGroup>
                            <Form.Label>Mobile</Form.Label>
                            <Form.Control type="text"
                                          value={userDetails.phone}
                                          placeholder="+91-XXXXXXXXX"
                                          onChange={(e) => {
                                              onInputChanged("phone", e.target.value)
                                          }}
                            />
                        </FormGroup>
                    </Form>
                    <Button variant="primary" type="submit" onClick={() => {
                        goNext(FORM_WALK_IN_ENROLL_FORM, FORM_WALK_IN_ENROLL_PAYMENTS, userDetails)
                    }}>Done</Button>
                </div>

            </BaseFormCard>
        </div>
    );
}

const paymentMode = [
    {
        name: "Government",
        logo: tempIcon
    },
    {
        name: "Voucher",
        logo: tempIcon
    },
    {
        name: "Direct",
        logo: tempIcon
    }

]

function WalkEnrollmentPayment(props) {

    const {goNext, saveWalkInEnrollment} = useWalkInEnrollment()
    const [selectPaymentMode, setSelectPaymentMode] = useState()
    return (
        <div className="new-enroll-container">
            <BaseFormCard title={"Payment Mode"}>
                <div className="content">
                    <h3 className="mt-5">
                        Please select mode of payment
                    </h3>
                    <Row className="mt-5 d-flex flex-row justify-content-between">
                        {
                            paymentMode.map((item, index) => {
                                return <PaymentItem title={item.name} logo={item.logo} onClick={(value) => {
                                    setSelectPaymentMode(value)
                                }}/>
                            })
                        }
                    </Row>
                    <Button className="mt-5"
                            onClick={() => {
                                saveWalkInEnrollment(selectPaymentMode)
                                    .then(() => {
                                        goNext(FORM_WALK_IN_ENROLL_PAYMENTS, "/", {})
                                    })
                            }}>Send for vaccination</Button>
                </div>
            </BaseFormCard>
        </div>
    );
}


PaymentItem.propTypes = {
    title: PropTypes.string.isRequired,
    logo: PropTypes.object.isRequired,
    onClick: PropTypes.func
};

function PaymentItem(props) {
    return (
        <div onClick={() => {
            if (props.onClick) {
                props.onClick(props.title)
            }
        }}>
            <BaseCard>
                <Col className="payment-container">
                    <img src={props.logo} alt={""}/>
                    <h6>{props.title}</h6>
                </Col>
            </BaseCard>
        </div>
    );
}
