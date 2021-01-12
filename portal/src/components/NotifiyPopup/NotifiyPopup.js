import React from "react";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";

function NotifyPopup(props) {
    return (
        <div>
            <Modal
                {...props}
                size="lg"
                aria-labelledby="contained-modal-title-vcenter"
                centered
            >
                <Modal.Header closeButton>
                    <Modal.Title id="contained-modal-title-vcenter">
                        Dear Facility Administrator,
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <p>
                        Request you to upload / complete all details pertaining
                        to this facility prior to execution of the C19
                        VaccinationProgram. Failing to do so, this facility: 
                        <br/>- will not be accessible to citizen during the
                        pre-enrolment phase <br/>- will not be able to use the
                        Vaccination App or generate digital certificates
                    </p>
                    <p>Please submit the missing details at the earliest.</p>
                    <b>DIVOC System Administrator</b>
                </Modal.Body>
                <Modal.Footer>
                    <Button onClick={props.onHide}>CANCEL</Button>
                    <Button onClick={props.onSend}>SEND</Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
}

export default NotifyPopup;
