import React, {useEffect, useState} from 'react';
import {API_URL} from "../../utils/constants";
import UploadHistory from "../UploadHistory/UploadHistory";
import {useAxios} from "../../utils/useAxios";
import {formatDate} from "../../utils/dateutil";

function Facilities() {
    const axiosInstance = useAxios("");
    const [data, setData] = useState([]);

    useEffect(() => {
        fetchTableDetails();
    }, []);

    function fetchTableDetails() {
        axiosInstance.current.get(API_URL.FACILITY_API)
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
                        uploadedOn: item["osCreatedAt"] ? formatDate(item["osCreatedAt"]) : "-"
                    }
                })
            })
            .then((result) => {
                setData(result)
            });
    }

    const AllFacilitiesHeaderData = [
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

    return <UploadHistory
        fileUploadAPI={API_URL.FACILITY_API}
        fileUploadHistoryAPI={API_URL.FACILITY_FILE_UPLOAD_HISTORY_API}
        fileUploadErrorsAPI={API_URL.FACILITY_FILE_UPLOAD_ERRORS_API}
        infoTitle={"Records in the DIVOC Facility Registry"}
        tableTitle="All Facilities"
        tableData={data}
        tableHeader={AllFacilitiesHeaderData}
        onRefresh={() => fetchTableDetails()}
    />
}

export default Facilities;
