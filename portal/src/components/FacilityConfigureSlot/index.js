import React, {useEffect, useState} from "react";
import Col from "react-bootstrap/Col";
import Row from "react-bootstrap/Row";
import "./index.css"
import Button from "react-bootstrap/Button";
import {CheckboxItem} from "../FacilityFilterTab";
import {useHistory} from "react-router-dom";
import config from "../../config"
import {useAxios} from "../../utils/useAxios";
import {API_URL} from "../../utils/constants";

const DAYS = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"];
const APPOINTMENT_SCHEDULE = "appointmentSchedule";
const WALKIN_SCHEDULE = "walkInSchedule";
const MAXIMUM_NUMBER_OF_SCHEDULES_PER_DAY = 2;

export default function FacilityConfigureSlot ({location}) {
    const [facilityId, programId, programName] = [location.facilityOsid, location.programId, location.programName];

    const history = useHistory();
    const [selectedDays, setSelectedDays] = useState([]);
    const [facilityProgramSchedules, setFacilityProgramSchedules] = useState({});
    const [appointmentSchedules, setAppointmentSchedules] = useState([]);
    const [walkInSchedules, setWalkInSchedules] = useState([]);
    const [errors, setErrors] = useState({});

    const axiosInstance = useAxios('');

    function getFacilityProgramSchedules() {
        let schedule = {
            appointmentSchedule: [],
            walkInSchedule: []
        };
        axiosInstance.current.get(API_URL.FACILITY_PROGRAM_SCHEDULE_API
            .replace(":facilityId", facilityId)
            .replace(":programId", programId)
        ).then(res => {
            schedule = res.data;
            setFacilityProgramSchedules(schedule);
            setSelectedDaysFromSchedule(schedule);
            setAppointmentSchedule(schedule);
            setWalkInScheduleFromSchedule(schedule);
        }).catch(err => {
            console.log("API request errored with ", err);
            setFacilityProgramSchedules(schedule);
            setSelectedDaysFromSchedule(schedule);
            setAppointmentSchedule(schedule);
            setWalkInScheduleFromSchedule(schedule);
        })
    }

    useEffect(() => {
        if (!programId) {
            alert("Please select a program from program overview to configure schedule");
            history.push(config.urlPath + "/facility_admin")
        }
        getFacilityProgramSchedules()
    }, [location]);

    function setWalkInScheduleFromSchedule(program) {
        if (program.walkInSchedule.length === 0) {
            setWalkInSchedules([
                {
                    startTime: "",
                    endTime: "",
                    days: [],
                    scheduleType: WALKIN_SCHEDULE,
                    edited: false
                }
            ])
        } else {
            let schedule = program.walkInSchedule.map(sd => {
                return {...sd, edited: false, scheduleType: WALKIN_SCHEDULE,}
            });
            setWalkInSchedules(schedule)
        }
    }

    function setSelectedDaysFromSchedule(schedule) {
        let daysInAppointmentSchedule = [];
        schedule.appointmentSchedule.forEach(as => {
            let days = as.days.map(d => d.day);
            days.forEach(d => {
                if (!daysInAppointmentSchedule.includes(d) && !selectedDays.includes(d)) {
                    daysInAppointmentSchedule.push(d)
                }
            })
        });
        schedule.walkInSchedule.forEach(ws => {
            ws.days.forEach(d => {
                if (!daysInAppointmentSchedule.includes(d) && !selectedDays.includes(d)) {
                    daysInAppointmentSchedule.push(d)
                }
            })
        });
        setSelectedDays([...selectedDays].concat(daysInAppointmentSchedule))
    }

    function setAppointmentSchedule(schedule) {
        let appointmentSchedules = [];

        schedule.appointmentSchedule.forEach((as, index) => {
            appointmentSchedules.push({...as, scheduleType: APPOINTMENT_SCHEDULE, edited: false, index})
        });
        for (let i = 0; appointmentSchedules.length < MAXIMUM_NUMBER_OF_SCHEDULES_PER_DAY &&
                i < MAXIMUM_NUMBER_OF_SCHEDULES_PER_DAY - appointmentSchedules.length + 1; i++) {
            appointmentSchedules.push({
                startTime: "",
                endTime: "",
                days: [],
                scheduleType: APPOINTMENT_SCHEDULE,
                edited: false,
                index: appointmentSchedules.length + i
            })
        }
        setAppointmentSchedules(appointmentSchedules);
    }

    function onScheduleChange(schedule) {
        setAppointmentSchedules((prevState) => {
            const index = prevState.findIndex(s => s.index === schedule.index)
            prevState[index] = schedule
            return prevState
        });
    }

    function onWalkInScheduleChange(schedule) {
        const newWalkInSchedules = walkInSchedules.map(s => {
            if(s.osid === schedule.osid) {
                return schedule;
            } else {
                return s;
            }
        });
        setWalkInSchedules(newWalkInSchedules);
    }

    function onSelectDay(d) {
        const updatedSelection =  selectedDays.includes(d) ? selectedDays.filter(s => s !== d) : selectedDays.concat(d);
        setSelectedDays(updatedSelection);
    }

    function onSuccessfulSave() {
        alert("Slot successfully added")
    }

    function validateSchedules() {

        function validateSchedule(schedule) {
            let err = {};
            if (!schedule.startTime || schedule.startTime === ""){
                err = {...err, [schedule.scheduleType + schedule.index+"startTime"]: "* Add From time"};
            }
            if (!schedule.endTime || schedule.endTime === "") {
                err = {...err, [schedule.scheduleType + schedule.index+"endTime"]: "* Add To time"};
            }
            if(schedule.startTime && schedule.endTime && parseInt(schedule.startTime) > parseInt(schedule.endTime)) {
                err = {...err, [schedule.scheduleType + schedule.index+"endTime"]: "* From time should be less than To time"};
            }
            // if(schedule.startTime && schedule.endTime) {
                if (APPOINTMENT_SCHEDULE === schedule.scheduleType &&
                    (!schedule.days || schedule.days.length === 0 ||
                        schedule.days.filter(d => d.maxAppointments).length !== schedule.days.length)) {
                    schedule.days.forEach(d => {
                        if(!d.maxAppointments || d.maxAppointments < 0) {
                            err = {...err, [schedule.scheduleType + schedule.index+d.day]: "* Please add maximum number"}
                        }
                    })
                }
            // }

            if (schedule.scheduleType === WALKIN_SCHEDULE &&
                (!schedule.days || schedule.days.length === 0)) {
                err = {...err, [schedule.scheduleType + schedule.index+"walkInDays"]: "Please select walk-in days"}
            }
            // if all 3 errors (startTime, endTime and maxApp/walkInDays) are there
            // then dont add any errors
            return err
        }

        let wlkSch = validateSchedule(walkInSchedules[0])
        let overallErrors = {...wlkSch};
        for (let i = 0; i < appointmentSchedules.length; i++) {
            const err = validateSchedule(appointmentSchedules[i]);
            overallErrors = {...overallErrors, ...err}
        }
        setErrors(overallErrors);
        return Object.keys(overallErrors).length > 0
    }

    function handleOnSave() {
        let data = {};

        let isAppointmentSchedulesChanged = appointmentSchedules.map(ms => ms.edited).reduce((a, b) => a || b);
        let isWalkInSchedulesChanged = walkInSchedules.map(ms => ms.edited).reduce((a, b) => a || b);

        if (validateSchedules()) {
            return
        }

        if (facilityProgramSchedules.osid) {
            // update
            data["appointmentSchedule"] = [...appointmentSchedules]
            data["walkInSchedule"] = [...walkInSchedules]
            if (isAppointmentSchedulesChanged || isWalkInSchedulesChanged) {
                let apiUrl = API_URL.FACILITY_PROGRAM_SCHEDULE_API.replace(":facilityId", facilityId).replace(":programId", programId)
                axiosInstance.current.put(apiUrl, data)
                    .then(_ => {
                        onSuccessfulSave();
                        getFacilityProgramSchedules()
                    });
            } else {
                alert("Nothing has changed!")
            }
        } else {
            // post
            data["appointmentSchedule"] = appointmentSchedules
            data["walkInSchedule"] = [...walkInSchedules]
            if (isAppointmentSchedulesChanged || isWalkInSchedulesChanged) {
                let apiUrl = API_URL.FACILITY_PROGRAM_SCHEDULE_API.replace(":facilityId", facilityId).replace(":programId", programId)
                axiosInstance.current.post(apiUrl, data)
                    .then(_ => {
                        onSuccessfulSave();
                        getFacilityProgramSchedules()
                    });
            } else {
                alert("Nothing has changed!")
            }
        }
    }

    return (
        <div className="container-fluid mt-4">
            <Row className="pb-0">
                <Col><h3>{programName ? "Program: "+programName+" / ": ""} Config Slot</h3></Col>
                <Col style={{"textAlign": "right"}}>
                    <Button className='add-vaccinator-button mr-4' variant="outlined" color="primary" onClick={() => history.push(config.urlPath +'/facility_admin')}>
                        BACK
                    </Button>
                </Col>
            </Row>
            <div className="config-slot">
                <Row>
                    <Col className="col-3"><p style={{fontSize: "large", fontWeight: 900}}>Vaccination Days</p></Col>
                    {DAYS.map(d =>
                        <Col key={d}>
                            <Button className={(selectedDays && selectedDays.includes(d) ? "selected-slot-day" : "ignored-slot-day")}

                                onClick={() => onSelectDay(d)}
                            >
                                {d}
                            </Button>
                        </Col>
                    )}
                </Row>
                <hr className="mt-0"/>
                <div>
                    <Row>
                        <Col className="col-3">
                            <p style={{fontSize: "large", fontWeight: "bold", marginBottom: 0}}>
                                Appointment Scheduler
                            </p>
                        </Col>
                        <Col style={{ fontWeight: "bold", color: "#646D82"}}>
                                Maximum number of appointments allowed
                        </Col>
                    </Row>
                    <div>
                        {
                            appointmentSchedules.length > 0 &&
                                appointmentSchedules.map((schedule, i) =>
                                    <AppointmentScheduleRow key={"ms_"+i}
                                                            schedule={schedule} onChange={onScheduleChange}
                                                            errors={errors} selectedDays={selectedDays}/>)
                        }
                    </div>
                </div>
                <div className="mt-4">
                    <Row>
                        <Col className="col-3">
                            <p style={{fontSize: "large", fontWeight: "bold", marginBottom: 0}}>Walk-in Scheduler</p>
                        </Col>
                        <Col style={{ fontWeight: "bold", color: "#646D82"}} >
                            Select Walk-in Days
                            <div style={{fontWeight:"normal"}} className="invalid-input">
                                {errors[WALKIN_SCHEDULE+"walkInDays"]}
                            </div>
                        </Col>
                    </Row>
                    <div>
                        {
                            walkInSchedules.length > 0 &&
                                walkInSchedules.map((ws, i) =>
                                    <WalkInScheduleRow key={"wis_"+i}
                                                       schedule={ws} onChange={onWalkInScheduleChange}
                                                       errors={errors} selectedDays={selectedDays}/>)
                        }
                    </div>
                </div>
            </div>
            <div className="mt-5">
                <Button className='add-vaccinator-button mr-4' variant="primary" color="primary"
                        onClick={handleOnSave}>
                    SAVE
                </Button>
            </div>
        </div>
    )
}

