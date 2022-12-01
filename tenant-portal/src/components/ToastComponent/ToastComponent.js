import React,{ useState, useEffect } from 'react';
import {ToastContainer} from 'react-bootstrap';
import { Toast } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';

const ToastComponent = (props) => {
    const [showToast, setShowToast] = useState(true);
    const toggleShow = () => setShowToast(!showToast);
  return (
    <div>
    <ToastContainer position={props.position} className={props.className}>
        <Toast onClose={toggleShow} bg={props.variant} show={showToast}
            delay = {props.delay? props.delay: 3000} >
             <Toast.Header>
                <strong className='me-auto'>{props.header}</strong>
            </Toast.Header>
            {props.toastBody && <Toast.Body>{props.toastBody}</Toast.Body>}
        </Toast>
    </ToastContainer></div>
    )
}

export default ToastComponent;
