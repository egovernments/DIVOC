import React, { useEffect, useState } from "react";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";
import { Form, FormGroup } from "react-bootstrap";
import styles from "./NotifyPopup.module.css"

function NotifyPopup(props) {
    const [notification, setNotification] = useState({});
    const [error, setError] = useState("");

    useEffect(() => {
        setError("");
        setNotification({});
    }, [props]);

    function handleChange(e) {
        setNotification({...notification, [e.target.name]: e.target.value});
        if (error) {
            validate();
        }
    }

    function validate() {
        let err = ""
        if (!notification.message || notification.message.length < 4) {
            err = "Message should be atleast 5 characters long";
        }
        setError(err);
        return !err;
    }

    function handleSend() {
        if (validate()) {
            props.onSend(notification);
        }
    }

    return (
        <div>
            <Modal
                {...props}
                size="lg"
                aria-labelledby="contained-modal-title-vcenter"
                centered>
                
                <Modal.Header className={styles["header"]}>
                    <h4>Notify Facility Administrator</h4>
                </Modal.Header>
            
                <Modal.Body>
                    <FormGroup>
                        <Form.Control name="subject" type="text" placeholder="Subject" onChange={handleChange}/>
                    </FormGroup>
                    <Form.Group>
                        <Form.Control name="message" as="textarea" rows={5} onChange={handleChange} placeholder="Enter Message"/>
                        <span className={styles["err-msg"]}>{error}</span>
                    </Form.Group>
                </Modal.Body>
            
                <Modal.Footer>
                    <Button onClick={props.onHide}>CANCEL</Button>
                    <Button onClick={handleSend}>SEND</Button>
                </Modal.Footer>
            
            </Modal>
        </div>
    );
}

export default NotifyPopup;
