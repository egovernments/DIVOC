import React from 'react';
import styles from './UploadCSV.module.css';
import {ProgressBar} from 'react-bootstrap';

function UploadCSV({ uploadFile, uploadPercentage}) {
    return (
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