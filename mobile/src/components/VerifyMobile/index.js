import React, {useState} from "react";
import {BaseFormCard} from "../BaseFormCard";
import {getMessageComponent, LANGUAGE_KEYS} from "../../lang/LocaleContext";
import "./index.css";
import {CustomButton} from "../CustomButton";
import {FORM_WALK_IN_ENROLL_FORM, useWalkInEnrollment} from "../WalkEnrollments/context";
import {FORM_WALK_IN_VERIFY_MOBILE, FORM_WALK_IN_VERIFY_OTP} from "../WalkEnrollments/context";
import {useOnlineStatus} from "../../utils/offlineStatus";

export const VerifyMobile = () => {
    const isOnline = useOnlineStatus();
    const [phone, setPhone] = useState("");
    const [errors, setErrors] = useState({});
    const {goNext} = useWalkInEnrollment();

    function onGetOTP() {
        if (phone.length === 10) {
            goNext(FORM_WALK_IN_VERIFY_MOBILE, FORM_WALK_IN_VERIFY_OTP, {phone})
        } else {
            setErrors({mobile: "Invalid mobile number"})
        }
    }

    function goToForm() {
        goNext(FORM_WALK_IN_VERIFY_OTP, FORM_WALK_IN_ENROLL_FORM, {})
    }

    return (
        <div className="new-enroll-container">
            <BaseFormCard title={getMessageComponent(LANGUAGE_KEYS.ENROLLMENT_TITLE)}>
                <div className="verify-mobile-container">
                    <h5>{isOnline ? 'Verify Mobile' : 'Enter Mobile Number'}</h5>
                    <input className="w-100 mt-5 mb-3 mobile-input" type="tel" value={phone}
                           onChange={(evt) => setPhone(evt.target.value)} autoFocus={true}
                           placeholder="Enter mobile number" maxLength={10}/>
                    <div className="invalid-input m-0 text-left">
                        {errors.mobile}
                    </div>
                    {
                        isOnline ? <CustomButton className="primary-btn w-100" onClick={onGetOTP}>GET OTP</CustomButton> :
                            <CustomButton className="primary-btn w-100" onClick={goToForm}>CONTINUE</CustomButton>
                    }
                </div>
            </BaseFormCard>
        </div>
    )
};