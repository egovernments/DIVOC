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
        "certificate": "{\"facility\":{\"address\":{\"addressLine1\":\"123, Koramangala\",\"district\":\"Bengaluru South\",\"state\":\"Karnataka\"},\"name\":\"ABC Medical Center\"},\"preEnrollmentCode\":\"12346\",\"recipient\":{\"contact\":[\"tel:9880414887\"],\"gender\":\"Female\",\"identity\":\"did:in.gov.uidai.aadhaar:2342343334\",\"name\":\"Aditi Musunur\"},\"vaccination\":{\"batch\":\"MB3428BX\",\"date\":\"2020-12-02T19:21:18.6   46Z\",\"effectiveStart\":\"2020-12-02\",\"effectiveUntil\":\"2025-12-02\",\"manufacturer\":\"COVPharma\",\"name\":\"CoVax\"},\"vaccinator\":{\"name\":\"Sooraj Singh\"}}",
        "_osUpdatedBy": "",
        "_osCreatedAt": "2020-12-02T14:41:49.497Z",
        "name": "Aditi Musunur",
        "gender":"Female",
        "receiptId": 1,
        "date":"2020-12-02T19:21:18.6",
        "dob":"1990-11-30",
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
        "certificate": "{\"facility\":{\"address\":{\"addressLine1\":\"123, Koramangala\",\"district\":\"Bengaluru South\",\"state\":\"Karnataka\"},\"name\":\"ABC Medical Center\"},\"preEnrollmentCode\":\"12346\",\"recipient\":{\"contact\":[\"tel:9880414887\"],\"gender\":\"Female\",\"identity\":\"did:in.gov.uidai.aadhaar:2342343334\",\"name\":\"Savitri Morar\"},\"vaccination\":{\"batch\":\"MB3428BX\",\"date\":\"2020-12-02T19:21:18.646Z\",\"effectiveStart\":\"2020-12-02\",\"effectiveUntil\":\"2025-12-02\",\"manufacturer\":\"COVPharma\",\"name\":\"CoVax\"},\"vaccinator\":{\"name\":\"Sooraj Singh\"}}",
        "_osUpdatedBy": "",
        "_osCreatedAt": "2020-12-02T14:40:18.971Z",
        "name": "Savitri Morar",
        "gender":"Female",
        "receiptId": 2,
        "date":"2020-12-02T19:21:18.6",
        "dob":"1990-11-30",
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
        "certificate": "{\"facility\":{\"address\":{\"addressLine1\":\"123, Koramangala\",\"district\":\"Bengaluru South\",\"state\":\"Karnataka\"},\"name\":\"ABC Medical Center\"},\"preEnrollmentCode\":\"12346\",\"recipient\":{\"contact\":[\"tel:9880414887\"],\"dob\":\"1990-11-30\",\"gender\":\"Female\",\"identity\":\"did:in.gov.uidai.aadhaar:2342343334\",\"name\":\"Sonam Sankaran\"},\"vaccination\":{\"batch\":\"MB3428BX\",\"date\":\"2020-12-02T19:21:18.646Z\",\"effectiveStart\":\"2020-12-02\",\"effectiveUntil\":\"2025-12-02\",\"manufacturer\":\"COVPharma\",\"name\":\"CoVax\"},\"vaccinator\":{\"name\":\"Sooraj Singh\"}}",
        "_osUpdatedBy": "",
        "_osCreatedAt": "2020-12-02T14:42:22.571Z",
        "name": "Sonam Sankaran",
        "gender":"Female",
        "receiptId": 3,
        "date":"2020-12-02T19:21:18.6",
        "dob":"1990-11-30",
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
        "receiptId": 4,
        "date":"2020-12-02T19:21:18.6",
        "dob":"1995-11-30",
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
        "receiptId": 5,
        "date":"2020-12-02T19:21:18.6",
        "dob":"1990-11-30",
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
        "certificate": "{\"facility\":{\"address\":{\"addressLine1\":\"123, Koramangala\",\"district\":\"Bengaluru South\",\"state\":\"Karnataka\"},\"name\":\"ABC Medical Center\"},\"preEnrollmentCode\":\"12346\",\"recipient\":{\"contact\":[\"tel:9880414889\"],\"dob\":\"1990-11-30\",\"gender\":\"Male\",\"identity\":\"did:in.gov.uidai.aadhaar:2342343334\",\"name\":\"Ravi Murthy\"},\"vaccination\":{\"batch\":\"MB3428BX\",\"date\":\"2020-12-02T19:21:18.646Z\",\"effectiveStart\":\"2020-12-02\",\"effectiveUntil\":\"2025-12-02\",\"manufacturer\":\"COVPharma\",\"name\":\"CoVax\"},\"vaccinator\":{\"name\":\"Sooraj Singh\"}}",
        "_osUpdatedBy": "",
        "_osCreatedAt": "2020-12-02T15:20:59.712Z",
        "name": "Ravi Murthy",
        "gender":"Male",
        "receiptId": 6,
        "date":"2020-12-02T19:21:18.6",
        "dob":"1990-11-30",
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
        "receiptId": 7,
        "date":"2020-12-02T19:21:18.6",
        "dob":"1980-05-01",
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
        "certificate": "{\"preEnrollmentCode\":\"63237\",\"recipient\":{\"contact\":[\"9876541101\"],\"dob\":\"1980-05-01\",\"gender\":\"Female\",\"name\":\"Sakshi R\"},\"vaccination\":{\"batch\":\"123123\",\"date\":\"2020-12-02T09:44:03.802Z\",\"effectiveStart\":\"2020-12-02\",\"effectiveUntil\":\"2020-12-02\",\"manufacturer\":\"string\",\"name\":\"TOD0\"},\"vaccinator\":{\"name\":\"Vaidya Acharya\"}}",
        "_osUpdatedBy": "",
        "_osCreatedAt": "2020-12-03T07:46:34.187Z",
        "name": "Sakshi R",
        "gender":"Female",
        "receiptId": 8,
        "date":"2020-12-02T19:21:18.6",
        "dob":"1980-05-01",
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
    const receiptRef = React.useRef();
    const certificateRef = React.useRef();
    const [startDate, setStartDate] = React.useState(new Date());

    const handleChange = (data,dataList,setDataList) => {
        let newData=dataList;
        if(dataList.some(item => item.osid===data.osid)){
            newData = newData.filter( item => !item.osid.includes(data.osid)) 
            setDataList(newData)
        }
        else setDataList(oldArray => [...oldArray,data])
    }

    const getTableBody = () => {
        let tableRow = [];
        let tableCells;

        tableData.forEach( data => {
            tableCells = []
            tableCells.push(<tr>
                <td>{data.osid}</td>
                <td>{data.name}</td>
                <td>{data.gender}</td>
                <td>{data.dob}</td>
                <td>
                <div className={`form-check ${styles['input-container']}`}>
                        <label
                            className="form-check-label"
                            htmlFor={data.osid + "cert"}
                        >
                            <input
                                type="checkbox"
                                className="form-check-input"
                                id={data.osid + "cert"}
                                onChange={() => handleChange(data,selectedCertificate,setSelectedCertificate)}
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
            <div className="d-flex flex-row">
                <div className="p-2">
                    <label htmlFor="name">Name</label>
                    <input type="text" id="name" name="name" onChange={(evt) => {
                        const newTableData = dummyTableData.filter( data => data.name.toLowerCase().includes(evt.target.value.toLowerCase())) 
                        setTableData(newTableData)
                    }}/>
                </div>    
                <div className=" p-2">
                    <label htmlFor="date">Date</label>
                    <input type="date" id="date" name="date" placeholder="yyyy/MM/dd" onChange={(evt) => {
                        const newTableData = dummyTableData.filter( data => data.dob === evt.target.value) 
                        setTableData(newTableData)
                    }}/>
                </div>
            </div>    
        )
    }

    return (
        <div className={`row ${styles['container']}`}>
            <div>
                <h3 >Vaccinated Recipients</h3>
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
                            <th>Date of birth</th>
                            <th>Print certificate</th>
                        </tr>
                    </thead>
                    <tbody>
                        {getTableBody()}
                    </tbody>
                </table>
            </div>     
            <div className="col-sm-3">
                <div className={`card ${styles['card']}`}>
                <div className={`card-header ${styles['card-header']}`}>Certificate Count</div>
                    <div className="card-body">
                        <p>Certificates Issued: {dummyTableData.length}</p>
                    </div>
                </div>
                <div className="d-flex flex-row">
                    <div className="p-2"> 
                        {selectedCertificate.length>0 ? <ReactToPrint
                            trigger={() => <button className={styles['button']}>Print Certificate</button> }
                            content={() => certificateRef.current}
                        /> : ''}
                        <div style={{ display: "none" }}>
                            <CustomPrint ref={certificateRef} dataToPrint={selectedCertificate} title="Certificate"/>
                        </div>
                    </div>
                </div>
                
            </div>
        </div>
    );
}

export default PrintCertificate;
