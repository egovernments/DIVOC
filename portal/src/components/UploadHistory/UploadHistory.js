import React, { useEffect, useState } from "react";
import { useAxios } from "../../utils/useAxios";
import { formatDate } from "../../utils/dateutil";
import UploadCSV from "../UploadCSV/UploadCSV";
import { UploadHistoryTable } from "../UploadHistoryTable";
import withStyles from "@material-ui/core/styles/withStyles";
import Paper from "@material-ui/core/Paper";
import { Card } from "@material-ui/core";
import ProgramActive from "../../assets/img/program-active.svg";
import { UploadErrorList } from "../UploadHistoryTable/UploadErrorList";
import "./UploadHistory.css";
import { TotalRecords } from "../TotalRecords";

import Modal from "react-bootstrap/Modal";

const UploadHistory = ({
    fileUploadAPI,
    fileUploadHistoryAPI,
    fileUploadErrorsAPI,
    infoTitle,
    UploadComponent = UploadCSV,
    tableTitle,
    fetchAPI,
}) => {
    const axiosInstance = useAxios("");
    const [uploadHistory, setUploadHistory] = useState([]);
    const [allFacilities, setAllFacilities] = useState([]);
    const [selectedHistory, setSelectedHistory] = useState(null);
    const [show, setShow] = useState(false);
    const [selectedFacility, setSelectedFacility] = useState(null);

    const handleClose = () => setShow(false);
    const handleShow = () => setShow(true);
    useEffect(() => {
        fetchFacilities();
        fetchUploadHistory();
    }, []);

    function fetchFacilities() {
        axiosInstance.current.get(fetchAPI)
            .then(res => {
                return res.data
            })
            .catch(e => {
                console.log(e);
                return []
            })
            .then((result) => {
                return result.map((item, index) => {
                    return {
                        facilityId: item["facilityCode"],
                        name: item["facilityName"],
                        state: item["address"].state,
                    }
                })
            })
            .then((result) => {
                setAllFacilities(result)
            });
    }

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
                    const uploadLocalTime = uploadedDate.toLocaleTimeString([],{ hour: "2-digit", minute: "2-digit" });
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
                setUploadHistory(result)
            });
    }

    function getSuccessRecords(item) {
        if (!isNaN(item["TotalRecords"]) && !isNaN(item["TotalErrorRows"])) {
            return item["TotalRecords"] - item["TotalErrorRows"]
        }
        return 0
    }

    function getTotalSuccessUploadCount() {
        let sum = 0;
        for (let i = 0; i < uploadHistory.length; i++) {
            sum += uploadHistory[i].success
        }
        return sum;
    }

    return (
        <div>
            <div className="upload-csv">
                {infoTitle && (
                    <TotalRecords
                        title={infoTitle}
                        count={getTotalSuccessUploadCount()}
                    />
                )}
                <UploadComponent
                    fileUploadAPI={fileUploadAPI}
                    onUploadComplete={() => {
                        fetchUploadHistory();
                    }}
                    uploadHistoryCount={selectedHistory && selectedHistory.success}
                    handleShow={handleShow}
                />
            </div>
            <div className="upload-csv-container">
                <div>
                    <UploadHistoryTable 
                        data={allFacilities}
                        headerData={AllFacilitiesHeaderData}
                        onCellClicked={(value) => {
                            setSelectedFacility(value);
                        }}
                        title={tableTitle}
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
                        <UploadErrors uploadHistory={selectedHistory} fileUploadHistoryDetailsAPI={fileUploadErrorsAPI.replace(":id", selectedHistory.id)} handleClose={handleClose} show={show}/> 
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
        >
            <Modal.Header closeButton className="title">
                <Modal.Title >{uploadHistory.fileName}</Modal.Title>
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

const AllFacilitiesHeaderData= [
    {
        title: "FACILITY ID",
        key: "facilityId"
    },
    {
        title: "FACILITY NAME",
        key: "name"
    },
    {
        title: "STATE",
        key: "state"
    },
    {
        title: "UPLOADED ON",
        key: "uploadedOn"
    }
]
export default UploadHistory;
