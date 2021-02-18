import {Container} from "react-bootstrap";
import React from "react";
import {CustomButton} from "../../CustomButton";
import {useHistory} from "react-router-dom";
import check from "../../../assets/img/check.png";

export const Success = ({ formData, programs}) => {
    const history = useHistory();

    let programName = programs.filter(p => p.osid === formData.programId)[0].name
    return (
        <Container fluid>
            <div className="side-effect-container">
                <img className="pb-1" src={check}/>
                <h3>Successfully registered for {programName ? programName : ''}</h3>
                <div className="pt-3">
                    <h4>Beneficiary Name: {formData.name}</h4>
                </div>
                <div className="pt-3">
                    <p>Enrolment details will be sent to <br/> {formData.email ? formData.email.concat(" and"): ''} {formData.contact}</p>
                </div>
                <div className="pt-3">
                    <p>On day of vaccination, please carry same ID proof used for registration</p>
                </div>
                <CustomButton className="green-btn" type="submit" onClick={() => history.push("/registration")}>
                    <span>Done</span>
                </CustomButton>
            </div>
        </Container>
    )
}
