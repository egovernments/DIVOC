import React from "react";
import {useHistory} from "react-router-dom";
import {maskPersonalDetails} from "../../../utils/maskPersonalDetails";
import {CustomConfirmPage} from "../../CustomConfirmPage";
import {getNameOfTheId, getNationalIdType} from "../../../utils/national-id";

export const Success = ({ formData, programs}) => {
    const history = useHistory();

    let programName = programs.filter(p => p.osid === formData.programId)[0].name
    return (
        <CustomConfirmPage onDone={() => history.push("/registration")}>
            <h3>Successfully registered for {programName ? programName : ''}</h3>
            <div className="pt-3">
                <h4>Beneficiary Name: {formData.name}</h4>
            </div>
            <div className="pt-3">
                <p>Enrolment details will be sent to <br/>
                    {formData.email ? maskPersonalDetails(formData.email).concat(" and "): ''}
                    {maskPersonalDetails(formData.contact)}</p>
            </div>
            <div className="pt-3">
                <p>On the day of vaccination, please carry your original {getNameOfTheId(getNationalIdType(formData.nationalId))}  for verification</p>
            </div>
        </CustomConfirmPage>
    )
}
