import React, {useEffect, useState} from "react";
import {useAxios} from "../../utils/useAxios";
import {formatDate} from "../../utils/dateutil";
import UploadCSV from "../UploadCSV/UploadCSV";
import {UploadHistoryTable} from "../UploadHistoryTable";
import withStyles from "@material-ui/core/styles/withStyles";
import Paper from "@material-ui/core/Paper";
import {Card} from "@material-ui/core";
import ProgramActive from "../../assets/img/program-active.svg";
import {UploadErrorList} from "../UploadHistoryTable/UploadErrorList";
import "./UploadHistory.css";
import {TotalRecords} from "../TotalRecords";

import Modal from "react-bootstrap/Modal";

const UploadHistory = ({
                           fileUploadAPI,
                           fileUploadHistoryAPI,
                           fileUploadErrorsAPI,
                           infoTitle,
                           emptyListMessage,
                           UploadComponent = UploadCSV,
                           tableTitle,
                           tableData,
                           tableHeader,
                           onRefresh,
                       }) => {
    const axiosInstance = useAxios("");
    const [uploadHistory, setUploadHistory] = useState([]);
    const [selectedHistory, setSelectedHistory] = useState(null);
    const [show, setShow] = useState(false);

    const handleClose = () => setShow(false);
    const handleShow = () => setShow(true);
    useEffect(() => {
        fetchUploadHistory();
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
                    const uploadedDate = new Date(item["CreatedAt"]);
                    const uploadLocalTime = uploadedDate.toLocaleTimeString([], {hour: "2-digit", minute: "2-digit"});
                    const uploadLocalDate = formatDate(uploadedDate);
                    return {
                        id: item["ID"],
                        fileName: item["Filename"],
                        date: uploadLocalDate,
                        time: uploadLocalTime,
                        success: getSuccessRecords(item),
                        errors: item["TotalErrorRows"]
                    }
                })
            })
            .then((result) => {
                setSelectedHistory(result[0]);
                setUploadHistory(result)
            });
    }

    function getSuccessRecords(item) {
        let totalErrRows = 0;
        if (!isNaN(item["TotalErrorRows"])) {
            totalErrRows =  item["TotalErrorRows"]
        }
        if (!isNaN(item["TotalRecords"])) {
            return item["TotalRecords"] - totalErrRows
        }
        return 0
    }

    function getTotalRegistryUploadCount() {
        if (tableData && tableData.length) {
            return tableData.length;
        }
        return 0;
    }

    return (
        <div>
            <div className="upload-csv">
                {infoTitle && (
                    <TotalRecords
                        title={infoTitle}
                        count={getTotalRegistryUploadCount()}
                    />
                )}
                <UploadComponent
                    fileUploadAPI={fileUploadAPI}
                    onUploadComplete={() => {
                        fetchUploadHistory();
                        if (onRefresh) {
                            onRefresh();
                        }
                    }}
                    uploadHistoryCount={selectedHistory && selectedHistory.success}
                    errorCount={selectedHistory && selectedHistory.errors}
                    handleShow={handleShow}
                />
            </div>
            <div className="upload-csv-container">
                <div className="upload-history">
                    <UploadHistoryTable
                        data={tableData}
                        headerData={tableHeader}
                        title={tableTitle}
                        emptyListMessage={emptyListMessage}
                    />
                </div>
                <div className="upload-history">
                    <UploadHistoryTable
                        data={uploadHistory}
                        headerData={uploadCSVHeaderData}
                        onCellClicked={(value) => {
                            setSelectedHistory(value);
                            handleShow();
                        }}
                        title="Uploads History"
                    />
                </div>
                <div className="error-temp">
                    {selectedHistory && (
                        <UploadErrors uploadHistory={selectedHistory}
                                      fileUploadHistoryDetailsAPI={fileUploadErrorsAPI.replace(":id", selectedHistory.id)}
                                      handleClose={handleClose} show={show}/>
                    )}
                </div>
            </div>
        </div>
    );
};

function UploadErrors({
                          uploadHistory,
                          fileUploadHistoryDetailsAPI,
                          handleClose,
                          show,
                      }) {
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


    return (
        <Modal
            show={show} onHide={handleClose}
            aria-labelledby="contained-modal-title-vcenter"
            centered
            className="modal-container"
            dialogClassName="my-modal"
        >
            <Modal.Header closeButton className="title">
                <Modal.Title>{uploadHistory.fileName}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <div className="error-container">
                    <div className="error-count ml-lg-5 mt-5">
                        <img src={ProgramActive} width={"50px"} height={"50px"} alt={"Record Success"}/>
                        <h3>{uploadHistory.success}</h3>
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
            </Modal.Body>
        </Modal>
    );
}

const uploadCSVHeaderData = [
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
        title: "SUCCESS",
        key: "success"
    },
    {
        title: "ERRORS",
        key: "errors"
    }
]

export default UploadHistory;
