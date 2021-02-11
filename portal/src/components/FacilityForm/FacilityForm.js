import { Button, Container } from "@material-ui/core";
import React, { useEffect, useState } from "react";
import { Row } from "react-bootstrap";
import {useAxios} from "../../utils/useAxios";
import "./FacilityForm.css"
import {useKeycloak} from "@react-keycloak/web";
import { API_URL, CONSTANTS } from "../../utils/constants";
import { update } from "ramda";
import { maskPersonalDetails } from "../../utils/maskPersonalDetails";

function FacilityForm({facility, setFacility, heading}) {
    const isGovtFacility = facility.category === "GOVT";
    const [editFacility, setEditFacility] = useState(false);
    const [editAdmin, setEditAdmin] = useState(false);
    const {keycloak} = useKeycloak();
    const axiosInstance = useAxios('');
    const isFacilityAdmin = () => keycloak.hasResourceRole(CONSTANTS.FACILITY_ADMIN_ROLE, CONSTANTS.PORTAL_CLIENT);
    const isFacilityController = () => keycloak.hasResourceRole(CONSTANTS.ROLE_CONTROLLER, CONSTANTS.PORTAL_CLIENT);


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
            formData["adminName"] = f.admins[0].name;
            formData["adminContact"] = f.admins[0].mobile;
            formData["adminEmail"] = f.admins[0].email;
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

    const handleSubmit = () => {
        console.log(data);
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
            p.schedule = {
                "days": data[p.programId+"_days"],
                "startTime": data[p.programId+"_startTime"],
                "endTime": data[p.programId+"_endTime"],
            }
        })

        axiosInstance.current
        .put(API_URL.FACILITY_API, [updatedFacility])
        .then((res) => {
            console.log(res);
            //registry update in ES happening async, so calling search immediately will not get back actual data
            // setTimeout(() => setFacility(), 2000);
        });
    }

    return <Container style={{"paddingBottom": "100px"}}><form>
            <div className="facility-info-section">
                {isFacilityAdmin() && 
                    <React.Fragment>
                        <h4 style={{"display":"inline"}}>Bussiness Details</h4>
                        <span className="begin-edit" onClick={() => setEditFacility(!editFacility)}>
                            {editFacility ? "discard" : "edit"}
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
                            <input type="text" name="pincode" defaultValue={facility.address?.pincode} disabled={!editFacility} onChange={handleChange}/>
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
                            <Row style={{"columnCount": 2}}>
                                <div className="radio-input"><input type="radio" name="category" defaultChecked={!isGovtFacility} disabled={!editFacility} onChange={handleChange}/> Private</div>
                                <div className="radio-input"><input type="radio" name="category" defaultChecked={isGovtFacility} disabled={!editFacility} onChange={handleChange}/> Government</div>
                            </Row>
                        </label>
                    </div>
                    <div>
                        <label>
                            <div><b>Operating Hours: </b></div>
                            <input type="time" className="time-input"  name="operatingHourStart" defaultValue="09:00" disabled={!editFacility} onChange={handleChange}/> 
                            To <input className="time-input" type="time" name="operatingHourEnd" defaultValue="18:00" disabled={!editFacility} onChange={handleChange}/>
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
                <Container style={{"columnCount": 2}}>
                    { facility.programs?.map(p => 
                        <div key={p.programId} className="programDiv">
                            <div><label>
                                <div><b>Name: </b></div>
                                <input type="text" name="programName" defaultValue={p.programId} disabled={!editFacility}/>
                            </label></div>
                            <div><label>
                                <div><b>Days: </b></div>
                                <input type="text" name={p.programId + "_days"} defaultValue={p.schedule?.days} disabled={!editFacility} onChange={handleChange}/>
                            </label></div>
                            <div><label>
                                <div><b>Hours: </b></div>
                                <input className="time-input" type="time" name={p.programId + "_startTime"} defaultValue={p.schedule?.startTime} disabled={!editFacility} onChange={handleChange}/>
                                To <input className="time-input" type="time" name={p.programId + "_endTime"} defaultValue={p.schedule?.endTime} disabled={!editFacility} onChange={handleChange}/>
                            </label></div>
                        </div>
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
                            <div><b>Vaccinators: </b>{facility.vaccinatorCount ? facility.vaccinatorCount : " - "}</div>
                        </label>
                    </div>
                </Container>
            </div>

            <div className="facility-info-section">
                <h4 style={{"display":"inline-block"}}>Adminstrator Details</h4>
                {isFacilityController() && 
                    <span className="begin-edit" onClick={() => setEditAdmin(!editAdmin)}>
                        {editAdmin ? "discard" : "edit"}
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
                                    <EditAdminInput 
                                        type="tel" 
                                        name="adminContact"
                                        defaultValue={facility.admins[0].mobile}
                                        disabled={!editAdmin}
                                        handleChange={handleChange}
                                    />
                                </label>
                            </div>
                            <div>
                                <label>
                                    <div><b>Email: </b></div>
                                    <EditAdminInput 
                                        type="text"
                                        name="adminEmail" 
                                        defaultValue={facility.admins[0].email}
                                        disabled={!editAdmin} 
                                        handleChange={handleChange}
                                    />
                                </label>
                            </div>
                        </div>
                    }
               </Container>
               {editAdmin && 
                    <Button style={{"margin":"10px 0"}} className="mr-2 blue-btn" variant="outlined" color="primary" onClick={handleSubmit}>SAVE</Button>
                }
            </div>
        </form></Container>}

function EditAdminInput({type,name,defaultValue,disabled,handleChange}){
    return(
        <input 
            type={type} 
            name={name} 
            defaultValue={maskPersonalDetails(defaultValue)}
            disabled={disabled} 
            onBlur={(evt) => evt.target.value = maskPersonalDetails(evt.target.value)}
            onFocus={(evt) => evt.target.value = defaultValue} 
            onChange={handleChange}/>
    )
}
export default FacilityForm;