import React, {useEffect, useState} from 'react';
import UploadCSV from '../UploadCSV/UploadCSV';
import {UploadHistoryTable} from "../UploadHistoryTable";
import {Card} from "@material-ui/core";
import {useAxios} from "../../utils/useAxios";
import "./CertificateRegistry.css"
import {UploadErrorList} from "../UploadHistoryTable/UploadErrorList";
import ProgramActive from "../../assets/img/program-active.svg"
import withStyles from "@material-ui/core/styles/withStyles";
import Paper from "@material-ui/core/Paper";
import {formatDate} from "../../utils/dateutil";

function Certificates() {
    const fileUploadAPI = '/divoc/api/v1/bulkCertify';
    const fileUploadHistory = "/divoc/api/v1/certify/uploads"
    const axiosInstance = useAxios('');
    const [uploadHistory, setUploadHistory] = useState([]);
    const [selectedHistory, setSelectedHistory] = useState(null)

    useEffect(() => {
        fetchUploadHistory()
    }, []);

    function fetchUploadHistory() {
        axiosInstance.current.get(fileUploadHistory)
            .then(res => {
                return res.data
            })
            .catch(e => {
                console.log(e);
                return []
            })
            .then((result) => {
                return result.map((item, index) => {
                    const uploadedDate = new Date(item["CreatedAt"])
                    const uploadLocalTime = uploadedDate.toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'});
                    const uploadLocalDate = formatDate(uploadedDate)
                    return {
                        id: item["ID"],
                        fileName: item["Filename"],
                        date: uploadLocalDate,
                        time: uploadLocalTime,
                        records: item["TotalRecords"],
                        errors: item["TotalErrorRows"]
                    };
                })
            })
            .then((result) => {
                setUploadHistory(result)
            });
    }

    return (
        <div className="certificate-container">
            <div className="upload-csv">
                <UploadCSV fileUploadAPI={fileUploadAPI} onUploadComplete={() => {
                    fetchUploadHistory()
                }}/>
            </div>
            <div className="total"/>
            <div className="upload-history">
                <UploadHistoryTable
                    data={uploadHistory}
                    headerData={headerData}
                    onCellClicked={(value) => setSelectedHistory(value)}
                />
            </div>
            <div className="error-temp">
                {selectedHistory ? <UploadErrors uploadHistory={selectedHistory}/> :
                    <div/>}
            </div>
        </div>
    );
}


function UploadErrors({uploadHistory}) {

    const fileUploadHistoryDetailsAPI = '/divoc/api/v1/certify/uploads/' + uploadHistory.id + '/errors';
    const axiosInstance = useAxios('');
    const [uploadHistoryDetails, setUploadHistoryDetails] = useState({});
    useEffect(() => {
        fetchUploadHistoryDetails()
    }, [uploadHistory.id]);

    function fetchUploadHistoryDetails() {
        const fakeJson = JSON.parse(fakeErrorResponse)
        axiosInstance.current.get(fileUploadHistoryDetailsAPI)
            .then(res => {
                return fakeJson
            })
            .catch(e => {
                console.log(e);
                return fakeJson
            })

            .then((result) => {
                setUploadHistoryDetails(result)
            });
    }

    const CustomPaper = withStyles({
        root: {
            boxShadow: "0px 6px 20px #C1CFD933",
            borderRadius: "10px",
            width: "100%",
            height: '60vh',
            padding: "16px"
        }
    })(Paper);
    console.log(uploadHistoryDetails.errorRows);
    return (
        <Card component={CustomPaper}>
            <div className="error-container">
                <div className="error-count ml-lg-5 mt-5">
                    <img src={ProgramActive} width={"50px"} height={"50px"} alt={"Record Success"}/>
                    <h3>{uploadHistory.records}</h3>
                    <h5>Records<br/>Uploaded</h5>
                </div>
                <UploadErrorList
                    columns={uploadHistoryDetails.columns}
                    uploadHistoryDetails={uploadHistoryDetails["errorRows"]}
                    fileName={uploadHistory.fileName}/>
                <div className="error-file-details  ml-lg-5 mb-5">
                    <p>{uploadHistory.fileName}</p>
                    <p>{uploadHistory.date}</p>
                    <p>{uploadHistory.time}</p>
                </div>

            </div>
        </Card>
    );
}

const headerData = [
    {
        title: "FILE NAME",
        key: "fileName"
    },
    {
        title: "DATE",
        key: "date"
    },
    {
        title: "TIME",
        key: "time"
    },
    {
        title: "RECORDS",
        key: "records"
    },
    {
        title: "ERRORS",
        key: "errors"
    }
]

