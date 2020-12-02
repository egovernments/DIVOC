import styles from './UploadCSV.module.css';
import {ProgressBar} from 'react-bootstrap';
import React, { useState } from 'react';
import axios from 'axios'
import {useKeycloak} from "@react-keycloak/web";

function UploadCSV({ fileUploadAPI, onUploadComplete }) {
    const [uploadPercentage,setUploadPercentage] = useState(0);

    const { keycloak } = useKeycloak();

    const uploadFile = (evt) => {
        const fileData = evt.target.files[0]
        let dataToSend = new FormData();
        dataToSend.append( 'file', fileData )

        const options = {
            onUploadProgress: (progressEvent) => {
              const {loaded, total} = progressEvent;
              let percent = Math.floor( (loaded * 100) / total )
              console.log( `${loaded}kb of ${total}kb | ${percent}%` );
      
              if( percent < 100 ){
                setUploadPercentage(percent )
              }
            }
          }
        
        const config = {
            headers: { "Authorization": `Bearer ${keycloak.token} `, "Content-Type": "application/json"}
        };
        axios.post(fileUploadAPI, dataToSend, config ,options).then(res => { 
            alert("Status code is",res.status)
            console.log(res)
            setUploadPercentage( 100)
            setTimeout(() => {
            setUploadPercentage(0)
            }, 500);
            onUploadComplete();
        })
    }

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
            </div>
            <div className={styles['progress-bar-container']}>
                <div className={styles['progress-bar']}>{uploadPercentage>0 &&`${uploadPercentage}%`}</div>
                <div>{uploadPercentage>0 && <ProgressBar now={uploadPercentage} active/>}</div>
            </div>
        </div>
    );
}

export default UploadCSV