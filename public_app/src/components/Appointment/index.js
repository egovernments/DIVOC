import React, {useEffect, useState} from "react";
import "./index.css";
import {Button, Col, Modal, Row} from "react-bootstrap";
import {TextInputWithIcon} from "../TextInputWithIcon";
import CloseImg from "../../assets/img/icon-cross.svg"
import {formatDate, padDigit} from "../../utils/CustomDate";
import {CustomButton} from "../CustomButton";
import Img from "../../assets/img/icon-search.svg"
import {useHistory} from "react-router-dom";
import axios from "axios";
import {equals, reject} from "ramda";
import {Loader} from "../Loader";

export const Appointment = (props) => {
    const {enrollment_code, program_id} = props.match.params;
    const {name} = props.location.state;
    const history = useHistory();
    const [isLoading, setIsLoading] = useState(false);
    const [searchText, setSearchText] = useState("");
    const [searchDate, setSearchDate] = useState("");
    const [facilities, setFacilities] = useState([]);
    const [selectedFacilityIndex, setSelectedFacilityIndex] = useState(-1);
    const [showModal, setShowModal] = useState(false);
    const [selectedAllotment, setSelectedAllotment] = useState({});

    useEffect(() => {
        setIsLoading(true);
        let params = {
            // pincode: searchText
        };
        params = reject(equals(''))(params);
        const queryParams = new URLSearchParams(params);

        axios.get("/divoc/admin/api/v1/public/facilities", {params: queryParams})
            .then(res => {
                let data = res.data.map(d => {
                    return {
                        ...d,
                        programs: d.programs.map(p => {
                            if (p.programId === program_id) {
                                return {
                                    ...p, "schedule": {
                                        "days": [
                                            "Th",
                                            "F",
                                            "Sa"
                                        ],
                                        "endTime": "23:00",
                                        "startTime": "11:00"
                                    }
                                }
                            }
                            return p;
                        })
                    }
                });
                data = data.filter(d => ("" + d.address.pincode).startsWith(searchText))
                setFacilities(data)
                setIsLoading(false);
            });
    }, [searchText, searchDate]);

    function formatAddress({addressLine1, addressLine2, district, state, pincode}) {
        return [addressLine1, addressLine2, district, state, pincode].filter(d => d && ("" + d).trim().length > 0).join(", ")
    }

    function getAvailableAllotments() {
        let facility = facilities[selectedFacilityIndex];
        return (
            <div className="p-3 allotment-wrapper" style={{border: "1px solid #d3d3d3"}}>
                <div className="d-flex justify-content-between align-items-center">
                    <h5>Available Time Slot for {facility.facilityName}</h5>
                    <img src={CloseImg} className="cursor-pointer" alt={""}
                         onClick={() => setSelectedFacilityIndex(-1)}/>
                </div>
                <FacilityAllotment facility={facility} programId={program_id}
                                   showModal={(facilityId, allotmentDate, allotmentTime, programName, facilityName, facilityAddress) => {
                                       setShowModal(true)
                                       setSelectedAllotment({
                                           facilityId,
                                           allotmentDate,
                                           allotmentTime,
                                           programName,
                                           facilityName,
                                           facilityAddress
                                       })
                                   }}/>
            </div>
        )
    }

    function getFacilityDetails() {
        if (showModal && "facilityId" in selectedAllotment) {
            const facility = facilities.find(facility => facility.osid === selectedAllotment.facilityId);
            return <>{`At ${facility.facilityName},`}<br/> {`${formatAddress(facility.address)}`}</>;
        } else {
            return "";
        }
    }

    function getMeridian(hour) {
        return hour > 11 ? "PM" : "AM";
    }

    return (
        <div className="appointment-container">
            {isLoading && <Loader/>}
            <div className="card-container">
                <div className="header-group">
                    <h3>Select Facility</h3>
                    <span className="appointment-back-btn cursor-pointer" onClick={() => {history.push("/registration")}}>Back</span>
                </div>
                <Row>
                    <Col lg={6}>
                        <TextInputWithIcon title={"Search by Pincode"} value={searchText} onChange={setSearchText}
                                           img={Img}/>
                    </Col>

                </Row>
                <br/>
                <h4>Facilities availability for next 3 days</h4>
                <Row className="facility-list-wrapper">
                    <Col lg={6} className="facility-list">
                        {
                            facilities.map((facility, index) => (
                                <>
                                    <div className={`facility-card ${index === selectedFacilityIndex ? "active" : ""}`}
                                         onClick={() => {
                                             setSelectedFacilityIndex(index)
                                         }}>
                                        <div className="d-flex justify-content-between">
                                            <b>{facility.facilityName}</b>
                                            {
                                                getProgramIfAppointmentIsAvailable(facility, program_id) && <span
                                                    style={{
                                                        fontSize: "10px",
                                                        color: "#2CD889"
                                                    }}>Appointment Available</span>
                                            }
                                            {
                                                !getProgramIfAppointmentIsAvailable(facility, program_id) &&
                                                <span style={{fontSize: "10px", color: "#FF7C2B"}}>Walkin</span>
                                            }
                                        </div>
                                        <div><span
                                            className="facility-list-detail mr-2">Address:</span>{formatAddress(facility.address)}
                                        </div>

                                    </div>
                                    <div
                                        className="d-block d-lg-none">{index === selectedFacilityIndex && getAvailableAllotments()}</div>
                                </>
                            ))
                        }
                    </Col>
                    {selectedFacilityIndex >= 0 && <Col lg={6} className="d-none d-lg-block">
                        {getAvailableAllotments()}
                    </Col>}
                </Row>
            </div>
            <Modal show={showModal} onHide={() => {
                setShowModal(false)
            }} centered backdrop="static"
                   keyboard={false}>
                <div className="p-3 allotment-wrapper" style={{border: "1px solid #d3d3d3"}}>
                    <div className="d-flex justify-content-between align-items-center">
                        <div/>
                        <h5>Confirm Appointment Details </h5>
                        <img src={CloseImg} className="cursor-pointer" alt={""}
                             onClick={() => setShowModal(false)}/>
                    </div>
                    <div className="d-flex flex-column justify-content-center align-items-center">
                        {/*TODO: replace with name*/}
                        <span>For {name}</span>
                        <span className="text-center mt-1">{getFacilityDetails()}</span>
                        <span className="mt-1">{formatDate(selectedAllotment.allotmentDate)}</span>
                        <span
                            className="mt-1">{padDigit(selectedAllotment.allotmentTime > 12 ? selectedAllotment.allotmentTime % 12 : selectedAllotment.allotmentTime)}:00 {getMeridian(selectedAllotment.allotmentTime)} - {padDigit((selectedAllotment.allotmentTime + 1) > 12 ? (selectedAllotment.allotmentTime + 1) % 12 : (selectedAllotment.allotmentTime + 1))}:00 {getMeridian(selectedAllotment.allotmentTime + 1)}</span>
                        <CustomButton className="blue-btn" onClick={() => {
                            localStorage.setItem(enrollment_code, JSON.stringify({
                                ...selectedAllotment,
                                enrollment_code
                            }))
                            history.push("/" + enrollment_code + "/appointment/confirm")
                        }}>CONFIRM</CustomButton>
                    </div>
                </div>
            </Modal>
        </div>
    )
};

