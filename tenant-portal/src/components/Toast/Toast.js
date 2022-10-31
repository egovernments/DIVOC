import React,{ useState } from 'react';
import { Toast } from 'react-bootstrap';
import './Toast.css';

function ToastComponent({
    header,
    toastBody
}) {
    const [showToast, setShowToast] = useState(true);
    const toggleShow = () => setShowToast(!showToast);

    return (
        <Toast className="toast-container" show={showToast} onClose={toggleShow} >
        <Toast.Header className="toast-header">
            <strong className="mr-auto">{header} </strong>
        </Toast.Header>
        <Toast.Body className="toast-body">
            {toastBody}
        </Toast.Body>
        </Toast>
    );
}

export default ToastComponent;