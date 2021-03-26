import React, {useEffect, useState} from "react";
import Col from "react-bootstrap/Col";
import Row from "react-bootstrap/Row";
import "./index.css"
import Button from "react-bootstrap/Button";
import {CheckboxItem} from "../FacilityFilterTab";
import {useHistory} from "react-router-dom";
import config from "../../config"
import {useAxios} from "../../utils/useAxios";
import {API_URL, TAB_INDICES} from "../../utils/constants";
import {
    INVALID_FIRST_SLOT_TIME, INVALID_SLOT_COUNT,
    INVALID_SLOT_TIME,
    INVALID_TIME,
    SCHEDULE_WITH_NO_DAYS_SELECTED, WALKIN_SCHEDULE_ERROR_MSG
} from "./error-constants";
import DeleteIcon from "../../assets/img/icon-delete.svg";
import AddIcon from "../../assets/img/add-admin.svg";

const DAYS = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"];
const APPOINTMENT_SCHEDULE = "appointmentSchedule";
const WALKIN_SCHEDULE = "walkInSchedule";

export default function FacilityConfigureSlot ({location}) {
    const [facilityId, programId, programName] = [location.facilityOsid, location.programId, location.programName];
    const [scheduleDeleted, setScheduleDeleted] = useState(false);
    const history = useHistory();
    const [selectedDays, setSelectedDays] = useState([]);
    const [facilityProgramSchedules, setFacilityProgramSchedules] = useState({});
    const [appointmentSchedules, setAppointmentSchedules] = useState([]);
    const [walkInSchedules, setWalkInSchedules] = useState([]);
    const [errors, setErrors] = useState({});
    const [appointmentScheduleEnabled, setAppointmentScheduleEnabled] = useState(true);
    const [walkinScheduleEnabled, setWalkinScheduleEnabled] = useState(true);

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
            // TODO: Add utils to sort the schedule by startTime
            setSelectedDaysFromSchedule(schedule);
            setAppointmentSchedulesFromResponse(schedule);
            setWalkInScheduleFromSchedule(schedule);
        }).catch(err => {
            console.log("API request errored with ", err);
            setFacilityProgramSchedules(schedule);
            setSelectedDaysFromSchedule(schedule);
            setAppointmentSchedulesFromResponse(schedule);
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
                    days: selectedDays.map(day => day),
                    scheduleType: WALKIN_SCHEDULE,
                    edited: false
                }
            ])
            setWalkinScheduleEnabled(false);
        } else {
            setWalkinScheduleEnabled(true);
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

    function setAppointmentSchedulesFromResponse(appointmentSchedulesResponse) {
        let appointmentSchedules = [];

        if(appointmentSchedulesResponse.appointmentSchedule.length === 0) {
            setAppointmentScheduleEnabled(false);
            appointmentSchedules.push({
                startTime: "",
                endTime: "",
                days: selectedDays.map(day => ({day})),
                scheduleType: APPOINTMENT_SCHEDULE,
                edited: false,
                index: 0
            })
        } else {
            setAppointmentScheduleEnabled(true)
            appointmentSchedulesResponse.appointmentSchedule.forEach((as, index) => {
                appointmentSchedules.push({...as, scheduleType: APPOINTMENT_SCHEDULE, edited: false, index})
            });
        }
        setAppointmentSchedules(appointmentSchedules);
    }

    function onScheduleChange(schedule) {
        setAppointmentSchedules((prevState) => {
            const index = prevState.findIndex(s => s.index === schedule.index)
            prevState[index] = schedule
            return [...prevState]
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
        setWalkInSchedules([...newWalkInSchedules]);
    }

    function onSelectDay(d) {
        const updatedSelection =  selectedDays.includes(d) ? selectedDays.filter(s => s !== d) : selectedDays.concat(d);
        setSelectedDays(updatedSelection);

        function updateAppointmentSchedules() {
            const schedules = [...appointmentSchedules]
            schedules.forEach(schedule => {
                const index = schedule.days.findIndex(dayDetails => dayDetails.day === d)
                if (index !== -1) {
                    schedule.days.splice(index, 1)
                } else {
                    schedule.days.push({day: d})
                }
            })
            setAppointmentSchedules(schedules)
        }
        function updateWalkInSchedules() {
            const schedules = [...walkInSchedules]
            schedules.forEach(schedule => {
                const index = schedule.days.findIndex(day => day === d)
                if (index !== -1) {
                    schedule.days.splice(index, 1)
                } else {
                    schedule.days.push(d)
                }
            })
            setWalkInSchedules(schedules)
        }

        updateAppointmentSchedules();
        updateWalkInSchedules();
    }

    function onSuccessfulSave() {
        alert("Slot successfully added")
    }

    function validateSchedules() {
        function validateStartTime(schedule, err) {
            if (!schedule.startTime || schedule.startTime === "") {
                err = {...err, [schedule.scheduleType + schedule.index + "startTime"]: INVALID_TIME};
            }
            return err;
        }

        function validateEndTime(schedule, err) {
            if (!schedule.endTime || schedule.endTime === "") {
                err = {...err, [schedule.scheduleType + schedule.index + "endTime"]: INVALID_TIME};
            }
            return err;
        }

        function validateTimeRange(schedule, err) {
            const timeToNumber = (time) => {
                const hrMin = time.split(':');
                return parseInt(hrMin[0] + hrMin[1])
            }
            if (APPOINTMENT_SCHEDULE === schedule.scheduleType && schedule.startTime && schedule.endTime) {
                if (timeToNumber(schedule.startTime) > timeToNumber(schedule.endTime)) {
                    err = {...err, [schedule.scheduleType + schedule.index + "endTime"]: INVALID_FIRST_SLOT_TIME};
                }
                if (schedule.index - 1 >= 0) {
                    if (appointmentSchedules[schedule.index - 1].endTime &&
                        timeToNumber(schedule.startTime) < timeToNumber(appointmentSchedules[schedule.index - 1].endTime)) {
                        err = {
                            ...err,
                            [schedule.scheduleType + schedule.index + "startTime"]: INVALID_SLOT_TIME
                        };
                    }
                }
            }
            return err;
        }

        function validateSlotFrequencyCount(schedule, err) {
            if (APPOINTMENT_SCHEDULE === schedule.scheduleType) {
                if (!schedule.days || schedule.days.length === 0) {
                    err = {
                        ...err,
                        [schedule.scheduleType + schedule.index + "endTime"]: SCHEDULE_WITH_NO_DAYS_SELECTED
                    }
                } else {
                    schedule.days.forEach(d => {
                        if (d.maxAppointments === undefined || d.maxAppointments < 0) {
                            err = {
                                ...err,
                                [schedule.scheduleType + schedule.index + d.day]: INVALID_SLOT_COUNT
                            }
                        }
                    })
                }
            }
            return err;
        }

        function validateWalkinSchedule(schedule, err) {
            if (schedule.scheduleType === WALKIN_SCHEDULE &&
                (!schedule.days || schedule.days.length === 0)) {
                err = {...err, [schedule.scheduleType + schedule.index + "walkInDays"]: WALKIN_SCHEDULE_ERROR_MSG}
            }
            return err;
        }

        function validateSchedule(schedule) {
            let err = {};
            if (appointmentScheduleEnabled && schedule.scheduleType === APPOINTMENT_SCHEDULE) {
                err = validateStartTime(schedule, err);
                err = validateEndTime(schedule, err);
                err = validateTimeRange(schedule, err);
                err = validateSlotFrequencyCount(schedule, err);
            }

            if(walkinScheduleEnabled && schedule.scheduleType === WALKIN_SCHEDULE) {
                err = validateStartTime(schedule, err);
                err = validateEndTime(schedule, err);
                err = validateWalkinSchedule(schedule, err);
            }
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

        let isAppointmentSchedulesChanged = scheduleDeleted ||
            appointmentSchedules.map(ms => ms.edited).reduce((a, b) => a || b) ||
            (appointmentScheduleEnabled && !facilityProgramSchedules.appointmentSchedule) ||
            (!appointmentScheduleEnabled && facilityProgramSchedules.appointmentSchedule);
        let isWalkInSchedulesChanged = walkInSchedules.map(ms => ms.edited).reduce((a, b) => a || b) ||
            (walkinScheduleEnabled && !facilityProgramSchedules.walkInSchedule) ||
            (!walkinScheduleEnabled && facilityProgramSchedules.walkInSchedule);

        if (validateSchedules()) {
            return
        }
        data["appointmentSchedule"] = appointmentScheduleEnabled ? [ ...appointmentSchedules] : []
        data["walkInSchedule"] = walkinScheduleEnabled ? [...walkInSchedules] : []
        if (facilityProgramSchedules.osid) {
            // update
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

    const addScheduleHandler = () => {
        const newSchedule = {
            startTime: "",
                endTime: "",
            days: selectedDays.map(day => ({day})),
            scheduleType: APPOINTMENT_SCHEDULE,
            edited: false,
            index: appointmentSchedules.length
        }
        setAppointmentSchedules((prevState => {
            if (prevState) {
                return [...prevState, newSchedule]
            } else {
                return []
            }
        }))
    }
    const deleteHandler = (indexToRemove) => {
        setScheduleDeleted(true);
        const newAppointments = appointmentSchedules.filter(schedule => schedule.index !== indexToRemove);
        newAppointments.forEach((schedule, i) => {
            schedule.index = i;
        })
        setAppointmentSchedules([...newAppointments])
    }

    return (
        <div className="container-fluid mt-4">
            <Row className="pb-0">
                <Col><h3>{programName ? "Program: "+programName+" / ": ""} Config Slot</h3></Col>
                <Col style={{"textAlign": "right"}}>
                    <Button className='add-vaccinator-button mr-4' variant="outlined" color="primary"
                            onClick={() => history.push(
                                {
                                    pathname: config.urlPath +'/facility_admin',
                                    state: {tabIndex: TAB_INDICES.facilityAdmin.programOverview}
                                },
                                )}>
                        BACK
                    </Button>
                </Col>
            </Row>
            <div className="config-slot">
                <Row>
                    <Col className="col-4"><p style={{fontSize: "large", fontWeight: 900}}>Vaccination Days</p></Col>
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
                        <Col className="col-4">
                            <input onChange={event => setAppointmentScheduleEnabled(event.target.checked)}
                                   checked={appointmentScheduleEnabled}
                                   type="checkbox"
                                   name="appointmentHours"
                                   id="appointmentHours"/>
                            <label className="ml-2" htmlFor="appointmentHours" style={{fontSize: "large", fontWeight: "bold", marginBottom: 0}}>
                                Appointment Hours
                            </label>
                        </Col>
                        <Col style={{ fontWeight: "bold", color: "#646D82"}}>
                                Maximum number of appointments allowed
                        </Col>
                    </Row>
                    <div className="pt-3">
                        {
                            appointmentSchedules.length > 0 &&
                                appointmentSchedules.map((schedule, i) =>
                                    <AppointmentScheduleRow key={"ms_"+i}
                                                            schedule={schedule} onChange={onScheduleChange}
                                                            errors={errors} selectedDays={selectedDays}
                                                            deleteHandler={deleteHandler}
                                                            enableInput={!appointmentScheduleEnabled}
                                    />)
                        }
                        <button disabled={!appointmentScheduleEnabled} className="p-0 btn addIcon" onClick={addScheduleHandler}>
                            <img title="Add" alt={""} src={AddIcon} width={30}/>
                        </button>
                    </div>
                </div>
                <div className="mt-4">
                    <Row>
                        <Col className="col-4">
                            <input onChange={event => setWalkinScheduleEnabled(event.target.checked)}
                                   type="checkbox"
                                   checked={walkinScheduleEnabled}
                                   name="walkinHours"
                                   id="walkinHours"/>
                            <label className="ml-2" htmlFor="walkinHours" style={{fontSize: "large", fontWeight: "bold", marginBottom: 0}}>
                                Walk-in Hours
                            </label>
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
                                                       errors={errors} selectedDays={selectedDays}
                                                       enableInput={!walkinScheduleEnabled}
                                    />)
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

function AppointmentScheduleRow({schedule, onChange, selectedDays, errors, deleteHandler, enableInput}) {
    function onValueChange(evt, field) {
        onChange({...schedule, [field]: evt.target.value, edited: true});
    }

    function getMaxAppointments(day) {
        const scheduleDayDetails = schedule.days.find(d => d.day === day);
        if(scheduleDayDetails) {
            if(scheduleDayDetails.maxAppointments !== undefined) {
                return scheduleDayDetails.maxAppointments.toString()
            } else {
                return ""
            }
        } else {
            return ""
        }
    }

    function onMaxAppointmentsChange(evt, day) {
        let value = parseInt(evt.target.value);
        if (schedule.scheduleType === APPOINTMENT_SCHEDULE) {
            let newSchedule = {...schedule, edited: true};
            if (newSchedule.days.map(d => d.day).includes(day)) {
                newSchedule.days.forEach(d => {
                    if (d.day === day) {
                        d.maxAppointments = value
                    }
                });
            } else {
                newSchedule.days.concat({ "day": day, maxAppointments: value})
            }
            onChange(newSchedule);
        }
    }

    return (
        <Row className="mb-2">
            <Col className="col-4 timings-div" >
                <Row style={schedule.index === 0 ? {marginRight: "0%", width: "92.5%"}: {}}>
                    <Col>
                        <input
                            disabled={enableInput}
                            className="form-control"
                            value={schedule.startTime}
                            type="time"
                            name="startTime"
                            onChange={(evt) => onValueChange(evt, "startTime")}
                            required/>
                        <div className="invalid-input">
                            {errors[schedule.scheduleType + schedule.index+"startTime"]}
                        </div>
                    </Col>
                    <Col className="p-1 flex-grow-0">
                        to
                    </Col>
                    <Col>
                        <input
                            className="form-control"
                            disabled={enableInput}
                            value={schedule.endTime}
                            type="time"
                            name="endTime"
                            onChange={(evt) => onValueChange(evt, "endTime")}
                            required/>
                        <div className="invalid-input">
                            {errors[schedule.scheduleType + schedule.index+"endTime"]}
                        </div>
                    </Col>
                    {schedule.index !== 0 && <Col className="m-0 p-1 flex-grow-0">
                        <button className="p-0 btn" disabled = {enableInput} onClick={() => deleteHandler(schedule.index)}>
                            <img alt={""} title="Delete" src={DeleteIcon} width={30}
                            />
                        </button>
                    </Col>}
                </Row>
            </Col>
            {
                DAYS.map(d =>
                    <Col key={d}>
                        <input
                            className="form-control"
                            value={getMaxAppointments(d)}
                            disabled={enableInput || !selectedDays.includes(d)}
                            type="number"
                            name="maxAppointments"
                            onChange={(evt) => onMaxAppointmentsChange(evt, d)}
                            required/>
                        <div style={{fontWeight:"normal"}} className="invalid-input">
                            {errors[APPOINTMENT_SCHEDULE+ schedule.index + d]}
                        </div>
                    </Col>
            )}
        </Row>
    )
}

function WalkInScheduleRow({schedule, onChange, selectedDays, errors, enableInput}) {
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
            <Col className="col-4 timings-div">
                <Row style={{width: "92.5%"}}>
                    <Col>
                        <input
                            disabled={enableInput}
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
                    <Col className="p-1 flex-grow-0">
                        to
                    </Col>
                    <Col>
                        <input
                            disabled={enableInput}
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
                    <Col key={d} style={{marginTop:"1%"}}>
                        <CheckboxItem
                            checkedColor={"#5C9EF8"}
                            text={d}
                            disabled={enableInput || !selectedDays.includes(d)}
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
