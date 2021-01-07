import React from 'react';
import UploadHistory from "../UploadHistory/UploadHistory";

function Facilities() {
    const fileUploadAPI = '/divoc/admin/api/v1/facilities';
    const fileUploadHistoryAPI = '/divoc/admin/api/v1/facility/uploads'
    const fileUploadErrorsAPI = '/divoc/admin/api/v1/facility/uploads/:id/errors'

    return <UploadHistory
        fileUploadAPI={fileUploadAPI}
        fileUploadHistoryAPI={fileUploadHistoryAPI}
        fileUploadErrorsAPI={fileUploadErrorsAPI}
    />
}

export default Facilities;
