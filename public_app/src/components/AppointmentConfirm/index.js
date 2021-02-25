import React, {useEffect, useState} from "react";
import {useHistory} from "react-router-dom";
import {CustomConfirmPage} from "../CustomConfirmPage";

export const AppointmentConfirm = (props) => {
    const {enrollment_code} = props.match.params;
    const [appointment, setAppointment] = useState(() => {
        let data = localStorage.getItem(enrollment_code);
        return data ? JSON.parse(data) : {}
    });
    const history = useHistory();
    useEffect(() => {
        if (Object.keys(appointment).length === 0) {
            // history.push("/")
        }
    }, [appointment]);
    return (
        <CustomConfirmPage onDone={() => {history.push("/registration")}}>
            <h2 className="">Successfully booked appointment for {appointment.programName || "Covid 19 program"}</h2>
            <h2 className="mt-5 mb-5">Enrolment number: {enrollment_code}</h2>
            <span style={{fontSize: "18px", marginBottom: "1rem"}}>Booking details will be sent to registered mobile number and email.</span>
            <span style={{fontSize: "18px", marginBottom: "1rem"}}>Please carry ID proof used for registration when you go to facility for vaccination.</span>
        </CustomConfirmPage>
    )
};
