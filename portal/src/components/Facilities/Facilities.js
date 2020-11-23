import React, { useState } from 'react';
import {ProgressBar} from 'react-bootstrap';
import axios from 'axios'
import styles from './Facilities.module.css';
function Facilities(){
    const [uploadPercentage,setUploadPercentage] = useState(0);

    const uploadFile = (evt) => {
        const fileData = evt.target.files[0]
        let data = new FormData();
        data.append( 'file', fileData )

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
            headers: { "Authorization": "Bearer abcd", "Content-Type": "application/json"}
        };
        axios.post("divoc/admin/api/v1/facilities", data, config ,options).then(res => { 
            console.log(res)
            setUploadPercentage( 100)
            setTimeout(() => {
            setUploadPercentage(0)
            }, 500);
        })
    }
    return(
        <div className={styles['container']}>
            <div>
                <input
                    type='file'
                    id='actual-btn'
                    onChange={(evt) =>
                        uploadFile(evt)
                    }
                    accept=".csv"
                    hidden
                    required
                />
                <label
                    for='actual-btn'
                    className={styles['button']}
                >
                    UPLOAD CSV
                </label>
            </div>
            <div className={styles['progress-bar-container']}>
                <div className={styles['progress-bar']}>{uploadPercentage>0 && `${uploadPercentage}%`}</div>
                <div>{uploadPercentage>0 && <ProgressBar now={uploadPercentage} active/>}</div>
            </div>
            
        </div>
    );
}
export default Facilities;