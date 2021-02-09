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



function DetailsCard({ showCard, setShowCard, facility, setFacility,status, updateFacilityProgramStatus }) {
    console.log("data", facility);
    const [editAdmin, setEditAdmin] = useState(false);  
    const getInputClass = () => {
        return editAdmin ? "enabled" : "disabled"
    }

    const box = () => {
        return (<React.Fragment>
            <Row>
                <Col style={{"marginTop": "10px"}}><h4>{facility.facilityName}</h4></Col>
                <Col style={{"textAlign": "right"}}>
                <Button className="mr-2 blue-btn" variant="outlined" color="primary"
                    onClick={() => setShowCard(!showCard)}>
                    BACK
                </Button>
                </Col>
            </Row>
            <FacilityForm facility={facility} setFacility={setFacility}/>
            {status===CONSTANTS.ACTIVE && <Button 
                         className="mr-2 blue-btn" variant="outlined" color="primary" 
                         style={{"marginTop": "10px"}}
                         onClick={()=>{updateFacilityProgramStatus([facility], CONSTANTS.IN_ACTIVE)}}>
                         DELIST FACILITY
            </Button>}
            </React.Fragment>
        );
    };
    return <div>{showCard ? box() : ""}</div>;
}

export default DetailsCard;