function AppointmentScheduleRow({schedule, onChange, selectedDays, errors}) {
    function onValueChange(evt, field) {
        onChange({...schedule, [field]: evt.target.value, edited: true});
    }

    function getMaxAppointments(day) {
        return schedule.days.filter(d => d.day === day).length > 0 ?
            schedule.days.filter(d => d.day === day)[0].maxAppointments : ''
    }

    function onMaxAppointmentsChange(evt, day) {
        let value = Number(evt.target.value);
        if (schedule.scheduleType === APPOINTMENT_SCHEDULE) {
            // assuming only one row
            let newSchedule = {...schedule, edited: true};
            if (schedule.days.map(d => d.day).includes(day)) {
                newSchedule.days = schedule.days.map(d => {
                    if (d.day === day) {
                        d.maxAppointments = value
                    }
                    return d
                });
            } else {
                newSchedule.days = schedule.days.concat({ "day": day, maxAppointments: value})
            }
            onChange(newSchedule);
        }
    }

    return (
        <Row>
            <Col className="col-3 timings-div">
                <Row>
                    <Col className="mt-0">
                        <label className="mb-0" htmlFor="startTime">
                            From
                        </label>
                        <input
                            className="form-control"
                            defaultValue={schedule.startTime}
                            type="time"
                            name="startTime"
                            onChange={(evt) => onValueChange(evt, "startTime")}
                            required/>
                        <div className="invalid-input">
                            {errors[schedule.scheduleType + schedule.index+"startTime"]}
                        </div>
                    </Col>
                    <Col className="mt-0">
                        <label className="mb-0" htmlFor="endTime">
                            To
                        </label>
                        <input
                            className="form-control"
                            defaultValue={schedule.endTime}
                            type="time"
                            name="endTime"
                            onChange={(evt) => onValueChange(evt, "endTime")}
                            required/>
                        <div className="invalid-input">
                            {errors[schedule.scheduleType + schedule.index+"endTime"]}
                        </div>
                    </Col>
                </Row>
            </Col>
            {
                DAYS.map(d =>
                    <Col key={d}>
                        <input
                            style={{marginTop: "19px"}}
                            className="form-control"
                            defaultValue={getMaxAppointments(d)}
                            disabled={!selectedDays.includes(d)}
                            type="number"
                            name="maxAppointments"
                            onBlur={(evt) => onMaxAppointmentsChange(evt, d)}
                            required/>
                        <div style={{fontWeight:"normal"}} className="invalid-input">
                            {errors[APPOINTMENT_SCHEDULE+ schedule.index + d]}
                        </div>
                    </Col>
            )}
        </Row>
    )
}

