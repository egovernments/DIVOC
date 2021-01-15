import React from 'react';
import UploadHistory from "../UploadHistory/UploadHistory";
import {API_URL} from "../../utils/constants";

function PreEnrollment() {


    return <UploadHistory
        fileUploadAPI={API_URL.PRE_ENROLLMENT_FILE_UPLOAD_API}
        fileUploadHistoryAPI={API_URL.PRE_ENROLLMENT_FILE_UPLOAD_HISTORY_API}
        fileUploadErrorsAPI={API_URL.PRE_ENROLLMENT_FILE_UPLOAD_ERRORS_API}
        infoTitle={"Total # of Enrollments in the\nDIVOC Enrollments Registry"}
    />
}

export default PreEnrollment;
