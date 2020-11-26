import React from 'react';
import UploadCSV from '../UploadCSV/UploadCSV';

function Facilities(){
  const fileUploadAPI = 'divoc/admin/api/v1/facilities';
  
  return(
    <UploadCSV fileUploadAPI={fileUploadAPI}/>
  );
}
export default Facilities;