import React from 'react';
import {API_URL} from "../../utils/constants";
import UploadHistory from "../UploadHistory/UploadHistory";

function Facilities() {

    return <UploadHistory
        fileUploadAPI={API_URL.FACILITY_API}
        fileUploadHistoryAPI={API_URL.FACILITY_FILE_UPLOAD_HISTORY_API}
        fileUploadErrorsAPI={API_URL.FACILITY_FILE_UPLOAD_ERRORS_API}
        infoTitle={"Total # of Records in the\nDIVOC Facility Registry"}
        tableTitle="All Facilities"
        fetchAPI={API_URL.FACILITY_API}
    />
}

export default Facilities;
