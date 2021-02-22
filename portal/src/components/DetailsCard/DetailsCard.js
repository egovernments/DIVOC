import React, { useState } from "react";
import "./DetailsCard.css";
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Button from "@material-ui/core/Button";
import AddAdminIcon from "../../assets/img/add-admin.svg";
import { CONSTANTS} from "../../utils/constants";
import {Header} from "../Header";
import FacilityForm from "../FacilityForm/FacilityForm";



function DetailsCard({ showCard, setShowCard, facility, fetchFacilities,status, updateFacilityProgramStatus }) {
    console.log("data", facility);
    const box = () => {
        return (<Container id="details-card">
            <Row>
                <Col style={{"marginTop": "10px"}}><h4>{facility.facilityName}</h4></Col>
                <Col style={{"textAlign": "right"}}>
                <Button className="mr-2 blue-btn" variant="outlined" color="primary"
                    onClick={() => setShowCard(!showCard)}>
                    BACK
                </Button>
                </Col>
            </Row>
            <FacilityForm facility={facility} refreshFacility={fetchFacilities}/>
            {status===CONSTANTS.ACTIVE && <Button 
                         className="mr-2 blue-btn" variant="outlined" color="primary" 
                         style={{"marginTop": "10px"}}
                         onClick={()=>{updateFacilityProgramStatus([facility], CONSTANTS.IN_ACTIVE)}}>
                         DELIST FACILITY
            </Button>}
            </Container>
        );
    };
    return <React.Fragment>{showCard ? box() : ""}</React.Fragment>;
}

export default DetailsCard;
