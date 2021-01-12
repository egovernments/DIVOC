import React from 'react';
import {API_URL} from "../../utils/constants";
import UploadHistory from "../UploadHistory/UploadHistory";

function Facilities() {
    const fileUploadHistoryAPI = '/divoc/admin/api/v1/facility/uploads'
    const fileUploadErrorsAPI = '/divoc/admin/api/v1/facility/uploads/:id/errors'
    const fileUploadAPI = API_URL.FACILITY_API;

    return <UploadHistory
        fileUploadAPI={fileUploadAPI}
        fileUploadHistoryAPI={fileUploadHistoryAPI}
        fileUploadErrorsAPI={fileUploadErrorsAPI}
    />
}

export default Facilities;
