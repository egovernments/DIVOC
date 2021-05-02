import React from "react";
import {BaseFormCard} from "../BaseFormCard";
import {getMessageComponent, LANGUAGE_KEYS} from "../../lang/LocaleContext";
import "./index.css";
import {CustomButton} from "../CustomButton";
import ValidImg from "../../assets/img/certificate-valid.svg";
import {useHistory} from "react-router";
import config from "../../config";

export const WalkInConfirmation = () => {
    const history = useHistory();

    function onContinue() {
        history.push(config.urlPath)
    }

    return (
        <div className="new-enroll-container">
            <BaseFormCard title={getMessageComponent(LANGUAGE_KEYS.ENROLLMENT_TITLE)} onBack={() => {
            }}>
                <div className="confirm-walkin-container">
                    <img src={ValidImg}/>
                    <h3>Successfully enrolled recipient</h3>
                    <p>
                        Enrolment details will be sent to registered mobile number and email.
                    </p>
                    <CustomButton className="primary-btn w-100" onClick={onContinue}>CONTINUE</CustomButton>
                </div>
            </BaseFormCard>
        </div>
    )
};
