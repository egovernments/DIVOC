import { Button, Container } from "@material-ui/core";
import React, { useEffect, useState } from "react";
import { Row } from "react-bootstrap";
import {useAxios} from "../../utils/useAxios";
import "./FacilityForm.scss"
import {useKeycloak} from "@react-keycloak/web";
import { API_URL, CONSTANTS, FACILITY_TYPE } from "../../utils/constants";
import { update } from "ramda";
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
        updatedFacility.address.pincode = parseInt(data.pincode);

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
                        <h4 style={{"display":"inline-block"}}>Bussiness Details</h4>
                        <span className="begin-edit" onClick={() => setEditFacility(!editFacility)}>
                            {editFacility ? "cancel" : "edit"}
                        </span>
                    </React.Fragment>
                }
                <Container style={{"columnCount": 2}}>
                    <div>
                        <label>
                            <div><b>Name: </b></div>
                            <input type="text" name="facilityName" defaultValue={facility.facilityName} disabled={!editFacility} onChange={handleChange}/>
                        </label>
                    </div>
                    <div>
                        <label>
                            <div><b>Bussiness Registration License Number: </b></div>
                            <input type="text" name="licenseNumber" defaultValue={facility.licenseNumber} disabled={!editFacility} onChange={handleChange}/>
                        </label>
                    </div>
                    <div>
                        <label>
                            <div><b>Address: </b></div>
                            <input type="text" name="addressLine1" defaultValue={facility.address?.addressLine1} disabled={!editFacility} onChange={handleChange}/><br/>
                            <input type="text" name="addressLine2" defaultValue={facility.address?.addressLine2} disabled={!editFacility} onChange={handleChange}/>
                        </label>
                    </div>
                    <div>
                        <label>
                            <div><b>Pincode: </b></div>
                            <input type="number" name="pincode" defaultValue={facility.address?.pincode} disabled={!editFacility} onChange={handleChange}/>
                        </label>
                    </div>
                    <div>
                        <label>
                            <div><b>Contact: </b></div>
                            <input type="tel" name="contact" defaultValue={facility.contact} disabled={!editFacility} onChange={handleChange}/>
                        </label>
                    </div>
                    <div>
                        <label>
                            <div><b>Lat/Long Geo Location: </b></div>
                            <input type="text" name="geoLocation" defaultValue={facility.geoLocation} disabled={!editFacility} onChange={handleChange}/>
                        </label>
                    </div>
                    <div>
                        <label>
                            <div><b>Category Type: </b></div>
                            {editFacility && 
                                <Row style={{"columnCount": 2}}>
                                    <div className="radio-input"><input type="radio" name="category" checked={facility.category === "PRIVATE"} disabled={!editFacility} onChange={handleChange} value="PRIVATE"/> Private</div>
                                    <div className="radio-input"><input type="radio" name="category" checked={facility.category === "GOVT"} disabled={!editFacility} onChange={handleChange} value="GOVT"/> Government</div>
                                </Row>
                            }
                            { !editFacility && 
                                <input type="text" name="facilityCategory" value={facility.category} disabled={!editFacility} onChange={handleChange}/>
                            }
                        </label>
                    </div>
                    <div>
                        <label>
                            <div><b>Operating Hours: </b></div>
                            {editFacility &&
                                <React.Fragment>
                                    <input type="time" className="time-input"  name="operatingHourStart" defaultValue={facility.operatingHourStart} disabled={!editFacility} onChange={handleChange}/> 
                                    <input className="time-input" type="time" name="operatingHourEnd" defaultValue={facility.operatingHourEnd} disabled={!editFacility} onChange={handleChange}/>
                                </React.Fragment>
                            }
                            {!editFacility &&
                                <div style={{"fontWeight": "normal"}}>
                                    {convertTimeInAMPM(facility.operatingHourStart)} - {convertTimeInAMPM(facility.operatingHourEnd)}
                                </div>
                            }
                            
                        </label>
                    </div>
                    <div>
                        <label>
                            <div><b>Website URL: </b></div>
                            <input type="text" name="websiteUrl" defaultValue={facility.websiteUrl} disabled={!editFacility} onChange={handleChange}/>
                        </label>
                    </div>
                    <div>
                        <label>
                            <div><b>Center Profile Image: </b></div>
                            <input type="url" name="logoUrl" defaultValue={facility.logoUrl} disabled={!editFacility} onChange={handleChange}/>
                        </label>
                    </div>
                </Container>

                    <h4>Ongoing Vaccination Programs</h4>
                    <Container  style={{"columnCount": 2}}>
                    { activePrograms?.map(p => 
                        <Container key={p.programId} className="programDiv">
                            <label>
                                <div><b>Name: </b></div>
                                <input type="text" name="programName" defaultValue={p.programId} disabled={!editFacility}/>
                            </label>
                            <label>
                                <div><b>Days: </b></div>
                                <WeekDaysSelect name={p.programId + "_days"} days={p.schedule?.days} onChange={handleDaysChange} disabled={!editFacility}/>
                            </label>
                            <label>
                                <div><b>Hours: </b></div>
                                {editFacility &&
                                    <React.Fragment>
                                        From : <input className="time-input" type="time" name={p.programId + "_startTime"} defaultValue={p.schedule?.startTime} disabled={!editFacility} onChange={handleChange}/>
                                        To : <input className="time-input" type="time" name={p.programId + "_endTime"} defaultValue={p.schedule?.endTime} disabled={!editFacility} onChange={handleChange}/>
                                    </React.Fragment>
                                }
                                { !editFacility &&
                                    <div style={{"fontWeight": "normal"}}>
                                        {convertTimeInAMPM(p.schedule?.startTime)} - {convertTimeInAMPM(p.schedule?.endTime)}
                                    </div>
                                }
                            </label>
                        </Container>         
                    )}
                     </Container>

                {editFacility && 
                    <Button style={{"margin":"10px 0"}} className="mr-2 blue-btn" variant="outlined" color="primary" onClick={handleSubmit}>SAVE</Button>
                }
            </div>
            <div className="facility-info-section">
                <h4>Registered Staff</h4>
                <Container>
                    <div>
                        <label>
                            <div><b>Vaccinators: </b>{vaccinators ? vaccinators : "-"}</div>
                        </label>
                    </div>
                </Container>
            </div>

            <div className="facility-info-section">
                <h4 style={{"display":"inline-block"}}>Adminstrator Details</h4>
                {isFacilityController() && 
                    <span className="begin-edit" onClick={() => setEditAdmin(!editAdmin)}>
                        {editAdmin ? "cancel" : "edit"}
                    </span>
                }
                <Container>
                    {facility && facility.admins && facility.admins[0] &&
                        <div style={{"columnCount": 2}}>
                            <div>
                                <label>
                                    <div><b>Name: </b></div>
                                    <input type="text" name="adminName" defaultValue={facility.admins[0].name} disabled={!editAdmin} onChange={handleChange}/>
                                </label>
                            </div>
                            <div>
                                <label>
                                    <div><b>Contact: </b></div>
                                    <input type="tel" name="adminContact" defaultValue={facility.admins[0].mobile} disabled={!editAdmin} onChange={handleChange}/>
                                </label>
                            </div>
                            <div>
                                <label>
                                    <div><b>Email: </b></div>
                                    <input type="text" name="adminEmail" defaultValue={facility.admins[0].email} disabled={!editAdmin} onChange={handleChange}/>
                                </label>
                            </div>
                        </div>
                    }
               </Container>
               {editAdmin && 
                    <Button style={{"margin":"10px 0"}} className="mr-2 blue-btn" variant="outlined" color="primary" onClick={handleEditAdmin}>SAVE</Button>
                }
            </div>
        </form></Container>}
export default FacilityForm;