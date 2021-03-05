import React, {useEffect, useState} from "react";
import {useHistory} from "react-router-dom";
import {CustomConfirmPage} from "../CustomConfirmPage";
import {getNameOfTheId, getNationalIdType} from "../../utils/national-id";

export const AppointmentConfirm = (props) => {
    const {state} = props.location;
    const {enrollment_code} = props.match.params;
    const history = useHistory();

    return (
        <CustomConfirmPage onDone={() => {history.push("/registration")}}>
            <h2 className="">Successfully booked appointment for {state.program.name || "Covid 19 program"}</h2>
            <h2 className="mt-5 mb-5">Enrolment number: {enrollment_code}</h2>
            <span style={{fontSize: "18px", marginBottom: "1rem"}}>Appointment details will be sent to the registered mobile number and/or email.</span>
            <span style={{fontSize: "18px", marginBottom: "1rem"}}>On the day of vaccination, please carry your original {getNameOfTheId(getNationalIdType(state.nationalId))} for manual verification</span>
        </CustomConfirmPage>
    )
};
