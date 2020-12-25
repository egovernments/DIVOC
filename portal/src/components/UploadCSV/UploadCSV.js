import styles from './UploadCSV.module.css';
import './index.css'
import {ProgressBar} from 'react-bootstrap';
import React, {useState} from 'react';
import axios from 'axios'
import {useKeycloak} from "@react-keycloak/web";

function UploadCSV({sampleCSV, fileUploadAPI, onUploadComplete}) {
    const [uploadPercentage, setUploadPercentage] = useState(0);

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
                setUploadPercentage(0)
                alert("Successfully uploaded CSV");
            }, 500);
            onUploadComplete();
        }).catch((error) => {
            if (error.response && error.response.status === 400) {
                setUploadPercentage(0)
                alert(error.response.data["message"]);
            }
        })
    };

    return (
        <div className={styles['container']}>
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
            <div className={styles['progress-bar-container']}>
                <div className={styles['progress-bar']}>{uploadPercentage > 0 && `${uploadPercentage}%`}</div>
                <div>{uploadPercentage > 0 && <ProgressBar now={uploadPercentage} active/>}</div>
            </div>
        </div>
    );
}

export default UploadCSV
