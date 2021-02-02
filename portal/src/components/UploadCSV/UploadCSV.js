import styles from './UploadCSV.module.css';
import './index.css'
import {ProgressBar} from 'react-bootstrap';
import React, {useState} from 'react';
import axios from 'axios'
import {useKeycloak} from "@react-keycloak/web";
import Toast from 'react-bootstrap/Toast';
import Button from 'react-bootstrap/Button';

function UploadCSV({sampleCSV, fileUploadAPI, onUploadComplete,uploadHistoryCount,handleShow,errorCount}) {
    const [uploadPercentage, setUploadPercentage] = useState(0);
    const [showToast, setShowToast] = useState(false);

    const {keycloak} = useKeycloak();

    const uploadFile = (evt) => {
        const fileData = evt.target.files[0];
        let dataToSend = new FormData();
        dataToSend.append('file', fileData);

        const config = {
            headers: {"Authorization": `Bearer ${keycloak.token} `, "Content-Type": "application/json"},
            onUploadProgress: (progressEvent) => {
                const {loaded, total} = progressEvent;
                let percent = Math.floor((loaded * 100) / total);
                setUploadPercentage(percent)
            }
        };
        setUploadPercentage(1);
        axios.post(fileUploadAPI, dataToSend, config).then(res => {
            setTimeout(() => {
                setUploadPercentage(0);
                setShowToast(true);
            }, 500);
            onUploadComplete();
        }).catch((error) => {
            if (error.response && error.response.status === 400) {
                setUploadPercentage(0)
                alert(error.response.data["message"]);
            }
        })
    };

    function uploadingToastBody () {
        return(
            <div>
                <span>File Uploaded</span>&emsp;
                <ProgressBar variant="success" now={uploadPercentage} active/>
                <span>{uploadPercentage > 0 && `${uploadPercentage}%`}</span>
            </div>
        )
    }

    function uploadedToastBody() {
        return(
            <div className="d-flex justify-content-between">
                <p>{errorCount} Errors Found</p>
                <Button style={{background: "#FC573B"}} onClick={()=>{handleShow()}}>VIEW</Button>
            </div>
        )
    }
    return (
        <div className={styles['container'] + " d-flex justify-content-end"}>
            <div className={styles['progress-bar-container']}>
            {uploadPercentage>0 && <ToastComponent header={uploadHistoryCount} toastBody={uploadingToastBody()} />}
            </div>
            {showToast && <ToastComponent header={uploadHistoryCount} toastBody={uploadedToastBody()} />}
            <div>
                <input
                    type='file'
                    id='actual-btn'
                    onChange={(evt) =>
                        uploadFile(evt)
                    }
                    value={""}
                    accept=".csv"
                    hidden
                    required
                />
                <label
                    htmlFor='actual-btn'
                    className={styles['button']}
                >
                    UPLOAD CSV
                </label>
                {sampleCSV && <div className="sample-link">
                    <a href={sampleCSV} download>
                        Download sample CSV
                    </a>
                </div>}
            </div>
        </div>
    );
}

function ToastComponent({
    header,
    toastBody
}) {
    const [showToast, setShowToast] = useState(true);
    const toggleShow = () => setShowToast(!showToast);

    return (
        <Toast className="toast-container" show={showToast} onClose={toggleShow} >
        <Toast.Header className="toast-header">
            <strong className="mr-auto">{header} Records Uploaded</strong>
        </Toast.Header>
        <Toast.Body>
            {toastBody}
        </Toast.Body>
        </Toast>
    );
}

export default UploadCSV
