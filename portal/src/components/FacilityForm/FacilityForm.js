import { Button, Container } from "@material-ui/core";
import React, { useEffect, useState } from "react";
import { Row } from "react-bootstrap";
import {useAxios} from "../../utils/useAxios";
import "./FacilityForm.scss"
import {useKeycloak} from "@react-keycloak/web";
import { API_URL, CONSTANTS, FACILITY_TYPE } from "../../utils/constants";
import { update } from "ramda";
import InputMask from "../InputMask/InputMask";
import WeekDaysSelect from "../WeekDaysSelect";

function FacilityForm({facility, refreshFacility, heading}) {
    const [editFacility, setEditFacility] = useState(false);
    const [editAdmin, setEditAdmin] = useState(false);
    const [users, setUsers] = useState({});
    const [vaccinators, setVaccinators] = useState(0);
    const {keycloak} = useKeycloak();
    const axiosInstance = useAxios('');
    const isFacilityAdmin = () => keycloak.hasResourceRole(CONSTANTS.FACILITY_ADMIN_ROLE, CONSTANTS.PORTAL_CLIENT);
    const isFacilityController = () => keycloak.hasResourceRole(CONSTANTS.ROLE_CONTROLLER, CONSTANTS.PORTAL_CLIENT);

    let activePrograms = facility.programs?.filter(p => p.status === CONSTANTS.ACTIVE);

    function convertTimeInAMPM(timeStr) {
        if (timeStr) {
            const t = timeStr.split(":")
            const hr = t[0];
            const min = t[1];
            const amOrpm = hr < 12 ? "AM" : "PM";
            const modHr = hr % 12;
            return (modHr == 0 ? "12" : modHr) + ":" + (min ? min : "00") + " " + amOrpm;
        }
    }

    function convertTimeIn24Hr(timeStr) {
        if (timeStr) {
            const t = timeStr.split(":")
            const hr = t[0] ? t[0].length === 1 ? "0"+t[0] : t[0]: 0;
            const min = t[1];
            return  hr + ":" + (min ? min : "00");
        }
    }

    
    function fetchFacilityUsers() {
        axiosInstance.current.get('/divoc/admin/api/v1/facility/users', {params: {facilityCode: facility.facilityCode}})
        .then(r => setUsers(r.data));
    }

    function fetchVaccinators() {
        axiosInstance.current.get(API_URL.VACCINATORS_API, {params: {facilityCode: facility.facilityCode}})
        .then(r => setVaccinators(r.data?.length ? r.data.length : 0));
    }
    
    useEffect(() => {
        if (axiosInstance.current) {
            (async function () { 
                await fetchFacilityUsers(); 
                await fetchVaccinators(); 
            })()
        }
    }, [axiosInstance]);

    const setFormData = (f) => {
        const formData =  {
            "facilityName": f.facilityName,
            "licenseNumber": f.licenseNumber,
            "addressLine1": f.address?.addressLine1,
            "addressLine2": f.address?.addressLine2,
            "pincode": f.address?.pincode,
            "contact": f.contact,
            "geoLocation": f.geoLocation,
            "category": f.category,
            "operatingHourStart": f.operatingHourStart,
            "operatingHourEnd": f.operatingHourEnd,
            "websiteUrl": f.websiteUrl,
            "logoUrl": f.logoUrl
        }

        if(f.admins && f.admins.length > 0) {
            formData["adminName"] = f.admins[0]?.name;
            formData["adminContact"] = f.admins[0]?.mobile;
            formData["adminEmail"] = f.admins[0]?.email;
        }

        f.programs?.forEach(p => {
            formData[p.programId+"_days"] = p.schedule?.days;
            formData[p.programId+"_startTime"] = p.schedule?.startTime;
            formData[p.programId+"_endTime"] = p.schedule?.endTime;
        })
        
        return formData
    }
    const data = setFormData(facility);


    const handleChange = (event) => {
        data[event.target.name] = event.target.value;
    }

    const handleDaysChange = (fieldName, days) => {
        console.log(fieldName);
        data[fieldName] = days
        console.log(data[fieldName]);
    }

    const handleSubmit = () => {
        setEditFacility(false);
        const updatedFacility = {...facility, ...data}
        updatedFacility.address.addressLine1 = data.addressLine1;
        updatedFacility.address.addressLine2 = data.addressLine2;
        updatedFacility.address.pincode = data.pincode;

        if(updatedFacility.admins && updatedFacility.admins.length > 0) {
            updatedFacility.admins[0].name = data.adminName;
            updatedFacility.admins[0].mobile = data.adminContact;
            updatedFacility.admins[0].email = data.adminEmail;
        }

        updatedFacility.programs?.forEach(p => {
            p.id = p.programId;
            p.schedule = {
                "days": data[p.programId+"_days"],
                "startTime": data[p.programId+"_startTime"],
                "endTime": data[p.programId+"_endTime"],
            };
        })

        axiosInstance.current
        .put(API_URL.FACILITY_API, [updatedFacility])
        .then((res) => {
            
            //registry update in ES happening async, so calling search immediately will not get back actual data
            setTimeout(() => refreshFacility(), 2000);
        });
    }

    const handleEditAdmin = () => {
        setEditAdmin(false)
        const updatedAdmin = users.filter(u => u.mobileNumber == facility.admins[0].mobile)[0];
        updatedAdmin.name = data.adminName;
        updatedAdmin.mobileNumber = data.adminContact;
        updatedAdmin.email = data.adminEmail;
        updatedAdmin.facilityCode = facility.facilityCode;
        updatedAdmin.osid = facility.admins[0].osid;

        axiosInstance.current
        .put('/divoc/admin/api/v1/facility/users', updatedAdmin).then((res) => {
            //registry update in ES happening async, so calling search immediately will not get back actual data
            setTimeout(() => {
                refreshFacility();
                fetchFacilityUsers();
            }, 2000);
        })
    }

    return <Container style={{"paddingBottom": "100px"}} className="facility-details-form"><form>
            <div className="facility-info-section">
                {isFacilityAdmin() && 
                    <React.Fragment>
                        <h4 style={{"display":"inline-block"}}>Basic Details</h4>
                        <span className="begin-edit" onClick={() => setEditFacility(!editFacility)}>
                            {editFacility ? "cancel" : "edit"}
                        </span>
                    </React.Fragment>
                }
                <Container style={{"columnCount": 2}}>
                    <div>
                        <label className={!editFacility ? "custom-verify-text-label" : "custom-text-label required"}>
                            Name
                        </label>
                        <input className="form-control" type="text" name="facilityName" defaultValue={facility.facilityName} disabled={!editFacility} onChange={handleChange}/>
                    </div>
                    <div>
                        <label className={!editFacility ? "custom-verify-text-label" : "custom-text-label"}>
                            License Number
                        </label>
                        <input className="form-control" type="text" name="licenseNumber" defaultValue={facility.licenseNumber} disabled={!editFacility} onChange={handleChange}/>
                    </div>
                    <div>
                        <label className={!editFacility ? "custom-verify-text-label" : "custom-text-label required"}>
                            Category Type
                        </label>
                        {editFacility &&
                        <Row style={{"columnCount": 2}}>
                            <div className="radio-input"><input type="radio" name="category" checked={facility.category === "PRIVATE"} disabled={!editFacility} onChange={handleChange} value="PRIVATE"/> Private</div>
                            <div className="radio-input"><input type="radio" name="category" checked={facility.category === "GOVT"} disabled={!editFacility} onChange={handleChange} value="GOVT"/> Government</div>
                        </Row>
                        }
                        { !editFacility &&
                        <input className="form-control" type="text" name="facilityCategory" value={facility.category} disabled={!editFacility} onChange={handleChange}/>
                        }
                    </div>
                    <div>
                        <label className={!editFacility ? "custom-verify-text-label" : "custom-text-label required"}>
                            Operating Hours
                        </label>
                        {editFacility &&
                        <React.Fragment>
                            <input type="time" className="form-control time-input"  name="operatingHourStart" defaultValue={convertTimeIn24Hr(facility.operatingHourStart)} disabled={!editFacility} onChange={handleChange}/>
                            <input className="form-control time-input" type="time" name="operatingHourEnd" defaultValue={convertTimeIn24Hr(facility.operatingHourEnd)} disabled={!editFacility} onChange={handleChange}/>
                        </React.Fragment>
                        }
                        {!editFacility &&
                        <div style={{"fontWeight": "normal", height:"48px"}}>
                            <input className="form-control" type="text" disabled={true} value={convertTimeInAMPM(facility.operatingHourStart)+ " - " + convertTimeInAMPM(facility.operatingHourEnd)}/>
                        </div>
                        }
                    </div>
                    <div>
                        <label className={!editFacility ? "custom-verify-text-label" : "custom-text-label required"}>
                            Contact
                        </label>
                        <input className="form-control" type="tel" name="contact" defaultValue={facility.contact} disabled={!editFacility} onChange={handleChange}/>
                    </div>
                    <div>
                        <label className={!editFacility ? "custom-verify-text-label" : "custom-text-label"}>
                            Facility Profile Photo (url)
                        </label>
                        <input className="form-control" type="url" name="logoUrl" placeholder="http://" defaultValue={facility.logoUrl} disabled={!editFacility} onChange={handleChange}/>
                    </div>
                </Container>

                    <h4>Contact Details</h4>
                    <Container  style={{"columnCount": activePrograms?.length === 1 ? 1 : 2}}>
                        <div>
                            <label className={!editFacility ? "custom-verify-text-label" : "custom-text-label required"}>
                                Address
                            </label>
                            <input className="form-control" type="text" name="addressLine1" defaultValue={facility.address?.addressLine1} disabled={!editFacility} onChange={handleChange}/>
                            <input className="form-control" type="text" name="addressLine2" defaultValue={facility.address?.addressLine2} disabled={!editFacility} onChange={handleChange}/>
                        </div>
                        <div>
                            <label className={!editFacility ? "custom-verify-text-label" : "custom-text-label required"}>
                                Pincode
                            </label>
                            <input className="form-control" type="text" name="pincode" defaultValue={facility.address?.pincode} disabled={!editFacility} onChange={handleChange}/>
                        </div>
                        <div>
                            <label className={!editFacility ? "custom-verify-text-label" : "custom-text-label"}>
                                Lat/Long Geo Location
                            </label>
                            <input className="form-control" type="text" name="geoLocation" defaultValue={facility.geoLocation} disabled={!editFacility} onChange={handleChange}/>
                        </div>
                        <div>
                            <label className={!editFacility ? "custom-verify-text-label" : "custom-text-label"}>
                                Website URL
                            </label>
                            <input className="form-control" type="text" name="websiteUrl" defaultValue={facility.websiteUrl} disabled={!editFacility} onChange={handleChange}/>
                        </div>
                     </Container>

                {editFacility && 
                    <Button style={{"margin":"10px 0"}} className="mr-2 blue-btn" variant="outlined" color="primary" onClick={handleSubmit}>SAVE</Button>
                }
            </div>
        </form></Container>}

export default FacilityForm;
