import "../Home.scss"
import "./index.scss"
import React, {useEffect, useState} from "react";
import {appIndexDb} from "../../AppDatabase";
import {getMessageComponent, LANGUAGE_KEYS} from "../../lang/LocaleContext";
import {formatDate} from "../../utils/date_utils";
import {Title} from "../Home";

export const AppointmentDetails = (morningSchedule, afterNoonSchedule, booked, completed, open, ...props) => {
    const [appointmentScheduleData, setAppointmentScheduleData] = useState({});

    useEffect(() => {
        appIndexDb.getFacilitySchedule()
            .then((scheduleResponse) => setAppointmentScheduleData(scheduleResponse));
    }, [])
    morningSchedule = "09.00 AM TO 01:00 PM"
    afterNoonSchedule = "02.00 PM TO 05.00 PM"
    open = 1
    completed = 10
    booked = 1

    const dimGrayColor = {color:"#696969"};
    const onGoingLabel = <div className="appointment-card pl-3 pr-3 ml-2" style={dimGrayColor}>Ongoing</div>

    const statusBanner = (booked, completed, open) => {
        return <div className="d-flex appointment-card justify-content-around">
            <div className="text-center title">
                    <h5>{booked}</h5>
                    <h5 className="mb-3">Booked</h5>
            </div>
            <div className="text-center title">
                    <h5>{completed}</h5>
                    <h5 className="mb3">Completed</h5>
            </div>
            <div className="text-center title" style={dimGrayColor}>
                    <h5>{open}</h5>
                    <h5 className="mb-3">Open</h5>
            </div>
        </div>
    }
    const scheduleLabel = (title, schedule, onGoing) => {
        return <div>
            <div className="title d-flex mb-2">
                {title}: {schedule.startTime} - {schedule.endTime}
                {onGoing && onGoingLabel}
            </div>
            {statusBanner(booked, completed, open)}
        </div>
    }
    const appointmentSchedule = appointmentScheduleData["appointmentSchedule"];
    const morningScheduleElement = scheduleLabel("MORNING", appointmentSchedule[0], false)
    const afterNoonScheduleElement = scheduleLabel("AFTERNOON", appointmentSchedule[1], true)

    if (appointmentSchedule) {
        const content = <>
            {morningScheduleElement}
            {afterNoonScheduleElement}
        </>;
        return <Title text={getMessageComponent(LANGUAGE_KEYS.ENROLLMENT_TODAY,"", {date: formatDate(new Date().toISOString())})}
                      content={content}/>
    } else {
        return <></>
    }
}