const Days = {
    Su: 0,
    M: 1,
    Tu: 2,
    W: 3,
    Th: 4,
    F: 5,
    Sa: 6,
};
let MAX_DAYS = 3;

function getProgramIfAppointmentIsAvailable(facility, programId) {
    const program = (facility.programs || []).find(program => program.programId === programId);
    if (program && program.schedule && program.schedule.days.length > 0 && program.schedule.startTime && program.schedule.endTime) {
        return program
    } else {
        return undefined
    }
}

const FacilityAllotment = ({facility, programId, showModal}) => {
    const program = getProgramIfAppointmentIsAvailable(facility, programId);
    if (program) {
        function getTimeSlots(allotmentDate) {
            const startHour = parseInt(program.schedule.startTime.split(":")[0]);
            const endHour = parseInt(program.schedule.endTime.split(":")[0]);
            const lunchHour = 13;
            let slots = [];
            for (let i = startHour; i < endHour; i++) {

                let time = padDigit(i > 12 ? i % 12 : i, 2);
                let available = ((i + allotmentDate.getDay() + parseInt(facility.osid.substring(0,4).replace(/[a-z\-]/g,''))));
                console.log("Time " + i + " " + available + " " + facility.osid.substr(0,4)) ;
                if (i != lunchHour && available%3!==1) {
                    slots.push(<Button
                      variant="outline-primary"
                      onClick={() => {
                          showModal(facility.osid, allotmentDate, i, program.name, facility.facilityName, facility.address)
                      }}
                      className="mt-3">{time}:00 {i > 11 ? "PM" : "AM"}</Button>)
                } else if (i === lunchHour) {
                    slots.push(<Button variant="outline-light" className="mt-3" >{time}:00 {i > 11 ? "PM" : "AM"}</Button>)
                }else {
                    slots.push(<Button variant="outline-secondary" className="mt-3" >{time}:00 {i > 11 ? "PM" : "AM"}</Button>)
                }
            }
            return slots;
        }

        let days = program.schedule.days;
        days = days.map(d => Days[d]);
        while (days.length < MAX_DAYS) {
            days.push(...program.schedule.days.map(d => Days[d] + 7))
        }
        days = days.map(day => {
            let d = new Date();
            if (day > 6) {
                d.setDate(d.getDate() + 7)
            }
            d.setDate(d.getDate() + ((7 - d.getDay()) % 7 + day) % 7);
            return d;
        }).sort((a, b) => a - b).slice(0, MAX_DAYS);

        return (
            <div className="days-list-wrapper">
                {days && days.map(d => (
                    <div className="d-flex flex-column">
                        <b>{formatDate(d)}</b>
                        {
                            getTimeSlots(d)

                        }
                    </div>
                ))}
            </div>
        )
    } else {
        return (
            <div className="w-100">
                <Row className="mb-2">
                    <Col lg={6}>Monday</Col><Col lg={6}>10:00 AM to 12:00 PM</Col>
                </Row>
                <Row className="mb-2">
                    <Col lg={6}>Tuesday</Col><Col lg={6}>9:00 AM to 11:00 PM</Col>
                </Row>
                <Row className="mb-2">
                    <Col lg={6}>Wednesday</Col><Col lg={6}>10:00 AM to 05:00 PM</Col>
                </Row>
                <Row className="mb-2">
                    <Col lg={6}>Thursday</Col><Col lg={6}>-</Col>
                </Row>
                <Row className="mb-2">
                    <Col lg={6}>Friday</Col><Col lg={6}>10:00 AM to 05:00 PM</Col>
                </Row>
                <Row className="mb-2">
                    <Col lg={6}>Saturday</Col><Col lg={6}>10:00 AM to 05:00 PM</Col>
                </Row>
                <Row className="mb-2">
                    <Col lg={6}>Sunday</Col><Col lg={6}>10:00 AM to 05:00 PM</Col>
                </Row>
            </div>
        )
    }
};

