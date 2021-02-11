import React, { useEffect,useState } from 'react';
import {API_URL} from "../../utils/constants";
import UploadHistory from "../UploadHistory/UploadHistory";
import { useAxios } from "../../utils/useAxios";
import PreEnrollmentUploadCSV from "../PreEnrollmentUploadCSV/PreEnrollmentUploadCSV";
import { maskPersonalDetails } from '../../utils/maskPersonalDetails';

function PreEnrollment() {

    const axiosInstance = useAxios("");
    const [data,setData] = useState([]);

    useEffect(() => {
        fetchTableDetails();
    }, []);

    function fetchTableDetails() {
        axiosInstance.current.get(API_URL.PRE_ENROLLMENT_FILE_UPLOAD_API)
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
                        nationalId: maskPersonalDetails(item["nationalId"]),
                        name: item["name"],
                    }
                })
            })
            .then((result) => {
                setData(result)
            });
    }

    const AllFacilitiesHeaderData= [
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
        fileUploadAPI={API_URL.PRE_ENROLLMENT_FILE_UPLOAD_API}
        fileUploadHistoryAPI={API_URL.PRE_ENROLLMENT_FILE_UPLOAD_HISTORY_API}
        fileUploadErrorsAPI={API_URL.PRE_ENROLLMENT_FILE_UPLOAD_ERRORS_API}
        infoTitle={"Records in the DIVOC Pre-Enrollment Registry"}
        UploadComponent={PreEnrollmentUploadCSV}
        tableTitle="All Pre-Enrollments"
        tableData={data}
        tableHeader={AllFacilitiesHeaderData}
    />
}

export default PreEnrollment;
