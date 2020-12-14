import React from "react";
import {Redirect} from "react-router";
import {BaseFormCard} from "../BaseFormCard";
import "./index.scss"
import {Button} from "react-bootstrap";
import {useWalkInEnrollment, WALK_IN_ROUTE, WalkInEnrollmentProvider} from "./context";


export const FORM_WALK_IN_ENROLL_FORM = "form";
export const FORM_WALK_IN_ENROLL_PAYMENTS = "payments";

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
                    <div>
                        Walk Enrollments
                    </div>
                    <Button onClick={() => {
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
