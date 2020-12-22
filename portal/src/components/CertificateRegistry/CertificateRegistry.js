import React, {useEffect, useState} from 'react';
import UploadCSV from '../UploadCSV/UploadCSV';
import {SampleCSV} from "../../utils/constants";
import {UploadHistoryTable} from "../UploadHistoryTable";
import {Card} from "@material-ui/core";
import {useAxios} from "../../utils/useAxios";
import "./CertificateRegistry.css"

function Certificates() {
    const fileUploadAPI = '/divoc/api/v1/bulkCertify';
    const fileUploadHistory = fileUploadAPI + "/history"
    const axiosInstance = useAxios('');
    const [uploadHistory, setUploadHistory] = useState([]);
    const [selectedHistory, setSelectedHistory] = useState(null)

    useEffect(() => {
        fetchUploadHistory()
    }, []);

    function fetchUploadHistory() {
        const response = JSON.parse(fakeHistoryResponse);
        axiosInstance.current.get(fileUploadHistory)
            .then(res => {
                //return res.json();
                return response
            })
            .catch(e => {
                console.log(e);
                return response
            })
            .then((result) => {
                return result.map((item, index) => {
                    return {
                        id: item.id,
                        fileName: item.filename,
                        date: item.uploadedTime,
                        time: "11:00 AM",
                        records: item.TotalRecords,
                        errors: item.TotalErrorRows
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
                <UploadCSV fileUploadAPI={fileUploadAPI}
                           sampleCSV={SampleCSV.BULK_CERTIFY}
                />
            </div>
            <div className="total"/>
            <div className="error-container">
                {selectedHistory && <UploadErrors uploadHistory={selectedHistory}/>}
            </div>
            <div className="upload-history">
                <UploadHistoryTable
                    data={uploadHistory}
                    headerData={headerData}
                    onCellClicked={(value) => setSelectedHistory(value)}
                />
            </div>
        </div>
    );
}


function UploadErrors({uploadHistory}) {

    const fileUploadHistoryDetailsAPI = '/divoc/api/v1/bulkCertify/history/' + uploadHistory.id;
    const axiosInstance = useAxios('');
    const [uploadHistoryDetails, setUploadHistoryDetails] = useState([]);
    useEffect(() => {
        fetchUploadHistoryDetails()
    }, []);

    function fetchUploadHistoryDetails() {
        const fakeErrorData = JSON.parse(errorData);
        axiosInstance.current.get(fileUploadHistoryDetailsAPI)
            .then(res => {
                //return res.json();
                return fakeErrorData
            })
            .catch(e => fakeErrorData)
            .then((result) => {
                setUploadHistoryDetails(result)
            });
    }

    return (
        <Card className="error-container d-flex flex-row">
            <div>
                <h3>{uploadHistory.records}</h3>
                <h4>Record Uploaded</h4>
                <p>{uploadHistory.fileName}</p>
                <p>{uploadHistory.date}</p>
                <p>{uploadHistory.time}</p>
            </div>

            <div>
                {
                    uploadHistoryDetails.map((item, index) => <h6>{item.errorMessage}</h6>)
                }
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

const errorData = " [\n" +
    "    {\n" +
    "        \"field\": \"somefield\",\n" +
    "        \"errorMessage\": \"Failed to upload mobile number\",\n" +
    "        \"rawData\": \"cdvData\"\n" +
    "    }, {\n" +
    "        \"field\": \"somefield\",\n" +
    "        \"errorMessage\": \"Failed to upload facility id\",\n" +
    "        \"rawData\": \"cdvData\"\n" +
    "    }, {\n" +
    "        \"field\": \"somefield\",\n" +
    "        \"errorMessage\": \"Failed to upload invalid name\",\n" +
    "        \"rawData\": \"cdvData\"\n" +
    "    }\n" +
    "]"

const fakeHistoryResponse = "[\n" +
    "    {\n" +
    "        \"id\": \"sdgfat2346575\",\n" +
    "        \"filename\": \"certificate1.csv\",\n" +
    "        \"userId\": \"1111111112\",\n" +
    "        \"uploadedTime\": \"2020-12-02T19:21:18.646Z\",\n" +
    "        \"createdTime\": \"\",\n" +
    "        \"status\": \"Success\",\n" +
    "        \"TotalRecords\": 120,\n" +
    "        \"TotalErrorRows\": 10\n" +
    "    },\n" +
    "    {\n" +
    "        \"id\": \"sdgfat2346576\",\n" +
    "        \"filename\": \"certificate2.csv\",\n" +
    "        \"userId\": \"1111111113\",\n" +
    "        \"uploadedTime\": \"2020-11-02T19:21:18.646Z\",\n" +
    "        \"createdTime\": \"\",\n" +
    "        \"status\": \"Success\",\n" +
    "        \"TotalRecords\": 220,\n" +
    "        \"TotalErrorRows\": 8\n" +
    "    }\n" +
    "]\n"

export default Certificates;
