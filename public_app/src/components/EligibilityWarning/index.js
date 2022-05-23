import React from "react";
import {Alert} from "react-bootstrap";

export const EligibilityWarning = ({programEligibility}) => {

    function isCommorbidityAvailable(program) {
        return "comorbidities" in program && program["comorbidities"].length > 0;
    }

    function isMinAgeAvailable(program) {
        return "minAge" in program;
    }

    function isMaxAgeAvailable(program) {
        return "maxAge" in program;
    }

    function getProgramWiseMessage() {
        let message = "";
        programEligibility.forEach(program => {
            let str = "";
            str += ` For ${program.programName}, you can register beneficiary who`;
            if (isCommorbidityAvailable(program)) {
                str += " have comorbidity";
                if (isMinAgeAvailable(program) || isMaxAgeAvailable(program)) {
                    str += " or";
                } else {
                    str += "."
                }
            }
            if (isMinAgeAvailable(program) && isMaxAgeAvailable(program)) {
                str += ` aged between ${program["minAge"]} and ${program["maxAge"]}.`
            } else {
                if (isMinAgeAvailable(program)) {
                    str += ` aged ${program["minAge"]} and above.`;
                }
                if (isMaxAgeAvailable(program)) {
                    str += ` aged ${program["maxAge"]} and below. `;
                }
            }
            message += str;
        });
        return message;
    }

    return (
        <Alert variant="warning">
            <b>Eligibility:</b>
            {getProgramWiseMessage()}
        </Alert>
    )
};