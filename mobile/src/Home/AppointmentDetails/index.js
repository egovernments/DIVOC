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
    const [morningScheduleOnGoing, setMorningScheduleOnGoing] = useState(false)
    const [afterNoonScheduleOnGoing, setAfterNoonScheduleOnGoing] = useState(false)
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
        let interval;
        appIndexDb.getFacilitySchedule()
            .then((scheduleResponse) => {
                setAppointmentScheduleData(scheduleResponse)
                const appointmentSchedules = scheduleResponse["appointmentSchedule"]
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
                // Calculate ongoing logic for every seconds
                const timeout = 1000;
                interval = setInterval(() => {
                    console.log("I am calculating ongoing status");
                    if(appointmentSchedules) {
                        setMorningScheduleOnGoing(
                            isOnGoing(appointmentSchedules[0].startTime, appointmentSchedules[0].endTime)
                        )
                        setAfterNoonScheduleOnGoing(
                            isOnGoing(appointmentSchedules[1].startTime, appointmentSchedules[1].endTime)
                        )
                    }
                }, timeout)
            });
        appIndexDb.getAllEnrollments()
            .then((enrollments) => setEnrollments(enrollments))
        // Clear the interval when component unmounts
        return () => clearInterval(interval)
    }, [])

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
        const dayOfToday = weekdays[new Date().getDay()]
        const scheduleDetails = schedule["days"].find((scheduleForThatDay) => scheduleForThatDay.day === dayOfToday)
        const total = scheduleDetails.maxAppointments
        const appointmentsArrays = enrollments.filter(enrollment => enrollment.appointments).map((enrollment => enrollment.appointments));
        const appointments = [].concat.apply([], appointmentsArrays)
        const booked = appointments.filter((appointment) => appointment.appointmentSlot === schedule.startTime + "-" + schedule.endTime)
            .length
        return <div>
            <div className="title d-flex mb-2">
                {title}: {getMeridiemTime(schedule.startTime)} - {getMeridiemTime(schedule.endTime)}
                {onGoing && onGoingLabel}
            </div>
            {statusBanner(booked, beneficiaryCompletedStatus[schedule.startTime + "-" + schedule.endTime], total - booked)}
        </div>
    }

    if (appointmentScheduleData["appointmentSchedule"] && enrollments) {
        const appointmentSchedule = appointmentScheduleData["appointmentSchedule"];
        const morningScheduleElement = scheduleLabel("MORNING", appointmentSchedule[0], morningScheduleOnGoing)
        const afterNoonScheduleElement = scheduleLabel("AFTERNOON", appointmentSchedule[1], afterNoonScheduleOnGoing)
        const content = <div style={{marginTop: "-4%"}}>
            {morningScheduleElement}
            {afterNoonScheduleElement}
        </div>;
        return <Title text={getMessageComponent(LANGUAGE_KEYS.APPOINTMENT_TODAY,"", {date: formatDate(new Date().toISOString())})}
                      content={content}/>
    } else {
        return <></>
    }
}

