import React, {useEffect, useState} from "react";
import "./index.css";
import {Button, Col, Modal, Row} from "react-bootstrap";
import {TextInputWithIcon} from "../TextInputWithIcon";
import CloseImg from "../../assets/img/icon-cross.svg"
import PrivateSvg from "../../assets/img/icon-private.svg"
import statusAppointmentImg from "../../assets/img/status-appointment.png"
import statusWalkInImg from "../../assets/img/status-walkin.png"
import GovernmentSvg from "../../assets/img/icon-government.svg"
import {formatDateForSlot, formatDateLong, formatTimeInterval12hr} from "../../utils/CustomDate";
import {CustomButton} from "../CustomButton";
import Img from "../../assets/img/icon-search.svg"
import {useHistory} from "react-router-dom";
import axios from "axios";
import {equals, reject} from "ramda";
import {Loader} from "../Loader";
import {getCookie} from "../../utils/cookies";
import {CITIZEN_TOKEN_COOKIE_NAME} from "../../constants";
import {getMeridiemTime} from "../../utils/dateUtils";

export const Appointment = (props) => {
    const {enrollment_code, program_id: programId} = props.match.params;
    const {state} = props.location;
    const history = useHistory();
    const [isLoading, setIsLoading] = useState(false);
    const [searchText, setSearchText] = useState(state?.recipientPinCode || "");
    const [facilities, setFacilities] = useState([]);
    const [selectedFacilityIndex, setSelectedFacilityIndex] = useState(-1);
    const [showModal, setShowModal] = useState(false);
    const [selectedAllotment, setSelectedAllotment] = useState({});
    const [facilitySlots, setFacilitySlots] = useState({});
    const [facilitiesSchedule, setFacilitiesSchedule] = useState({});
    const [searchLabel, setSearchLabel] = useState("");

    function triggerSearchFacilityAPI() {
        if (searchText && searchText.length <= 3) {
            return;
        }
        if (state === undefined) {
            history.push("/registration")
            return;
        }
        if (searchText.length > 3) {
            setIsLoading(true);
            let params = {
                pincode: searchText
            };
            axios.get("/divoc/admin/api/v1/public/facilities", {params: params})
                .then(res => {
                    let {facilities, facilitiesSchedule} = res.data;
                    facilities = facilities.filter(f => f.programs.filter(p => p.programId == programId).length > 0)
                    facilitiesSchedule = facilitiesSchedule.filter(fs => fs.programId == programId)
                    let schedule = {};
                    (facilitiesSchedule||[]).map(d => {
                        if (d.facilityId) {
                            schedule[d.facilityId] = d
                        }
                    });
                    setFacilities(facilities.filter(d => d.osid in schedule));

                    let s = facilities.filter(d => d.osid in schedule).length > 0 ? "Availability for next few days" :
                        "No results found";
                    setSearchLabel(s)
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
            facility && <div className="p-3 allotment-wrapper" style={{border: "1px solid #d3d3d3"}}>
                <div className="d-flex justify-content-between align-items-center">
                    <h5>Available Time Slots for {facility?.facilityName}</h5>
                    <img src={CloseImg} className="cursor-pointer" alt={""}
                         onClick={() => setSelectedFacilityIndex(-1)}/>
                </div>
                <FacilityAllotment facilitySlots={facilitySlots} facilitySchedule={facilitiesSchedule[facility?.osid]}
                                   showModal={(allotmentDate, allotmentTime, slotKey) => {
                                       if (facility) {
                                           setShowModal(true)
                                           setSelectedAllotment({
                                               facilityId: facility.osid,
                                               facilityName: facility.facilityName,
                                               facilityAddress: facility.address,
                                               allotmentDate,
                                               allotmentTime,
                                               slotKey
                                           })
                                       }
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

    function getSlotsForFacility(facilityIndex, pageNumber = 0, pageSize=12) {
        setSelectedFacilityIndex(facilityIndex);
        const facilityId = facilities[facilityIndex].facilityCode;
        setIsLoading(true);
        let params = {
            facilityId,
            programId,
            pageNumber,
            pageSize
        };
        params = reject(equals(''))(params);
        const token = getCookie(CITIZEN_TOKEN_COOKIE_NAME);
        const queryParams = new URLSearchParams(params);
        const config = {
            headers: {"Authorization": token, "Content-Type": "application/json"},
            params: queryParams
        };

        axios.get("/divoc/api/citizen/facility/slots", config)
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
            headers: {"Authorization": token, "Content-Type": "application/json"},
        };

        axios.post("/divoc/api/citizen/appointment", {
            enrollmentCode: enrollment_code,
            facilitySlotId: selectedAllotment.slotKey,
            programId: programId,
            // dose func is not yet configured
            dose: state.dose.toString()
        }, config)
            .then(res => {
                history.push({
                    pathname:"/" + enrollment_code + "/appointment/confirm",
                    state:{identity: state.identity, program: state.program}
                })
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
                <div className="header-group mb-2">
                    <h3>Book Appointment</h3>
                    <span className="appointment-back-btn cursor-pointer" onClick={() => {
                        history.push("/registration")
                    }}>Back</span>
                </div>
                <p>Select Facility center to book appointment for {state.name}</p>
                <Row>
                    <Col lg={6}>
                        <TextInputWithIcon onClick={triggerSearchFacilityAPI} title={"Search by Pincode"}
                                           value={searchText} onChange={setSearchText}
                                           img={Img}/>
                    </Col>

                </Row>
                <br/>
                <h4>
                    {searchLabel}
                </h4>
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
                                                <img
                                                    hidden={!(facility.osid in facilitiesSchedule && facilitiesSchedule[facility.osid].appointmentSchedule?.length > 0)}
                                                    src={statusAppointmentImg} height="17px"/>
                                                <img
                                                    hidden={!(facility.osid in facilitiesSchedule && facilitiesSchedule[facility.osid].walkInSchedule?.length > 0)}
                                                    src={statusWalkInImg} height="17px"/>
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
                    <div className="d-flex">
                        <div/>
                        <h5>Confirm Appointment Details </h5>
                    </div>
                    <div className="d-flex flex-column">
                        <span>For {state && state.name}</span>
                        <span className="mt-2">{getFacilityDetails()}</span>
                        <span className="mt-2">{formatDateLong(selectedAllotment.allotmentDate)}</span>
                        <span className="mt-1">{formatTimeInterval12hr(selectedAllotment.allotmentTime)}</span>
                    </div>
                    <Row>
                        <Col style={{"margin": "15px"}}>
                            <Button variant="outline-light" onClick={() => {
                                setShowModal(false)
                            }}>
                                <span className="cancel-btn-appnt">
                                    CANCEL
                                </span>
                            </Button>
                        </Col>
                        <Col>
                            <CustomButton className="blue-btn" onClick={() => {
                                bookSlot()
                            }}>CONFIRM</CustomButton>
                        </Col>
                    </Row>
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
                    dateWiseWalkinInfo[d] = `${getMeridiemTime(schedule.startTime)} - ${getMeridiemTime(schedule.endTime)}`
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
                        <td style={{paddingLeft: "2.4rem"}} className="text-nowrap font-weight-bold"/>
                        {
                            dates.map(date => <td style={{paddingLeft: "2.4rem"}}
                                className="text-nowrap font-weight-bold slot-booking-header">{date.length > 0 ? formatDateForSlot(date) : date}</td>)
                        }
                    </tr>
                    {
                        [...timeStamps].sort().map(ts => {
                            const [startTime, endTime] = ts.split('-');
                            console.log(ts, startTime, endTime);
                            return (
                                <tr>
                                    <td className="text-nowrap ">{getMeridiemTime(startTime)} - {getMeridiemTime(endTime)}</td>
                                    {
                                        dates.map(date => {
                                            if (timeStampWiseSlots[ts][date]?.slots) {
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
                            );
                        })
                    }
                    {
                        Object.keys(dateWiseWalkinInfo).length > 0 && <tr>
                            <td className="text-nowrap text-center pl-2 pr-2">Walkin</td>
                            {
                                dates.map(date => {
                                    return <td className="text-nowrap text-center pl-2 pr-2">{dateWiseWalkinInfo[date]}</td>
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

