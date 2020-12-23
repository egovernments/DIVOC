import React, {useEffect, useState} from 'react';
import UploadCSV from '../UploadCSV/UploadCSV';
import {SampleCSV} from "../../utils/constants";
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
                    const uploadedDate = new Date(item.uploadedTime)
                    const uploadLocalTime = uploadedDate.toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'});
                    const uploadLocalDate = formatDate(uploadedDate)
                    return {
                        id: item.id,
                        fileName: item.filename,
                        date: uploadLocalDate,
                        time: uploadLocalTime,
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
                <UploadCSV fileUploadAPI={fileUploadAPI}/>
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
                    <div className="d-flex justify-content-center">No history selected</div>}
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

    const CustomPaper = withStyles({
        root: {
            boxShadow: "0px 6px 20px #C1CFD933",
            borderRadius: "10px",
            width: "100%",
            height: '60vh',
            padding: "16px"
        }
    })(Paper);

    return (
        <Card component={CustomPaper}>
            <div className="error-container">
                <div className="error-count ml-lg-5 mt-5">
                    <img src={ProgramActive} width={"50px"} height={"50px"} alt={"Record Success"}/>
                    <h3>{uploadHistory.records}</h3>
                    <h5>Records<br/>Uploaded</h5>
                </div>
                <UploadErrorList uploadHistoryDetails={uploadHistoryDetails}/>
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
