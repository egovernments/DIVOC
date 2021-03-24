import React, {useState} from "react";
import {BaseFormCard} from "../BaseFormCard";
import {getMessageComponent, LANGUAGE_KEYS} from "../../lang/LocaleContext";
import "./index.css";
import {CustomButton} from "../CustomButton";
import {useWalkInEnrollment} from "../WalkEnrollments/context";
import {FORM_WALK_IN_ENROLL_FORM, FORM_WALK_IN_VERIFY_OTP} from "../WalkEnrollments/context";
import OtpInput from "react-otp-input";

export const VerifyOTP = () => {
    const [otp, setOTP] = useState("");
    const [errors, setErrors] = useState({});
    const {goNext} = useWalkInEnrollment();

    function onVerifyOTP() {
        if (otp === "123456") {
            goNext(FORM_WALK_IN_VERIFY_OTP, FORM_WALK_IN_ENROLL_FORM, {})
        } else {
            setErrors({otp: "Invalid OTP"})
        }
    }

    return (
        <div className="new-enroll-container">
            <BaseFormCard title={getMessageComponent(LANGUAGE_KEYS.ENROLLMENT_TITLE)}>
                <div className="verify-mobile-container">
                    <h5>Enter OTP</h5>
                    <OtpInput
                        value={otp}
                        onChange={(data) => {
                            setErrors({})
                            setOTP(data)
                        }}
                        numInputs={6}
                        containerStyle="justify-content-around mt-5 mb-3"
                        inputStyle={`otp-input ${"otp" in errors ? "otp-error" : ""}`}
                        separator={""}
                        isInputSecure={true}
                        isInputNum={true}
                        shouldAutoFocus={true}
                        // hasErrored={true}
                    />
                    <div className="invalid-input m-0 text-left">
                        {errors.otp}
                    </div>
                    <CustomButton className="primary-btn w-100" onClick={onVerifyOTP}>VERIFY</CustomButton>
                </div>
            </BaseFormCard>
        </div>
    )
};