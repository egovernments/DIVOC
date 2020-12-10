import React from "react";
import styles from "./PrintCertificate.module.css";
import DropDown from "../DropDown/DropDown";
import CustomPrint from "./CustomPrint";
import ReactToPrint from 'react-to-print';

const dummyTableData = [
    {
        "@type": "VaccinationCertificate",
        "identity": "did:in.gov.uidai.aadhaar:2342343334",
        "certificateId": "8498081",
        "contact": [
            "tel:9880414887"
        ],
        "certificate": "{\"facility\":{\"address\":{\"addressLine1\":\"123, Koramangala\",\"district\":\"Bengaluru South\",\"state\":\"Karnataka\"},\"name\":\"ABC Medical Center\"},\"preEnrollmentCode\":\"12346\",\"recipient\":{\"contact\":[\"tel:9880414887\"],\"dob\":\"1990-11-30\",\"gender\":\"Female\",\"identity\":\"did:in.gov.uidai.aadhaar:2342343334\",\"name\":\"Chaya Mitra\"},\"vaccination\":{\"batch\":\"MB3428BX\",\"date\":\"2020-12-02T19:21:18.6   46Z\",\"effectiveStart\":\"2020-12-02\",\"effectiveUntil\":\"2025-12-02\",\"manufacturer\":\"COVPharma\",\"name\":\"CoVax\"},\"vaccinator\":{\"name\":\"Sooraj Singh\"}}",
        "_osUpdatedBy": "",
        "_osCreatedAt": "2020-12-02T14:41:49.497Z",
        "name": "Chaya Mitra",
        "gender":"Female",
        "date":"2020-12-02T19:21:18.6",
        "osid": "1-4370f6c9-350a-4287-afed-9a1c57479d8c",
        "_osCreatedBy": "",
        "_osUpdatedAt": "2020-12-02T14:41:49.497Z"
    },
    {
        "@type": "VaccinationCertificate",
        "identity": "did:in.gov.uidai.aadhaar:2342343334",
        "certificateId": "8498081",
        "contact": [
            "tel:9880414887"
        ],
        "certificate": "{\"facility\":{\"address\":{\"addressLine1\":\"123, Koramangala\",\"district\":\"Bengaluru South\",\"state\":\"Karnataka\"},\"name\":\"ABC Medical Center\"},\"preEnrollmentCode\":\"12346\",\"recipient\":{\"contact\":[\"tel:9880414887\"],\"dob\":\"1990-11-30\",\"gender\":\"Female\",\"identity\":\"did:in.gov.uidai.aadhaar:2342343334\",\"name\":\"Chaya Mitra\"},\"vaccination\":{\"batch\":\"MB3428BX\",\"date\":\"2020-12-02T19:21:18.646Z\",\"effectiveStart\":\"2020-12-02\",\"effectiveUntil\":\"2025-12-02\",\"manufacturer\":\"COVPharma\",\"name\":\"CoVax\"},\"vaccinator\":{\"name\":\"Sooraj Singh\"}}",
        "_osUpdatedBy": "",
        "_osCreatedAt": "2020-12-02T14:40:18.971Z",
        "name": "Chaya Mitra",
        "gender":"Female",
        "date":"2020-12-02T19:21:18.6",
        "osid": "1-e41597a4-43bb-4de3-b1d0-55faf4c65849",
        "_osCreatedBy": "",
        "_osUpdatedAt": "2020-12-02T14:40:18.971Z"
    },
    {
        "@type": "VaccinationCertificate",
        "identity": "did:in.gov.uidai.aadhaar:2342343334",
        "certificateId": "8498081",
        "contact": [
            "tel:9880414887"
        ],
        "certificate": "{\"facility\":{\"address\":{\"addressLine1\":\"123, Koramangala\",\"district\":\"Bengaluru South\",\"state\":\"Karnataka\"},\"name\":\"ABC Medical Center\"},\"preEnrollmentCode\":\"12346\",\"recipient\":{\"contact\":[\"tel:9880414887\"],\"dob\":\"1990-11-30\",\"gender\":\"Female\",\"identity\":\"did:in.gov.uidai.aadhaar:2342343334\",\"name\":\"Chaya Mitra\"},\"vaccination\":{\"batch\":\"MB3428BX\",\"date\":\"2020-12-02T19:21:18.646Z\",\"effectiveStart\":\"2020-12-02\",\"effectiveUntil\":\"2025-12-02\",\"manufacturer\":\"COVPharma\",\"name\":\"CoVax\"},\"vaccinator\":{\"name\":\"Sooraj Singh\"}}",
        "_osUpdatedBy": "",
        "_osCreatedAt": "2020-12-02T14:42:22.571Z",
        "name": "Chaya Mitra",
        "gender":"Female",
        "date":"2020-12-02T19:21:18.6",
        "osid": "1-06380349-819b-468e-816a-e7994c6dad98",
        "_osCreatedBy": "",
        "_osUpdatedAt": "2020-12-02T14:42:22.571Z"
    },
    {
        "@type": "VaccinationCertificate",
        "identity": "did:in.gov.uidai.aadhaar:2342343321",
        "certificateId": "8498081",
        "contact": [
            "tel:9880414887"
        ],
        "certificate": "{\"facility\":{\"address\":{\"addressLine1\":\"123, Koramangala\",\"district\":\"Bengaluru South\",\"state\":\"Karnataka\"},\"name\":\"ABC Medical Center\"},\"preEnrollmentCode\":\"12346\",\"recipient\":{\"contact\":[\"tel:9880414887\"],\"dob\":\"1995-11-30\",\"gender\":\"Male\",\"identity\":\"did:in.gov.uidai.aadhaar:2342343321\",\"name\":\"Bdya Mitra\"},\"vaccination\":{\"batch\":\"MB3428BX\",\"date\":\"2020-12-02T19:21:08.646Z\",\"effectiveStart\":\"2020-12-02\",\"effectiveUntil\":\"2025-12-02\",\"manufacturer\":\"COVPharma\",\"name\":\"CoVax\"},\"vaccinator\":{\"name\":\"Sooraj Singh\"}}",
        "_osUpdatedBy": "",
        "_osCreatedAt": "2020-12-02T12:02:44.541Z",
        "name": "Bdya Mitra",
        "gender":"Male",
        "date":"2020-12-02T19:21:18.6",
        "osid": "1-5d012f81-122a-4271-ba32-f23b7edd204b",
        "_osCreatedBy": "",
        "_osUpdatedAt": "2020-12-02T12:02:44.541Z"
    },
    {
        "@type": "VaccinationCertificate",
        "identity": "did:in.gov.uidai.aadhaar:2342343334",
        "certificateId": "8498081",
        "contact": [
            "tel:9880414888"
        ],
        "certificate": "{\"facility\":{\"address\":{\"addressLine1\":\"123, Koramangala\",\"district\":\"Bengaluru South\",\"state\":\"Karnataka\"},\"name\":\"ABC Medical Center\"},\"preEnrollmentCode\":\"12346\",\"recipient\":{\"contact\":[\"tel:9880414888\"],\"dob\":\"1990-11-30\",\"gender\":\"Female\",\"identity\":\"did:in.gov.uidai.aadhaar:2342343334\",\"name\":\"Chaya Mitra\"},\"vaccination\":{\"batch\":\"MB3428BX\",\"date\":\"2020-12-02T19:21:18.646Z\",\"effectiveStart\":\"2020-12-02\",\"effectiveUntil\":\"2025-12-02\",\"manufacturer\":\"COVPharma\",\"name\":\"CoVax\"},\"vaccinator\":{\"name\":\"Sooraj Singh\"}}",
        "_osUpdatedBy": "",
        "_osCreatedAt": "2020-12-02T14:45:45.141Z",
        "name": "Chaya Mitra",
        "gender":"Female",
        "date":"2020-12-02T19:21:18.6",
        "osid": "1-b8cd331d-239d-4fbc-bba0-6595cbda7c33",
        "_osCreatedBy": "",
        "_osUpdatedAt": "2020-12-02T14:45:45.141Z"
    },
    {
        "@type": "VaccinationCertificate",
        "identity": "did:in.gov.uidai.aadhaar:2342343334",
        "certificateId": "8498081",
        "contact": [
            "tel:9880414889"
        ],
        "certificate": "{\"facility\":{\"address\":{\"addressLine1\":\"123, Koramangala\",\"district\":\"Bengaluru South\",\"state\":\"Karnataka\"},\"name\":\"ABC Medical Center\"},\"preEnrollmentCode\":\"12346\",\"recipient\":{\"contact\":[\"tel:9880414889\"],\"dob\":\"1990-11-30\",\"gender\":\"Female\",\"identity\":\"did:in.gov.uidai.aadhaar:2342343334\",\"name\":\"Chaya Mitra\"},\"vaccination\":{\"batch\":\"MB3428BX\",\"date\":\"2020-12-02T19:21:18.646Z\",\"effectiveStart\":\"2020-12-02\",\"effectiveUntil\":\"2025-12-02\",\"manufacturer\":\"COVPharma\",\"name\":\"CoVax\"},\"vaccinator\":{\"name\":\"Sooraj Singh\"}}",
        "_osUpdatedBy": "",
        "_osCreatedAt": "2020-12-02T15:20:59.712Z",
        "name": "Chaya Mitra",
        "gender":"Female",
        "date":"2020-12-02T19:21:18.6",
        "osid": "1-9381e683-45bb-424c-a5d9-26cb2bbbc0cc",
        "_osCreatedBy": "",
        "_osUpdatedAt": "2020-12-02T15:20:59.712Z"
    },
    {
        "@type": "VaccinationCertificate",
        "identity": "",
        "certificateId": "8498081",
        "contact": [
            9876541101
        ],
        "certificate": "{\"preEnrollmentCode\":\"63237\",\"recipient\":{\"contact\":[\"9876541101\"],\"dob\":\"1980-05-01\",\"gender\":\"Female\",\"name\":\"Jaya P\"},\"vaccination\":{\"batch\":\"123123\",\"date\":\"2020-12-02T09:44:03.802Z\",\"effectiveStart\":\"2020-12-02\",\"effectiveUntil\":\"2020-12-02\",\"manufacturer\":\"string\",\"name\":\"TOD0\"},\"vaccinator\":{\"name\":\"Vaidya Acharya\"}}",
        "_osUpdatedBy": "",
        "_osCreatedAt": "2020-12-03T07:44:41.179Z",
        "name": "Jaya P",
        "gender":"Female",
        "date":"2020-12-02T19:21:18.6",
        "osid": "1-463abb24-1c63-4cc3-b18e-f23c7b9efd13",
        "_osCreatedBy": "",
        "_osUpdatedAt": "2020-12-03T07:44:41.179Z"
    },
    {
        "@type": "VaccinationCertificate",
        "identity": "",
        "certificateId": "8498081",
        "contact": [
            9876541101
        ],
        "certificate": "{\"preEnrollmentCode\":\"63237\",\"recipient\":{\"contact\":[\"9876541101\"],\"dob\":\"1980-05-01\",\"gender\":\"Female\",\"name\":\"Jaya P\"},\"vaccination\":{\"batch\":\"123123\",\"date\":\"2020-12-02T09:44:03.802Z\",\"effectiveStart\":\"2020-12-02\",\"effectiveUntil\":\"2020-12-02\",\"manufacturer\":\"string\",\"name\":\"TOD0\"},\"vaccinator\":{\"name\":\"Vaidya Acharya\"}}",
        "_osUpdatedBy": "",
        "_osCreatedAt": "2020-12-03T07:46:34.187Z",
        "name": "Jaya P",
        "gender":"Female",
        "date":"2020-12-02T19:21:18.6",
        "osid": "1-11979d36-1119-4123-b2bb-9784a87e994e",
        "_osCreatedBy": "",
        "_osUpdatedAt": "2020-12-03T07:46:34.187Z"
    }
]

