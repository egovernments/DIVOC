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


export default function FacilityConfigureSlot ({facilityId, programId, programName}) {
    // mocking backend
    const mockSchedule = {
        osid: "jjbgt768i",
        name: "C-19 program",
        programId: "t7uj789",
        appointmentSchedule: [
            {
                osid: "yu76ht656tg",
                startTime: "09:00",
                endTime: "12:00",
                days: [
                    {
                        day: "mon",
                        maxAppointments: 100,
                    },
                    {
                        day: "tue",
                        maxAppointments: 100,
                    }
                ],
            },
            {
                osid: "hgr67yhu898iu",
                startTime: "14:00",
                endTime: "18:00",
                days: [
                    {
                        day: "mon",
                        maxAppointments: 80,
                    },
                    {
                        day: "tue",
                        maxAppointments: 80,
                    }
                ],
            }
        ],
        walkInSchedule: [
            {
                osid: "juy5678",
                days: ["wed", "thu"],
                startTime: "17:00",
                endTime: "18:00"
            }
        ]
    };
    // facilityId = "1223";
    // programId = "4556";
    // programName = "Covid-19";

    const DAYS = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"];
    const MORNING_SCHEDULE = "morningSchedule";
    const AFTERNOON_SCHEDULE = "afternoonSchedule";
    const MAX_APPOINTMENTS = 200;

    const history = useHistory();
    const [selectedDays, setSelectedDays] = useState([]);
    const [facilityProgramSchedules, setFacilityProgramSchedules] = useState({});
    const [morningSchedules, setMorningSchedules] = useState([]);
    const [afternoonSchedules, setAfternoonSchedules] = useState([]);
    const [walkInSchedules, setWalkInSchedules] = useState([]);

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
            if (res.status === 200) {
                schedule = res.data;
            }
            setFacilityProgramSchedules(schedule);
            setSelectedDaysFromSchedule(schedule);
            setMorningScheduleFromSchedule(schedule);
            setAfternoonScheduleFromSchedule(schedule);
            setWalkInScheduleFromSchedule(schedule);
        }).catch(err => {
            console.log("API request errored with ", err);
            setFacilityProgramSchedules(schedule);
            setSelectedDaysFromSchedule(schedule);
            setMorningScheduleFromSchedule(schedule);
            setAfternoonScheduleFromSchedule(schedule);
            setWalkInScheduleFromSchedule(schedule);
        })
    }

    useEffect(() => {
        getFacilityProgramSchedules()

    }, []);

    function setWalkInScheduleFromSchedule(program) {
        if (program.walkInSchedule.length === 0) {
            setWalkInSchedules([
                {
                    startTime: "",
                    endTime: "",
                    days: [],
                    edited: false
                }
            ])
        } else {
            let schedule = program.walkInSchedule.map(sd => {
                return {...sd, edited: false}
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

    function setMorningScheduleFromSchedule(schedule) {
        let schedules = [];
        schedule.appointmentSchedule.forEach(as => {
            if (Number(as.startTime.split(":")[0]) <= 12) {
                schedules.push({...as, scheduleType: MORNING_SCHEDULE, edited: false})
            }
        });
        if (schedules.length === 0) {
            schedules.push({
                startTime: "",
                endTime: "",
                days: [],
                scheduleType: MORNING_SCHEDULE,
                edited: false
            })
        }
        setMorningSchedules(schedules)
    }

    function setAfternoonScheduleFromSchedule(schedule) {
        let schedules = [];
        schedule.appointmentSchedule.forEach(as => {
            if (Number(as.startTime.split(":")[0]) > 12) {
                schedules.push({...as, scheduleType: AFTERNOON_SCHEDULE, edited: false})
            }
        });
        if (schedules.length === 0) {
            schedules.push({
                startTime: "",
                endTime: "",
                days: [],
                scheduleType: AFTERNOON_SCHEDULE,
                edited: false
            })
        }
        setAfternoonSchedules(schedules)
    }

    function AppointmentScheduleRow({schedule}) {

        function onValueChange(evt, field) {
            if (schedule.scheduleType === MORNING_SCHEDULE) {
                // assuming only one row
                setMorningSchedules([{...morningSchedules[0], [field]: evt.target.value, edited: true}])
            } else if (schedule.scheduleType === AFTERNOON_SCHEDULE) {
                // assuming only one row
                setAfternoonSchedules([{...afternoonSchedules[0], [field]: evt.target.value, edited: true}])
            }
        }

        function getMaxAppointments(day) {
            return schedule.days.filter(d => d.day === day).length > 0 ?
                schedule.days.filter(d => d.day === day)[0].maxAppointments : ''
        }

        function onMaxAppointmentsChange(evt, day) {
            let value = Number(evt.target.value);
            if (schedule.scheduleType === MORNING_SCHEDULE) {
                // assuming only one row
                let schedule = {...morningSchedules[0], edited: true};
                if (schedule.days.map(d => d.day).includes(day)) {
                    schedule.days = schedule.days.map(d => {
                        if (d.day === day) {
                            d.maxAppointments = value
                        }
                        return d
                    });
                } else {
                    schedule.days = schedule.days.concat({ "day": day, maxAppointments: value})
                }
                setMorningSchedules([schedule]);
            } else if (schedule.scheduleType === AFTERNOON_SCHEDULE) {
                // assuming only one row
                let schedule = {...afternoonSchedules[0], edited: true};
                if (schedule.days.map(d => d.day).includes(day)) {
                    schedule.days = schedule.days.map(d => {
                        if (d.day === day) {
                            d.maxAppointments = value
                        }
                        return d
                    });
                } else {
                    schedule.days = schedule.days.concat({ "day": day, maxAppointments: value})
                }
                setAfternoonSchedules([schedule])
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
                                type="text"
                                name="startTime"
                                onBlur={(evt) => onValueChange(evt, "startTime")}
                                required/>
                        </Col>
                        <Col className="mt-0">
                            <label className="mb-0" htmlFor="endTime">
                                To
                            </label>
                            <input
                                className="form-control"
                                defaultValue={schedule.endTime}
                                type="text"
                                name="endTime"
                                onBlur={(evt) => onValueChange(evt, "endTime")}
                                required/>
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
                        </Col>
                )}
            </Row>
        )
    }

    function WalkInScheduleRow({schedule}) {

        function onValueChange(evt, field) {
            setWalkInSchedules([{...walkInSchedules[0], [field]: evt.target.value, edited: true}])
        }

        function handleDayChange(day) {
            // assuming only one row
            let schedule = {...walkInSchedules[0], edited: true};
            let days = schedule.days.includes(day) ? schedule.days.filter(s => s !== day) : schedule.days.concat(day);
            schedule.days = days;
            setWalkInSchedules([schedule])
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
                                type="text"
                                name="startTime"
                                onBlur={(evt) => onValueChange(evt, "startTime")}
                                required/>
                        </Col>
                        <Col className="mt-0">
                            <label className="mt-0" htmlFor="endTime">
                                To
                            </label>
                            <input
                                className="form-control"
                                defaultValue={schedule.endTime}
                                type="text"
                                name="endTime"
                                onBlur={(evt) => onValueChange(evt, "endTime")}
                                required/>
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

    function onSelectDay(d) {
        const updatedSelection =  selectedDays.includes(d) ? selectedDays.filter(s => s !== d) : selectedDays.concat(d);
        setSelectedDays(updatedSelection);
    }

    function onSuccessfulSave() {
        alert("Slot successfully added")
    }

    function handleOnSave() {
        let data = {};
        // TODO: handle on save click
        let isMorningSchedulesChanged = morningSchedules.map(ms => ms.edited).reduce((a, b) => a || b);
        let isAfternoonSchedulesChanged = afternoonSchedules.map(ms => ms.edited).reduce((a, b) => a || b);
        let isWalkImSchedulesChanged = walkInSchedules.map(ms => ms.edited).reduce((a, b) => a || b);

        console.log(isMorningSchedulesChanged, isAfternoonSchedulesChanged, isWalkImSchedulesChanged);
        if (facilityProgramSchedules.osid) {
            // update
            if (morningSchedules[0].startTime || afternoonSchedules[0].startTime) {
                let appSch = [];
                if (morningSchedules[0].startTime) {
                    appSch = [...appSch, ...morningSchedules];
                }
                if (afternoonSchedules[0].startTime) {
                    appSch = [...appSch, ...afternoonSchedules]
                }
                data["appointmentSchedule"] = appSch
            }
            if (isWalkImSchedulesChanged) {
                data["walkInSchedule"] = [...walkInSchedules]
            }

            if (data["appointmentSchedule"] || data["walkInSchedule"]) {
                let apiUrl = API_URL.FACILITY_PROGRAM_SCHEDULE_API.replace(":facilityId", facilityId).replace(":programId", programId)
                axiosInstance.current.put(apiUrl, data)
                    .then(res => {
                        if (res.status === 200) {
                            onSuccessfulSave();
                            getFacilityProgramSchedules()
                        }
                        else
                            alert("Something went wrong while saving!");
                    });
            } else {
                alert("Nothing has changed!")
            }
        } else {
            // post
            if (isMorningSchedulesChanged || isAfternoonSchedulesChanged) {
                let appSch = [];
                if (isMorningSchedulesChanged) {
                    appSch = morningSchedules;
                }
                if (isAfternoonSchedulesChanged) {
                    appSch = [...appSch, ...afternoonSchedules]
                }
                data["appointmentSchedule"] = appSch
            }
            if (isWalkImSchedulesChanged) {
                data["walkInSchedule"] = [...walkInSchedules]
            }
            if (data["appointmentSchedule"] || data["walkInSchedule"]) {
                let apiUrl = API_URL.FACILITY_PROGRAM_SCHEDULE_API.replace(":facilityId", facilityId).replace(":programId", programId)
                axiosInstance.current.post(apiUrl, data)
                    .then(res => {
                        if (res.status === 200) {
                            onSuccessfulSave();
                            getFacilityProgramSchedules()
                        }
                        else
                            alert("Something went wrong while saving!");
                    });
            } else {
                alert("Nothing has changed!")
            }
        }
    }

    return (
        <div className="container-fluid mt-4">
            <Row>
                <Col><h3>{programName ? "Program: "+programName+" / ": ""} Config Slot</h3></Col>
                <Col style={{"textAlign": "right"}}>
                    <Button className='add-vaccinator-button mr-4' variant="outlined" color="primary" onClick={() => history.push(config.urlPath +'/facility_admin')}>
                        BACK
                    </Button>
                </Col>
            </Row>
            <div className="config-slot">
                <Row>
                    <Col className="col-3"><h5>Vaccination Days</h5></Col>
                    {DAYS.map(d =>
                        <Col key={d}>
                            <Button className={(selectedDays && selectedDays.includes(d) ? "selected-slot-day" : "ignored-slot-day")}
                                    style={{textTransform: "capitalize"}}
                                onClick={() => onSelectDay(d)}
                            >
                                {d}
                            </Button>
                        </Col>
                    )}
                </Row>
                <hr/>
                <div>
                    <Col><h5>Appointment Scheduler</h5></Col>
                    <div>
                        <Row>
                            <Col className="col-3">Morning Hours</Col>
                            <Col>Maximum {MAX_APPOINTMENTS} of appointments allowed</Col>
                        </Row>
                        {
                            morningSchedules.length > 0 &&
                                morningSchedules.map(ms => <AppointmentScheduleRow key={ms.osid} schedule={ms} />)
                        }
                    </div>
                    <div>
                        <Row className="mt-4">
                            <Col className="col-3">Afternoon Hours</Col>
                            <Col>Maximum {MAX_APPOINTMENTS} of appointments allowed</Col>
                        </Row>
                        {
                            afternoonSchedules.length > 0 &&
                                afternoonSchedules.map(ms => <AppointmentScheduleRow key={ms.osid} schedule={ms} />)
                        }
                    </div>
                </div>
                <div className="mt-5">
                    <Col><h5>Walk-in Scheduler</h5></Col>
                    <div>
                        {
                            walkInSchedules.length > 0 &&
                                walkInSchedules.map(ws => <WalkInScheduleRow key={ws.osid} schedule={ws} />)
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
