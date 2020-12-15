import React, {useState} from "react";
import {Redirect} from "react-router";
import {BaseFormCard} from "../BaseFormCard";
import "./index.scss"
import {Button, Card, FormGroup} from "react-bootstrap";
import {useWalkInEnrollment, WALK_IN_ROUTE, WalkInEnrollmentProvider} from "./context";
import Row from "react-bootstrap/Row";
import PropTypes from 'prop-types';
import Col from "react-bootstrap/Col";
import {BaseCard} from "../../Base/Base";
import tempIcon from "assets/img/vaccination-active-status.svg"
import schema from '../../jsonSchema/walk_in_form.json';
import Form from "@rjsf/core/lib/components/Form";

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


    const customFormats = {
        'phone-in': /\(?\d{3}\)?[\s-]?\d{3}[\s-]?\d{4}$/
    };

    const uiSchema = {
        classNames: "form-container",
       /* title: {
            classNames: styles["form-title"],
        },*/
    };
    return (
        <div className="new-enroll-container">
            <BaseFormCard title={"Enroll Recipient"}>
                <div className="pt-3 form-wrapper">
                    <Form
                        schema={schema}
                        customFormats={customFormats}
                        uiSchema={uiSchema}
                        onSubmit={(e) => {
                            console.log(e.formData)
                            goNext(FORM_WALK_IN_ENROLL_FORM, FORM_WALK_IN_ENROLL_PAYMENTS, e.formData)
                        }}
                    />
                </div>

            </BaseFormCard>
        </div>
    );
}

const paymentMode = [
    {
        name: "Government",
        logo: tempIcon
    }
    ,
    {
        name: "Voucher",
        logo: tempIcon
    }
    ,
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