const fakeErrorResponse = "{\n" +
    "    \"columns\": [\n" +
    "        \"recipientName\",\n" +
    "        \"recipientMobileNumber\",\n" +
    "        \"recipientDOB\",\n" +
    "        \"recipientGender\",\n" +
    "        \"recipientNationality\",\n" +
    "        \"recipientIdentity\",\n" +
    "        \"vaccinationBatch\",\n" +
    "        \"vaccinationDate\",\n" +
    "        \"vaccinationEffectiveStart\",\n" +
    "        \"vaccinationEffectiveEnd\",\n" +
    "        \"vaccinationManufacturer\",\n" +
    "        \"vaccinationName\",\n" +
    "        \"vaccinatorName\",\n" +
    "        \"facilityName\",\n" +
    "        \"facilityAddressLine1\",\n" +
    "        \"facilityAddressLine2\",\n" +
    "        \"facilityDistrict\",\n" +
    "        \"facilityState\",\n" +
    "        \"facilityPincode\",\n" +
    "        \"errors\"\n" +
    "    ],\n" +
    "    \"errorRows\": [\n" +
    "        {\n" +
    "            \"ID\": 6,\n" +
    "            \"CreatedAt\": \"2020-12-24T10:49:27.541736Z\",\n" +
    "            \"UpdatedAt\": \"2020-12-24T10:49:27.541736Z\",\n" +
    "            \"DeletedAt\": null,\n" +
    "            \"CertifyUploadID\": 7,\n" +
    "            \"errors\": \"RecipientMobileNumber is missing,RecipientName is missing\",\n" +
    "            \"recipientName\": \"\",\n" +
    "            \"recipientMobileNumber\": \"\",\n" +
    "            \"recipientDOB\": \"1994-11-30\",\n" +
    "            \"recipientGender\": \"Male\",\n" +
    "            \"recipientNationality\": \"Indian\",\n" +
    "            \"recipientIdentity\": \"did:in.gov.uidai.aadhaar:2342343334\",\n" +
    "            \"vaccinationBatch\": \"MB3428BX\",\n" +
    "            \"vaccinationDate\": \"2020-12-02T19:21:18.646Z\",\n" +
    "            \"vaccinationEffectiveStart\": \"2020-12-02\",\n" +
    "            \"vaccinationEffectiveEnd\": \"2025-12-02\",\n" +
    "            \"vaccinationManufacturer\": \"COVPharma\",\n" +
    "            \"vaccinationName\": \"CoVax\",\n" +
    "            \"vaccinatorName\": \"Sooraj Singh\",\n" +
    "            \"facilityName\": \"ABC Medical Center\",\n" +
    "            \"facilityAddressLine1\": \"123, Koramangala\",\n" +
    "            \"facilityAddressLine2\": \"\",\n" +
    "            \"facilityDistrict\": \"Bengaluru South\",\n" +
    "            \"facilityState\": \"Karnataka\",\n" +
    "            \"facilityPincode\": 560034\n" +
    "        },\n" +
    "        {\n" +
    "            \"ID\": 7,\n" +
    "            \"CreatedAt\": \"2020-12-24T10:49:27.550217Z\",\n" +
    "            \"UpdatedAt\": \"2020-12-24T10:49:27.550217Z\",\n" +
    "            \"DeletedAt\": null,\n" +
    "            \"CertifyUploadID\": 7,\n" +
    "            \"errors\": \"RecipientName is missing\",\n" +
    "            \"recipientName\": \"\",\n" +
    "            \"recipientMobileNumber\": \"1111111303\",\n" +
    "            \"recipientDOB\": \"1983-03-03\",\n" +
    "            \"recipientGender\": \"Male\",\n" +
    "            \"recipientNationality\": \"Indian\",\n" +
    "            \"recipientIdentity\": \"did:in.gov.uidai.aadhaar:123546577357\",\n" +
    "            \"vaccinationBatch\": \"12345\",\n" +
    "            \"vaccinationDate\": \"2020-12-02T09:44:03.802Z\",\n" +
    "            \"vaccinationEffectiveStart\": \"2020-12-02\",\n" +
    "            \"vaccinationEffectiveEnd\": \"2020-12-02\",\n" +
    "            \"vaccinationManufacturer\": \"string\",\n" +
    "            \"vaccinationName\": \"COVID-19\",\n" +
    "            \"vaccinatorName\": \"Nayan A\",\n" +
    "            \"facilityName\": \"Awesome Hospital\",\n" +
    "            \"facilityAddressLine1\": \"\",\n" +
    "            \"facilityAddressLine2\": \"\",\n" +
    "            \"facilityDistrict\": \"\",\n" +
    "            \"facilityState\": \"\",\n" +
    "            \"facilityPincode\": 0\n" +
    "        }\n" +
    "    ]\n" +
    "}";

export default Certificates;
