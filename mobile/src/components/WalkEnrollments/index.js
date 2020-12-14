import React from "react";
import {Redirect} from "react-router";
import {BaseFormCard} from "../BaseFormCard";
import "./index.scss"
import {Button, FormGroup} from "react-bootstrap";
import {useWalkInEnrollment, WALK_IN_ROUTE, WalkInEnrollmentProvider} from "./context";
import Form from "react-bootstrap/Form";


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
    const {goNext} = useWalkInEnrollment()
    return (
        <div className="new-enroll-container">
            <BaseFormCard title={"Enroll Recipient"}>
                <div className="pt-3 form-wrapper">
                    <Form>
                        <Form.Group controlId="formBasicName">
                            <Form.Label>Name</Form.Label>
                            <Form.Control type="text" placeholder="Name"/>
                        </Form.Group>

                        <Form.Group controlId="fromGender">
                            <Form.Label>Select Gender</Form.Label>
                            <Form.Control as="select">
                                <option>Male</option>
                                <option>Female</option>
                            </Form.Control>
                        </Form.Group>

                        <Form.Group controlId="fromNationality">
                            <Form.Label>Select Nationality</Form.Label>
                            <Form.Control as="select">
                                {
                                    nationality.map(
                                        (item, index) => <option>{item}</option>)
                                }
                            </Form.Control>
                        </Form.Group>

                          <FormGroup>
                            <Form.Label>Date of Birth</Form.Label>
                            <Form.Control type="date" placeholder="MMM/DD/YYYY"/>
                        </FormGroup>

                        <Form.Group controlId="formBasicEmail">
                            <Form.Label>Email</Form.Label>
                            <Form.Control type="email" placeholder="Enter email"/>
                        </Form.Group>

                        <FormGroup>
                            <Form.Label>Mobile</Form.Label>
                            <Form.Control type="text" placeholder="+91-XXXXXXXXX"/>
                        </FormGroup>
                    </Form>
                    <Button variant="primary" type="submit" onClick={() => {
                        goNext(FORM_WALK_IN_ENROLL_FORM, FORM_WALK_IN_ENROLL_PAYMENTS, {name: "Random Name"})
                    }}>Done</Button>
                </div>

            </BaseFormCard>
        </div>
    );
}

function WalkEnrollmentPayment(props) {
    const {goNext} = useWalkInEnrollment()
    return (
        <div className="new-enroll-container">
            <BaseFormCard title={"Payment Mode"}>
                <div className="pt-3 form-wrapper">
                    <div>
                        Payment Mode
                    </div>
                    <Button onClick={() => {
                        goNext(FORM_WALK_IN_ENROLL_PAYMENTS, "/", {})
                    }}>Done</Button>
                </div>
            </BaseFormCard>
        </div>
    );
}
