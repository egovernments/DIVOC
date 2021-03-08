import "../Home.scss"
import "./index.scss"
import React, {useEffect, useState} from "react";
import {appIndexDb} from "../../AppDatabase";
import {getMessageComponent, LANGUAGE_KEYS} from "../../lang/LocaleContext";
import {formatDate, getMeridiemTime, weekdays} from "../../utils/date_utils";
import {Title} from "../Home";

function getTimeInSeconds(str1) {
    str1 =  str1.split(':');
    return str1[0] * 3600 + str1[1] * 60;
}

function isOnGoing(startTime, endTime) {
    const startTimeInSeconds = parseInt(getTimeInSeconds(startTime));
    const endTimeInSeconds = parseInt(getTimeInSeconds(endTime));

    const today = new Date()
    const todayInSeconds = getTimeInSeconds(today.getHours() + ":" + today.getMinutes())

    return todayInSeconds >= startTimeInSeconds && todayInSeconds <= endTimeInSeconds
}

export const AppointmentDetails = (morningSchedule, afterNoonSchedule, booked, completed, open, ...props) => {
    const [appointmentScheduleData, setAppointmentScheduleData] = useState({});
    const [enrollments, setEnrollments] = useState(undefined)
    const [morningScheduleOnGoing, setMorningScheduleOnGoing] = useState(false)
    const [afterNoonScheduleOnGoing, setAfterNoonScheduleOnGoing] = useState(false)

    useEffect(() => {
        appIndexDb.getFacilitySchedule()
            .then((scheduleResponse) => setAppointmentScheduleData(scheduleResponse));
        appIndexDb.getAllEnrollments()
            .then((enrollments) => setEnrollments(enrollments))
    }, [])
    completed = 10

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

    const scheduleLabel = (title, schedule) => {
        const onGoing = isOnGoing(schedule.startTime, schedule.endTime)
        const dayOfToday = weekdays[new Date().getDay()]
        const scheduleDetails = schedule["days"].find((scheduleForThatDay) => scheduleForThatDay.day === dayOfToday)
        const total = scheduleDetails.maxAppointments
        const appointments = [].concat.apply([], enrollments.map((enrollment => enrollment.appointments)))
        const booked = appointments.filter((appointment) => appointment.appointmentSlot === schedule.startTime + "-" + schedule.endTime)
            .length

        return <div>
            <div className="title d-flex mb-2">
                {title}: {getMeridiemTime(schedule.startTime)} - {getMeridiemTime(schedule.endTime)}
                {onGoing && onGoingLabel}
            </div>
            {statusBanner(booked, completed, total - booked)}
        </div>
    }
    const appointmentSchedule = appointmentScheduleData["appointmentSchedule"];

    if (appointmentSchedule && enrollments) {
        const morningScheduleElement = scheduleLabel("MORNING", appointmentSchedule[0])
        const afterNoonScheduleElement = scheduleLabel("AFTERNOON", appointmentSchedule[1])
        const content = <>
            {morningScheduleElement}
            {afterNoonScheduleElement}
        </>;
        return <Title text={getMessageComponent(LANGUAGE_KEYS.APPOINTMENT_TODAY,"", {date: formatDate(new Date().toISOString())})}
                      content={content}/>
    } else {
        return <></>
    }
}

