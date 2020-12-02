import {FormCard} from "../../Base/Base";
import {Button} from "react-bootstrap";
import React, {useState} from "react";
import {FORM_PRE_ENROLL_CODE, FORM_PRE_ENROLL_DETAILS, usePreEnrollment} from "./PreEnrollmentFlow";
import InputGroup from "react-bootstrap/InputGroup";
import Form from "react-bootstrap/Form";
import {PHONE_NUMBER_MAX} from "../../Login/EnterPhoneNumberComponent";
import "./EnterPreEnrollment.scss"
import {BaseFormCard} from "../../components/BaseFormCard";

export function PreEnrollmentCode(props) {
    const {goBack} = usePreEnrollment()
    // return (
    //     <FormCard onBack={() => {
    //         goBack()
    //     }} content={<EnterPreEnrollmentContent/>} title={"Verify Recipient"}/>
    // );
    return (

        <BaseFormCard title={"Verify Recipient"}>
            <EnterPreEnrollmentContent/>
        </BaseFormCard>
    )
}

function EnterPreEnrollmentContent(props) {
    const {state, goNext} = usePreEnrollment()
    const [phoneNumber, setPhoneNumber] = useState(state.mobileNumber)
    const [enrollCode, setEnrollCode] = useState(state.enrollCode)

    const handlePhoneNumberOnChange = (e) => {
        if (e.target.value.length <= PHONE_NUMBER_MAX) {
            setPhoneNumber(e.target.value)
        }
    }

    const handleEnrollCodeOnChange = (e) => {
        if (e.target.value.length <= 5) {
            setEnrollCode(e.target.value)
        }
    }
    return (
        <div className={"enroll-code-container"}>
            <h4 className={"title"}>Enter Pre Enrolment Code</h4>
            <div className={"input-container"}>
                <div className="divOuter">
                    <div className="divInner">
                        <input id="otp" type="text" className="otp" tabIndex="1" maxLength="5"
                               value={enrollCode}
                               onChange={handleEnrollCodeOnChange}
                               placeholder=""/>
                    </div>
                </div>
                <Form className="mobile">
                    <InputGroup>
                        <InputGroup.Prepend>
                            <InputGroup.Text>+91</InputGroup.Text>
                        </InputGroup.Prepend>
                        <Form.Control className="control"
                                      placeholder="9876543210"
                                      value={phoneNumber}
                                      name="mobile"
                                      type="number"
                                      onChange={handlePhoneNumberOnChange}/>
                    </InputGroup>
                </Form>
            </div>
            <Button className={"next"} onClick={() => {
                goNext(FORM_PRE_ENROLL_CODE, FORM_PRE_ENROLL_DETAILS, {
                    mobileNumber: phoneNumber,
                    enrollCode: enrollCode
                })
            }}>Next</Button>
        </div>
    );
}
