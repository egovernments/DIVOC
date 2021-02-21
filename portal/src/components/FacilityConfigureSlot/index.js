import React, {useEffect, useState} from "react";
import Col from "react-bootstrap/Col";
import Row from "react-bootstrap/Row";
import "./index.css"
import Button from "react-bootstrap/Button";
import {CheckboxItem} from "../FacilityFilterTab";
import {useHistory} from "react-router-dom";
import config from "../../config"


export default function FacilityConfigureSlot () {
    // mocking backend
    const program = {
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
                days: ["wed", "thu"],
                startTime: "17:00",
                endTime: "18:00"
            }
        ]
    };

    const DAYS = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"];
    const MORNING_SCHEDULE = "morningSchedule";
    const AFTERNOON_SCHEDULE = "afternoonSchedule";

    const history = useHistory();
    const [selectedDays, setSelectedDays] = useState([]);
    const [morningSchedule, setMorningSchedule] = useState([]);
    const [afternoonSchedule, setAfternoonSchedule] = useState([]);

    function setSelectedDaysFromSchedule() {
        let daysInAppointmentSchedule = [];
        program.appointmentSchedule.forEach(as => {
            let days = as.days.map(d => d.day);
            days.forEach(d => {
                if (!daysInAppointmentSchedule.includes(d) && !selectedDays.includes(d)) {
                    daysInAppointmentSchedule.push(d)
                }
            })
        });
        program.walkInSchedule.forEach(ws => {
            ws.days.forEach(d => {
                if (!daysInAppointmentSchedule.includes(d) && !selectedDays.includes(d)) {
                    daysInAppointmentSchedule.push(d)
                }
            })
        });
        setSelectedDays([...selectedDays].concat(daysInAppointmentSchedule))
        setSelectedDays([...selectedDays].concat(daysInAppointmentSchedule))
    }

    useEffect(() => {
        setSelectedDaysFromSchedule();

        // TODO: filter appointment schedule with start and end time to get morning schedule
        setMorningSchedule([{...program.appointmentSchedule[0], scheduleType: MORNING_SCHEDULE}]);
        setAfternoonSchedule([{...program.appointmentSchedule[1], scheduleType: AFTERNOON_SCHEDULE}]);
    }, []);

    function AppointmentScheduleRow({schedule}) {

        function onValueChange(evt, field) {
            if (schedule.osid && schedule.scheduleType === MORNING_SCHEDULE) {
                let updatedSchedule = morningSchedule.map(ms => {
                    if (ms.osid === schedule.osid) {
                        ms[field] = evt.target.value
                    }
                    return ms
                });
                setMorningSchedule(updatedSchedule);
            } else if (schedule.osid && schedule.scheduleType === AFTERNOON_SCHEDULE) {
                let updatedSchedule = afternoonSchedule.map(ms => {
                    if (ms.osid === schedule.osid) {
                        ms[field] = evt.target.value
                    }
                    return ms
                });
                setAfternoonSchedule(updatedSchedule);
            }
            // TODO: handle new schedule update
        }

        function getMaxAppointments(day) {
            return schedule.days.filter(d => d.day === day).length > 0 ?
                schedule.days.filter(d => d.day === day)[0].maxAppointments : ''
        }

        function onMaxAppointmentsChange(evt, day) {
            // TODO : handle max appointments change
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
                                id="startTime"
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
                                id="endTime"
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
                                type="text"
                                id="maxAppointments"
                                onBlur={(evt) => onMaxAppointmentsChange(evt, d)}
                                required/>
                        </Col>
                )}
            </Row>
        )
    }

    function WalkInScheduleRow({schedule}) {

        function onValueChange(evt, field) {
            // TODO : handle start and end time change
        }

        function handleDayChange(day) {
            // TODO : handle day change
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
                                id="startTime"
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
                                id="endTime"
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

    function handleOnSave() {
        // TODO: handle on save click
    }

    return (
        <div className="container-fluid mt-4">
            <Row>
                <Col><h3>Program: {program.name} / Config Slot</h3></Col>
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
                            <Col>Maximum # of appointments allowed</Col>
                        </Row>
                        {
                            morningSchedule.length > 0 &&
                                morningSchedule.map(ms => <AppointmentScheduleRow schedule={ms} />)
                        }
                    </div>
                    <div>
                        <Row className="mt-4">
                            <Col className="col-3">Afternoon Hours</Col>
                            <Col>Maximum # of appointments allowed</Col>
                        </Row>
                        {
                            afternoonSchedule.length > 0 &&
                                afternoonSchedule.map(ms => <AppointmentScheduleRow schedule={ms} />)
                        }
                    </div>
                </div>
                <div className="mt-5">
                    <Col><h5>Walk-in Scheduler</h5></Col>
                    <div>
                        {
                            program.walkInSchedule.length > 0 &&
                                program.walkInSchedule.map(ws => <WalkInScheduleRow schedule={ws} />)
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
