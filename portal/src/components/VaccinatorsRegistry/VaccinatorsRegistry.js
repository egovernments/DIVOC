import React from 'react';
import UploadCSV from '../UploadCSV/UploadCSV';

function VaccinatorsRegistry(){
  const fileUploadAPI = 'divoc/admin/api/v1/vaccinators';

    return(
      <UploadCSV fileUploadAPI={fileUploadAPI}/>
    );
}
export default VaccinatorsRegistry;