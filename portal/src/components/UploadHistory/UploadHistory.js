import React, {useEffect, useState} from 'react';
import {useAxios} from "../../utils/useAxios";
import {formatDate} from "../../utils/dateutil";
import UploadCSV from "../UploadCSV/UploadCSV";
import {UploadHistoryTable} from "../UploadHistoryTable";
import withStyles from "@material-ui/core/styles/withStyles";
import Paper from "@material-ui/core/Paper";
import {Card} from "@material-ui/core";
import ProgramActive from "../../assets/img/program-active.svg";
import {UploadErrorList} from "../UploadHistoryTable/UploadErrorList";
import "./UploadHistory.css"
import {TotalRecords} from "../TotalRecords";

const UploadHistory = ({fileUploadAPI, fileUploadHistoryAPI, fileUploadErrorsAPI, infoTitle}) => {
    const axiosInstance = useAxios('');
    const [uploadHistory, setUploadHistory] = useState([]);
    const [selectedHistory, setSelectedHistory] = useState(null)

    useEffect(() => {
        fetchUploadHistory()
    }, []);

    function fetchUploadHistory() {
        axiosInstance.current.get(fileUploadHistoryAPI)
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
        <div className="upload-csv-container">
            <div className="upload-csv">
                <UploadCSV fileUploadAPI={fileUploadAPI} onUploadComplete={() => {
                    fetchUploadHistory()
                }}/>
            </div>
            <div className="total">
                {infoTitle && <TotalRecords
                    title={infoTitle}
                    count={uploadHistory.length}
                />}
            </div>
            <div className="upload-history">
                <UploadHistoryTable
                    data={uploadHistory}
                    headerData={headerData}
                    onCellClicked={(value) => setSelectedHistory(value)}
                />
            </div>
            <div className="error-temp">
                {selectedHistory ? <UploadErrors
                        uploadHistory={selectedHistory}
                        fileUploadHistoryDetailsAPI={fileUploadErrorsAPI.replace(":id", selectedHistory.id)}
                    /> :
                    <div/>}
            </div>
        </div>
    );
};


function UploadErrors({uploadHistory, fileUploadHistoryDetailsAPI}) {
    const axiosInstance = useAxios('');
    const [uploadHistoryDetails, setUploadHistoryDetails] = useState({});
    useEffect(() => {
        fetchUploadHistoryDetails()
    }, [uploadHistory.id]);

    function fetchUploadHistoryDetails() {
        axiosInstance.current.get(fileUploadHistoryDetailsAPI)
            .then(res => {
                return res.data;
            })
            .catch(e => {
                return []
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

export default UploadHistory;
