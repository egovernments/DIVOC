import "../Home.scss"
import "./index.scss"
import React, {useEffect, useState} from "react";
import {appIndexDb} from "../../AppDatabase";
import {getMessageComponent, LANGUAGE_KEYS} from "../../lang/LocaleContext";
import {formatDate, getMeridiemTime, weekdays} from "../../utils/date_utils";
import {Title} from "../Home";

export const AppointmentDetails = (props) => {
    const [appointmentScheduleData, setAppointmentScheduleData] = useState({});
    const [enrollments, setEnrollments] = useState(undefined)
    const [beneficiaryCompletedStatus, setBeneficiaryCompletedStatus] = useState({})

    function getTimeInSeconds(time) {
        time =  time.split(':');
        return time[0] * 3600 + time[1] * 60;
    }

    function isOnGoing(startTime, endTime) {
        const startTimeInSeconds = parseInt(getTimeInSeconds(startTime));
        const endTimeInSeconds = parseInt(getTimeInSeconds(endTime));

        const today = new Date()
        const todayInSeconds = getTimeInSeconds(today.getHours() + ":" + today.getMinutes())

        return todayInSeconds >= startTimeInSeconds && todayInSeconds <= endTimeInSeconds
    }

    useEffect(() => {
        appIndexDb.getFacilitySchedule()
            .then((scheduleResponse) => {
                setAppointmentScheduleData(scheduleResponse)
                const appointmentSchedules = scheduleResponse?.appointmentSchedule
                if(appointmentSchedules) {
                    const morningSlot = appointmentSchedules[0].startTime + "-" + appointmentSchedules[0].endTime;
                    const afterNoonSlot = appointmentSchedules[1].startTime + "-" + appointmentSchedules[1].endTime;
                    appIndexDb.getCompletedCountForAppointmentBookedBeneficiaries(morningSlot)
                        .then(count => setBeneficiaryCompletedStatus((prevState => {
                            return {
                                ...prevState,
                                [morningSlot]: count
                            }
                        })))
                    appIndexDb.getCompletedCountForAppointmentBookedBeneficiaries(afterNoonSlot)
                        .then(count => setBeneficiaryCompletedStatus((prevState => {
                            return {
                                ...prevState,
                                [afterNoonSlot]: count
                            }
                        })))
                }
            });
        appIndexDb.getAllEnrollments()
            .then((enrollments) => setEnrollments(enrollments))
    }, [])

    const dimGrayColor = {color:"#696969"};
    const onGoingLabel = <div className="appointment-card pl-3 pr-3 ml-2" style={dimGrayColor}>
        {getMessageComponent(LANGUAGE_KEYS.STATUS_ONGOING)}</div>

    const statusBanner = (booked, completed, open) => {
        return <div className="d-flex appointment-card justify-content-around">
            <div className="text-center title">
                    <h5>{booked}</h5>
                    <h5 className="mb-3">{getMessageComponent(LANGUAGE_KEYS.STATUS_BOOKED)}</h5>
            </div>
            <div className="text-center title">
                    <h5>{completed}</h5>
                    <h5 className="mb3">{getMessageComponent(LANGUAGE_KEYS.STATUS_COMPLETED)}</h5>
            </div>
            <div className="text-center title" style={dimGrayColor}>
                    <h5>{open}</h5>
                    <h5 className="mb-3">{getMessageComponent(LANGUAGE_KEYS.STATUS_OPEN)}</h5>
            </div>
        </div>
    }


    const scheduleLabel = (schedule) => {
        const today = new Date().toISOString().slice(0, 10);
        const dayOfToday = weekdays[new Date().getDay()]
        const scheduleDetails = schedule["days"].find((scheduleForThatDay) => scheduleForThatDay.day === dayOfToday)
        const total = scheduleDetails.maxAppointments
        const appointmentsArrays = enrollments.filter(enrollment => enrollment.appointments).map((enrollment => enrollment.appointments));
        const appointments = [].concat.apply([], appointmentsArrays)
        const booked = appointments.filter((appointment) => 
            (appointment.appointmentSlot === schedule.startTime + "-" + schedule.endTime) && 
            (appointment.appointmentDate === today)
        ).length
        return <div>
            <div className="title d-flex mb-2">
                {getMeridiemTime(schedule.startTime)} - {getMeridiemTime(schedule.endTime)}
                {isOnGoing(schedule.startTime, schedule.endTime) && onGoingLabel}
            </div>
            {statusBanner(booked, beneficiaryCompletedStatus[schedule.startTime + "-" + schedule.endTime], total - booked)}
        </div>
    }

    function isAppointmentConfiguredForToday(appointmentSchedule) {
        if(appointmentSchedule) {
            const dayOfToday = weekdays[new Date().getDay()]
            return appointmentSchedule.some(schedule => schedule.days.some(day => day["day"] === dayOfToday))
        } else {
            return false;
        }
    }

    if (isAppointmentConfiguredForToday(appointmentScheduleData?.appointmentSchedule) && enrollments) {
        const appointmentSchedule = appointmentScheduleData["appointmentSchedule"];
        const content = <div style={{marginTop: "-4%"}}>
            {appointmentSchedule.map(schedule => scheduleLabel(schedule))}
        </div>;
        return <Title text={getMessageComponent(LANGUAGE_KEYS.APPOINTMENT_TODAY,"", {date: formatDate(new Date().toISOString())})}
                      content={content}/>
    } else {
        return <></>
    }
}

