import React from 'react';
import UploadHistory from "../UploadHistory/UploadHistory";
import {API_URL} from "../../utils/constants";

function VaccinatorsRegistry() {

    return <UploadHistory
        fileUploadAPI={API_URL.VACCINATOR_FILE_UPLOAD_API}
        fileUploadHistoryAPI={API_URL.VACCINATOR_FILE_UPLOAD_HISTORY_API}
        fileUploadErrorsAPI={API_URL.VACCINATOR_FILE_UPLOAD_ERRORS_API}
        infoTitle={"Total # of Records in the\nDIVOC Vaccinators Registry"}
    />
}

export default VaccinatorsRegistry;
