import React from 'react';
import UploadCSV from '../UploadCSV/UploadCSV';

function PreEnrollment(){
    const fileUploadAPI = 'divoc/admin/api/v1/enrollments';
    return(
       <UploadCSV fileUploadAPI={fileUploadAPI}/>
    );
}
export default PreEnrollment;