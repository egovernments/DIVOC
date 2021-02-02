import React from 'react';
import UploadHistory from "../UploadHistory/UploadHistory";
import {API_URL} from "../../utils/constants";
import PreEnrollmentUploadCSV from "../PreEnrollmentUploadCSV/PreEnrollmentUploadCSV";

function PreEnrollment() {


    return <UploadHistory
        fileUploadAPI={API_URL.PRE_ENROLLMENT_FILE_UPLOAD_API}
        fileUploadHistoryAPI={API_URL.PRE_ENROLLMENT_FILE_UPLOAD_HISTORY_API}
        fileUploadErrorsAPI={API_URL.PRE_ENROLLMENT_FILE_UPLOAD_ERRORS_API}
        infoTitle={"Total # of Enrollments in the\nDIVOC Enrollments Registry"}
        UploadComponent={PreEnrollmentUploadCSV}
        tableTitle="All Pre-Enrollments"
        fetchAPI={API_URL.PRE_ENROLLMENT_FILE_UPLOAD_API}
    />
}

export default PreEnrollment;
