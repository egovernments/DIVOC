import React, {useEffect, useState} from "react";
import "./index.css";
import {Button, Col, Modal, Row} from "react-bootstrap";
import {TextInputWithIcon} from "../TextInputWithIcon";
import CloseImg from "../../assets/img/icon-cross.svg"
import PrivateSvg from "../../assets/img/icon-private.svg"
import GovernmentSvg from "../../assets/img/icon-government.svg"
import {formatDate} from "../../utils/CustomDate";
import {CustomButton} from "../CustomButton";
import Img from "../../assets/img/icon-search.svg"
import {useHistory} from "react-router-dom";
import axios from "axios";
import {equals, reject} from "ramda";
import {Loader} from "../Loader";
import {getCookie} from "../../utils/cookies";
import {CITIZEN_TOKEN_COOKIE_NAME} from "../../constants";

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
    const [facilitySlots, setFacilitySlots] = useState({});
    const [facilitiesSchedule, setFacilitiesSchedule] = useState({});

    function triggerSearchFacilityAPI() {
        if (searchText && searchText.length <= 3) {
            return;
        }
        if (searchText === "" || searchText.length > 3) {
            setIsLoading(true);
            let params = {
                // pincode: searchText
            };
            params = reject(equals(''))(params);
            const queryParams = new URLSearchParams(params);
            axios.get("/divoc/admin/api/v1/public/facilities", {params: queryParams})
                .then(res => {
                    const {facilities, facilitiesSchedule} = res.data;
                    let data = facilities.map(d => {
                        return d
                    });
                    let schedule = {};
                    facilitiesSchedule.map(d => {
                        if (d.facilityId) {
                            schedule[d.facilityId] = d
                        }
                    });
                    data = data.filter(d => ("" + d.address.pincode).startsWith(searchText) && d.osid in schedule);
                    setFacilities(data);
                    setFacilitiesSchedule(schedule);
                    setIsLoading(false);
                });
        }
    }

    useEffect(() => {
        triggerSearchFacilityAPI();
    }, []);

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
                <FacilityAllotment facilitySlots={facilitySlots} facilitySchedule={facilitiesSchedule[facility.osid]}
                                   showModal={(allotmentDate, allotmentTime, slotKey) => {
                                       setShowModal(true)
                                       setSelectedAllotment({
                                           facilityId: facility.osid,
                                           facilityName: facility.facilityName,
                                           facilityAddress: facility.address,
                                           allotmentDate,
                                           allotmentTime,
                                           slotKey
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

    function getSlotsForFacility(facilityIndex, pageNumber = 0) {
        setSelectedFacilityIndex(facilityIndex);
        const facilityId = facilities[facilityIndex].facilityCode;
        setIsLoading(true);
        let params = {
            facilityId,
            pageNumber
        };
        params = reject(equals(''))(params);
        const queryParams = new URLSearchParams(params);
        axios.get("/divoc/api/citizen/facility/slots", {params: queryParams})
            .then(res => {
                const {keys, slots} = res.data;
                const dayWiseSlotsInfo = {};
                for (let i = 0; i < keys.length; i++) {
                    const slotInfo = keys[i].split("_");
                    const slotDate = slotInfo[2];
                    const slotStartTime = slotInfo[3];
                    const slotStopTime = slotInfo[4];
                    if (!(slotDate in dayWiseSlotsInfo)) {
                        dayWiseSlotsInfo[slotDate] = {}
                    }
                    dayWiseSlotsInfo[slotDate][slotStartTime] = {
                        time: `${slotStartTime}-${slotStopTime}`,
                        slots: slots[i],
                        key: keys[i]
                    }
                }
                setFacilitySlots(dayWiseSlotsInfo);
                setIsLoading(false);
            })
            .catch(err => {
                alert("something went wrong");
                setIsLoading(false);
            });
    }

    function bookSlot() {
        const token = getCookie(CITIZEN_TOKEN_COOKIE_NAME);
        const config = {
            headers: {"recipientToken": token, "Content-Type": "application/json"},
        };

        axios.post("/divoc/api/citizen/facility/slot/book", {
            enrollmentCode: enrollment_code,
            facilitySlotId: selectedAllotment.slotKey
        }, config)
            .then(res => {
                history.push("/" + enrollment_code + "/appointment/confirm")
            })
            .catch(() => {
                alert("Something went wrong. Please try again");
                setShowModal(false)
                getSlotsForFacility(selectedFacilityIndex)
            });
    }

    return (
        <div className="appointment-container">
            {isLoading && <Loader/>}
            <div className="card-container">
                <div className="header-group">
                    <h3>Select Facility</h3>
                    <span className="appointment-back-btn cursor-pointer" onClick={() => {
                        history.push("/registration")
                    }}>Back</span>
                </div>
                <Row>
                    <Col lg={6}>
                        <TextInputWithIcon onClick={triggerSearchFacilityAPI} title={"Search by Pincode"} value={searchText} onChange={setSearchText}
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
                                             getSlotsForFacility(index)
                                         }}>
                                        <div className="d-flex justify-content-between">
                                            <b>{facility.facilityName}</b>
                                            {
                                                facility.category === "GOVT" ?
                                                    <img src={GovernmentSvg} title={facility.category}/> :
                                                    <img src={PrivateSvg} title={facility.category}/>
                                            }
                                        </div>
                                        <div>{formatAddress(facility.address)}
                                            <div>
                                                <span
                                                    className="badge purple">{facility.osid in facilitiesSchedule && facilitiesSchedule[facility.osid].walkInSchedule.length > 0 && "Walk-in"}</span>
                                                <span
                                                    className="badge green">{facility.osid in facilitiesSchedule && facilitiesSchedule[facility.osid].appointmentSchedule.length > 0 && "Appointments"}</span>
                                            </div>
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
                        <span>For {name}</span>
                        <span className="text-center mt-1">{getFacilityDetails()}</span>
                        <span className="mt-1">{formatDate(selectedAllotment.allotmentDate)}</span>
                        <span className="mt-1">{selectedAllotment.allotmentTime}</span>
                        <CustomButton className="blue-btn" onClick={() => {
                            bookSlot()
                        }}>CONFIRM</CustomButton>
                    </div>
                </div>
            </Modal>
        </div>
    )
};

const FacilityAllotment = ({facilitySlots, showModal, facilitySchedule}) => {
    if (Object.keys(facilitySlots).length > 0) {
        const dates = Object.keys(facilitySlots);
        const timeStamps = new Set();
        const timeStampWiseSlots = {};
        for (const [key, value] of Object.entries(facilitySlots)) {
            Object.values(value).forEach(v => {
                timeStamps.add(v.time);
                if (!(v.time in timeStampWiseSlots)) {
                    timeStampWiseSlots[v.time] = {}
                }
                timeStampWiseSlots[v.time][key] = v;
            });
        }
        const dateWiseWalkinInfo = {};
        const weekdays = {
            0: "sun",
            1: "mon",
            2: "tue",
            3: "wed",
            4: "thu",
            5: "fri",
            6: "sat",
        };
        if (facilitySchedule && facilitySchedule.walkInSchedule.length > 0 && facilitySchedule.walkInSchedule[0].days.length > 0) {
            dates.forEach(d => {
                const toDate = new Date(d);
                let schedule = facilitySchedule.walkInSchedule[0];
                if (schedule.days.includes(weekdays[toDate.getDay()])) {
                    dateWiseWalkinInfo[d] = `${schedule.startTime} - ${schedule.endTime}`
                } else {
                    dateWiseWalkinInfo[d] = "-"
                }
            })
        }
        return (
            <div className="overflow-auto">
                <table>
                    <tbody>
                    <tr>
                        <td className="text-nowrap pl-3 pr-3 font-weight-bold"/>
                        {
                            dates.map(date => <td
                                className="text-nowrap pl-3 pr-3 font-weight-bold slot-booking-header">{date.length > 0 ? formatDate(date) : date}</td>)
                        }
                    </tr>
                    {
                        [...timeStamps].map(ts => (
                            <tr>
                                <td className="text-nowrap ">{ts}</td>
                                {
                                    dates.map(date => {
                                        if (date in timeStampWiseSlots[ts]) {
                                            let slots = timeStampWiseSlots[ts][date].slots;
                                            return (
                                                <td className="text-nowrap text-center">
                                                    <Button
                                                        variant="outline-primary"
                                                        onClick={() => {
                                                            if (slots != 0) {
                                                                showModal(date, ts, timeStampWiseSlots[ts][date].key)
                                                            }
                                                        }}
                                                        className={`slot-booking-btn mt-3 mb-3 ${slots == 0 && "slot-booking-btn-disabled"}`}>{slots}</Button>
                                                </td>
                                            )
                                        } else {
                                            return (<td className="text-nowrap"/>)
                                        }
                                    })
                                }
                            </tr>
                        ))
                    }
                    {
                        Object.keys(dateWiseWalkinInfo).length > 0 && <tr>
                            <td className="text-nowrap text-center">Walkin</td>
                            {
                                dates.map(date => {
                                    return <td className="text-nowrap text-center">{dateWiseWalkinInfo[date]}</td>
                                })
                            }
                        </tr>
                    }
                    </tbody>
                </table>
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

