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

                </Modal.Header>
                <Modal.Body>
                    <span dangerouslySetInnerHTML={{__html: props.message}}>

                    </span>
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