function WalkInScheduleRow({schedule, onChange, selectedDays, errors}) {
    function onValueChange(evt, field) {
        onChange({...schedule, [field]: evt.target.value, edited: true});
    }

    function handleDayChange(day) {
        // assuming only one row
        let newSchedule = {...schedule, edited: true};
        let days = schedule.days.includes(day) ? schedule.days.filter(s => s !== day) : schedule.days.concat(day);
        newSchedule.days = days;
        onChange(newSchedule);
    }

    return (
        <Row>
            <Col className="col-3 timings-div">
                <Row>
                    <Col className="mt-0">
                        <label className="mt-0" htmlFor="startTime">
                            From
                        </label>
                        <input
                            className="form-control"
                            defaultValue={schedule.startTime}
                            type="time"
                            name="startTime"
                            onBlur={(evt) => onValueChange(evt, "startTime")}
                            required/>
                        <div className="invalid-input">
                            {errors[schedule.scheduleType + schedule.index+"startTime"]}
                        </div>
                    </Col>
                    <Col className="mt-0">
                        <label className="mt-0" htmlFor="endTime">
                            To
                        </label>
                        <input
                            className="form-control"
                            defaultValue={schedule.endTime}
                            type="time"
                            name="endTime"
                            onBlur={(evt) => onValueChange(evt, "endTime")}
                            required/>
                        <div className="invalid-input">
                            {errors[schedule.scheduleType + schedule.index+"endTime"]}
                        </div>
                    </Col>
                </Row>
            </Col>
            {
                DAYS.map(d =>
                    <Col style={{marginTop: "31px"}}  key={d}>
                        <CheckboxItem
                            checkedColor={"#5C9EF8"}
                            text={d}
                            disabled={!selectedDays.includes(d)}
                            checked={schedule.days.includes(d)}
                            onSelect={(event) =>
                                handleDayChange(event.target.name)
                            }
                            showText={false}
                        />
                    </Col>
                )}
        </Row>
    )
}