const PROGRAMS = ["C-19 Program"];


function PrintCertificate() {
    const [selectedReceipt, setSelectedReceipt] = React.useState([]);
    const [selectedCertificate, setSelectedCertificate] = React.useState([]);
    const [selectedProgram,setSelectedProgram] = React.useState()
    const [tableData,setTableData] = React.useState(dummyTableData);
    const componentRef = React.useRef();


    const getTableBody = () => {
        let tableRow = [];
        let tableCells;

        tableData.forEach( data => {
            tableCells = []
            tableCells.push(<tr>
                <td>{data.osid}</td>
                <td>{data.name}</td>
                <td>{data.gender}</td>
                <td>
                    <div className="form-check">
                        <label
                            className="form-check-label"
                            htmlFor={data.osid + "receipt"}
                        >
                            <input
                                type="checkbox"
                                className="form-check-input"
                                id={data.osid + "receipt"}
                                onChange={() => setSelectedReceipt(oldArray => [...oldArray, data]) }
                            />
                            <div
                                className={styles["wrapper"]}
                                style={{
                                    backgroundColor:
                                    selectedReceipt.some(receipt => receipt.osid===data.osid)
                                            ? "#5C9EF8"
                                            : "",
                                }}
                            >
                                &nbsp;
                            </div>
                        
                        </label>
                    </div>
                </td>
                <td>
                <div className="form-check">
                        <label
                            className="form-check-label"
                            htmlFor={data.osid + "cert"}
                        >
                            <input
                                type="checkbox"
                                className="form-check-input"
                                id={data.osid + "cert"}
                                onChange={() => setSelectedCertificate(oldArray => [...oldArray, data]) }
                            />
                            <div
                                className={styles["wrapper"]}
                                style={{
                                    backgroundColor:
                                    selectedCertificate.some(certificate => certificate.osid===data.osid)
                                            ? "#5C9EF8"
                                            : "",
                                }}
                            >
                                &nbsp;
                            </div>
                        
                        </label>
                    </div>
                </td>
            </tr>)
           tableRow.push(tableCells)
       })
       return tableRow;
    }

    
    const showFilterOptions = () => {
        return(
            <div >
                <label htmlFor="name">Name</label>
                <input type="text" id="name" name="name" onChange={(evt) => {
                    const newTableData = tableData.filter( data => data.name.includes(evt.target.value)) 
                    setTableData(newTableData)
                }}/>
            </div>
        )
    }

    return (
        <div className={`row ${styles['container']}`}>
            <div>
                <h3 >Vaccinated Recipients (Covid-19 Vaccine (C19) Program)</h3>
                <DropDown setSelectedOption={setSelectedProgram} placeholder="Select a program"  options={PROGRAMS}/>
            </div>
            <div className="col-sm-12">{selectedProgram ? showFilterOptions() : ''}</div>
            <div className="col-sm-9">
                <table className={`table table-hover ${styles['table-container']}`}>
                    <thead className={styles['table-header']}>
                        <tr>
                            <th>Enrolment ID</th>
                            <th>Name</th>
                            <th>Gender</th>
                            <th>Print receipt</th>
                            <th>Print certificate</th>
                        </tr>
                    </thead>
                    <tbody>
                        {getTableBody()}
                    </tbody>
                </table>
            </div>     
            <div className="col-sm-3">
                <div className="card">
                    <div className={`card-header ${styles['card-header']}`}>Certificate Count</div>
                    <div className="card-body">Basic card
                        <p>Certificates Issued</p>
                    </div>
                </div>
                <div>
                    <ReactToPrint
                        trigger={() => <button className={styles['button']}>Print Receipt</button> }
                        content={() => componentRef.current}
                    />
                    <div style={{ display: "none" }}><CustomPrint ref={componentRef} dataToPrint={selectedReceipt}/></div>
                </div>
                
            </div>
        </div>
    );
}

export default PrintCertificate;
