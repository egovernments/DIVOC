import React, {useEffect} from 'react';
import UploadCSV from '../UploadCSV/UploadCSV';
import {SampleCSV} from "../../utils/constants";

function Certificates() {
    const fileUploadAPI = '/divoc/api/v1/bulkCertify';

    return (
        <div>
            <div className="d-flex mt-3">
                <UploadCSV fileUploadAPI={fileUploadAPI}
                           sampleCSV={SampleCSV.BULK_CERTIFY}
                />
            </div>
        </div>
    );
}

export default Certificates;
