import {useHistory} from "react-router";
import config from "../../config.js";
import {BaseFormCard} from "../BaseFormCard";
import {getMessageComponent, LANGUAGE_KEYS} from "../../lang/LocaleContext";
import {CustomButton} from "../CustomButton";
import React from "react";
import "./index.css";

export const InvalidEligibilityCriteria = () => {
    const history = useHistory();
    function onContinue() {
        history.push(config.urlPath)
    }

    return (
        <div className="new-enroll-container">
            <BaseFormCard title={getMessageComponent(LANGUAGE_KEYS.ENROLLMENT_TITLE)} onBack={onContinue}>
                <div className="invalid-criteria-container">
                    <label className="text-center">
                        Sorry, the beneficiary is currently not eligible to register for the {localStorage.getItem("program")} program
                    </label>
                    <CustomButton className="primary-btn w-100" onClick={onContinue}>OK</CustomButton>
                </div>
            </BaseFormCard>
        </div>
    )
}
