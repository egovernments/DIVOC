import React, { useState } from "react";
import "./DetailsCard.css";
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Button from "@material-ui/core/Button";
import AddAdminIcon from "../../assets/img/add-admin.svg";


function DetailsCard({ showCard, setShowCard, data }) {
    console.log("data", data);
    const [editAdmin, setEditAdmin] = useState(false);
    const getInputClass = () => {
        return editAdmin ? "enabled" : "disabled"
    }
    const box = () => {
        return (
            <div >
                <Container className="table-container">
                    <Container className="table-sub-section">
                        <Row>
                            <Col style={{"marginTop": "10px"}}><h4>{data.facilityName}</h4></Col>
                            <Col style={{"textAlign": "right"}}>
                            <Button className="mr-2 blue-btn" variant="outlined" color="primary"
                                onClick={() => setShowCard(!showCard)}>
                                BACK
                            </Button>
                            </Col>
                        </Row>
                        <Row>
                            <Col><b>Address</b></Col>
                            <Col>
                                {data.address.addressLine1},
                                {data.address.addressLine2},
                                {data.address.district},
                                {data.address.state} - {data.address.pincode}
                            </Col>
                        </Row>
                        <Row>
                            <Col><b>Contact Landline Number</b></Col>
                            <Col>{data.contact}</Col>
                        </Row>
                        <Row>
                            <Col><b>Business registration license Number</b></Col>
                            <Col>{data.registrationLicense}</Col>
                        </Row>
                        <Row>
                            <Col><b>Lat/Long geo location</b></Col>
                            <Col>{data.geoLocation}</Col>
                        </Row>
                        <Row>
                            <Col><b>Category Type</b></Col>
                            <Col>{data.category}</Col>
                        </Row>
                        <Row>
                            <Col><b>Centre Seal</b></Col>
                        </Row>
                        <Row>
                            <Col><b>Centre Profile Image</b></Col>
                        </Row>
                    </Container>
                    <Container className="table-sub-section">
                        <Row>
                            <Col><h5>Registered Staff</h5></Col>
                        </Row>
                    </Container>
                    <Container className="table-sub-section">
                        <Row><Col><h5>On-going Vaccination Programs</h5></Col></Row>
                        <Row>
                            <Col><b>Name</b></Col>
                        </Row>
                        <Row>
                            <Col><b>Hours</b></Col>
                        </Row>
                        <Row>
                            <Col><b>Days</b></Col>
                        </Row>
                    </Container>
                    <Container className="table-sub-section">
                        <Row>
                            <Col>
                                <h5 style={{"display":"inline"}}>Administrator Details </h5> 
                                <span className="edit-admin" onClick={() => setEditAdmin(!editAdmin)}>
                                    {editAdmin ? "discard" : "edit"}
                                </span>
                            </Col>
                        </Row>                    
                        <form>
                            {data.admins.map(admin => (
                                <div className="admin-details">
                                <Row>
                                    <Col>
                                        <div><b>Name: </b></div>
                                        <input type="text" name="name" className={getInputClass()} disabled={!editAdmin} defaultValue={admin.name}/>
                                    </Col>
                                    <Col>
                                        <div><b>Email: </b></div>
                                        <input type="text" name="email" className={getInputClass()} disabled={!editAdmin} defaultValue={admin.email}/>
                                    </Col>
                                </Row>
                                <Row>
                                    <Col>
                                        <div><b>Contact Number: </b></div>
                                        <input type="text" name="contact" className={getInputClass()} disabled={!editAdmin} defaultValue={admin.mobile}/>
                                    </Col>
                                </Row>
                                </div>
                            ))}

                            {editAdmin && 
                                <Row><Col>
                                    <img id="add-admin-img" src={AddAdminIcon} alt="Save Adminstrator details" 
                                        onClick={()=>{console.log("HERE")}}
                                    />
                                </Col></Row>
                            }
                        </form>
                    </Container>
                    {editAdmin && <Button style={{"marginTop":"10px"}} className="mr-2 blue-btn" variant="outlined" color="primary">SAVE</Button>}
                    <Button style={{"marginTop":"10px"}} className="mr-2 blue-btn" variant="outlined" color="primary">MESSAGE</Button>
                    <Button className="mr-2 blue-btn" variant="outlined" color="primary" style={{"marginTop": "10px"}}>DELIST FACILITY</Button>
                </Container>
            </div>
        );
    };
    return <div>{showCard ? box() : ""}</div>;
}

export default DetailsCard;
