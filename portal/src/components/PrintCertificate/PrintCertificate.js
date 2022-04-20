import React, { useState} from "react";
import {Spinner} from "react-bootstrap";
import styles from "./PrintCertificate.module.css";
import {API_URL} from "../../utils/constants";
import {useAxios} from "../../utils/useAxios";
import { CustomDateWidget } from "../CustomDateWidget";
import { CustomButton } from "../CustomButton";
import { CustomTextWidget } from "../CustomTextWidget";
import { formatYYYYMMDDDate } from "../../utils/dateutil";

function PrintCertificate() {
    const today = new Date();
    const [tableData,setTableData] = useState([]);
    const [options, setOptions] = useState({maxDate: today});
    const [mobileNumber, setMobileNumber] = useState('');
    const [dob, setDob] = useState(today);
    const axiosInstance = useAxios('');
    const [showSpinner, setShowSpinner] = useState(false);


    function fetchCertificates() {
        setShowSpinner(true);
        axiosInstance.current.get(API_URL.SEARCH_CERTIFICATE_API.replace(':dob', formatYYYYMMDDDate(dob)).replace(':phoneno', mobileNumber))
            .then(res => {
                setTableData(res.data);
                setShowSpinner(false);
                return res.data;
            })
            .then(res => {
                if(res.length === 0) {
                    alert('No Certificates Found for mentioned Phone no and Date of Birth');
                }
            })
            .catch(err => {
                setShowSpinner(false);
                alert(err);
            })
    }
    
    const printCertificate = (preEnrollmentCode) => {
        setShowSpinner(true);
        axiosInstance.current.get(API_URL.PRINT_CERTIFICATE_API.replace(':preEnrollmentCode', preEnrollmentCode), {responseType: 'arraybuffer'})
            .then(res => {
                const data = new Blob([res.data], {type: 'application/pdf'});
                let file = URL.createObjectURL(data);
                setShowSpinner(false);
                document.querySelector('#ifmcontentPrint').src = file;
                file = URL.revokeObjectURL(data);
                window.setTimeout(function() {
                    document.getElementById('ifmcontentPrint').contentWindow.print();
                }, 50);
            });
    }

    const getTableBody = () => {
        let tableRow = [];
        let tableCells;

        tableData.forEach( data => {
            tableCells = []
            tableCells.push(<tr>
                <td>{data.name}</td>
                <td>{data.gender}</td>
                <td>{data.dob}</td>
                <td><button className={styles['action-link']} onClick={() => printCertificate(data.preEnrollmentCode)}>Print</button></td>
            </tr>)
           tableRow.push(tableCells)
       })
       return tableRow;
    }

    if(showSpinner) {
        return ( 
            <Spinner id="spinner" animation="border" style={{top: '50%', left: '50%', position: 'absolute'}} role="status"></Spinner>
        );
    }
    return (
        <div className={`row ${styles['container']}`}>
            <iframe id="ifmcontentPrint" className={styles['iframe-class']}></iframe>
            <div className="col-sm-10 ml-auto">
                <h2 style={{marginLeft: '5px', paddingLeft: '15px'}}><b>Search Beneficiary</b></h2>
                <div className="row">
                    <div className="col-sm-3 col-xs-3">
                        <label className="custom-text-label required">Phone/Mobile Number</label>
                        <CustomTextWidget value={mobileNumber} className="full-width" onChange={(mobno) => setMobileNumber(mobno)}></CustomTextWidget>
                    </div>
                    <div className="col-sm-3 col-xs-3">
                        <label className="custom-text-label required">Date of Birth</label>
                        <CustomDateWidget options={options} onChange={(dob) => {setDob(dob)}} value={dob} id="date-picker"></CustomDateWidget>
                    </div>
                    <div className="col-sm-3 col-xs-3">
                        <CustomButton className="blue-btn m-29 full-width" onClick={() => {fetchCertificates()}}>Search</CustomButton>
                    </div>
                </div>
                { tableData.length > 0 && <>
                    <div className={`col-sm-10 ${styles['beneficiary-details']}`}>
                        <div className={styles['recipient-detail']}>
                            <h3><span><b>Vaccinated Recipients</b></span> (Covid 19 Program)</h3>
                            <table className={`table table-hover ${styles['table-container']}`}>
                                <thead className={styles['table-header']}>
                                    <tr>
                                        <th>Name</th>
                                        <th>Gender</th>
                                        <th>Date of Birth</th>
                                        <th>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {getTableBody()}
                                </tbody>
                            </table>
                        </div>
                    </div>
                    </>
                }
            </div>
        </div>
    )
}

export default PrintCertificate;
