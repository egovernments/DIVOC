import React, {useEffect, useState} from 'react';
import {API_URL} from "../../utils/constants";
import UploadHistory from "../UploadHistory/UploadHistory";
import {useAxios} from "../../utils/useAxios";
import {formatDate} from "../../utils/dateutil";

function VaccinatorsRegistry() {
    const axiosInstance = useAxios("");
    const [data, setData] = useState([]);

    useEffect(() => {
        fetchTableDetails();
    }, []);

    function fetchTableDetails() {
        axiosInstance.current.get(API_URL.VACCINATORS_API)
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
                        nationalId: item["nationalIdentifier"],
                        name: item["name"],
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
            title: "National ID",
            key: "nationalId"
        },
        {
            title: "NAME",
            key: "name"
        },
        {
            title: "UPLOADED ON",
            key: "uploadedOn"
        }
    ]


    return <UploadHistory
        fileUploadAPI={API_URL.VACCINATORS_API}
        fileUploadHistoryAPI={API_URL.VACCINATOR_FILE_UPLOAD_HISTORY_API}
        fileUploadErrorsAPI={API_URL.VACCINATOR_FILE_UPLOAD_ERRORS_API}
        infoTitle={"Records in the DIVOC Vaccinator Registry"}
        tableTitle="All Vaccinators"
        emptyListMessage={"No Vaccinator Found"}
        tableData={data}
        tableHeader={AllFacilitiesHeaderData}
        onRefresh={() => fetchTableDetails()}
    />
}

export default VaccinatorsRegistry;
