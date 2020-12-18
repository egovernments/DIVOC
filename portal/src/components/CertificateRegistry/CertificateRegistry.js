import React, {useEffect} from 'react';
import UploadCSV from '../UploadCSV/UploadCSV';

function Certificates() {
    const fileUploadAPI = '/divoc/api/v1/bulkCertify';

    return (
        <div>
            <div className="d-flex mt-3">
                <UploadCSV fileUploadAPI={fileUploadAPI} />
            </div>
        </div>
    );
}

export default Certificates;