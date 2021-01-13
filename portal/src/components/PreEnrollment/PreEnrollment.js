import React from 'react';
import UploadHistory from "../UploadHistory/UploadHistory";

function PreEnrollment() {

    const fileUploadAPI = '/divoc/admin/api/v1/enrollments';
    const fileUploadHistoryAPI = '/divoc/admin/api/v1/enrollments/uploads'
    const fileUploadErrorsAPI = '/divoc/admin/api/v1/enrollments/uploads/:id/errors'

    return <UploadHistory
        fileUploadAPI={fileUploadAPI}
        fileUploadHistoryAPI={fileUploadHistoryAPI}
        fileUploadErrorsAPI={fileUploadErrorsAPI}
        infoTitle={"Total # of Enrollments in the\nDIVOC Enrollments Registry"}
    />
}

export default PreEnrollment;
