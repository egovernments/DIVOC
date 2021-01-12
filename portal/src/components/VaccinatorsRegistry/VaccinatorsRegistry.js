import React from 'react';
import UploadHistory from "../UploadHistory/UploadHistory";

function VaccinatorsRegistry() {

    const fileUploadAPI = '/divoc/admin/api/v1/vaccinators';
    const fileUploadHistoryAPI = '/divoc/admin/api/v1/vaccinators/uploads'
    const fileUploadErrorsAPI = '/divoc/admin/api/v1/vaccinators/uploads/:id/errors'

    return <UploadHistory
        fileUploadAPI={fileUploadAPI}
        fileUploadHistoryAPI={fileUploadHistoryAPI}
        fileUploadErrorsAPI={fileUploadErrorsAPI}
        infoTitle={"Total # of Records in the\nDIVOC Vaccinators Registry"}
    />
}

export default VaccinatorsRegistry;
