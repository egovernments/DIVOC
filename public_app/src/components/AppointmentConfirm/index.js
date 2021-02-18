import React, {useEffect, useState} from "react";
import "./index.css";
import ValidImg from "../../assets/img/certificate-valid.svg";
import {useHistory} from "react-router-dom";
import {CustomButton} from "../CustomButton";

export const AppointmentConfirm = (props) => {
    const {enrollment_code} = props.match.params;
    const [appointment, setAppointment] = useState(() => {
        let data = localStorage.getItem(enrollment_code);
        return data ? JSON.parse(data) : {}
    });
    const history = useHistory();
    useEffect(() => {
        if (Object.keys(appointment).length === 0) {
            history.push("/")
        }
    }, [appointment]);
    return (
        <div className="confirm-container">
            <img src={ValidImg} alt={""} className="mb-3"/>
            <h2 className="">Successfully booked appointment for {appointment.programName || "C19"}</h2>
            <h2 className="mt-5 mb-5">Enrolment number: {enrollment_code}</h2>
            <span style={{fontSize: "18px", marginBottom: "1rem"}}>Booking details will be sent to registered mobile number and email.</span>
            <span style={{fontSize: "18px", marginBottom: "1rem"}}>Please carry ID proof used for registration when you go to facility for vaccination.</span>
            <CustomButton className="green-btn" onClick={() => {
                localStorage.removeItem(enrollment_code)
                history.push("/registration")
            }}>Done</CustomButton>
        </div>
    )
};