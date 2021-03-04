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
            <span style={{fontSize: "18px", marginBottom: "1rem"}}>Appointment details will be sent to the registered mobile number and/or email.</span>
            <span style={{fontSize: "18px", marginBottom: "1rem"}}>On the day of vaccination, please carry your original ``ID Type`` for manual verification</span>
        </CustomConfirmPage>
    )
};
