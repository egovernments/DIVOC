import React, {useEffect, useState} from 'react';
import UploadCSV from '../UploadCSV/UploadCSV';
import {useAxios} from "../../utils/useAxios";
import {TotalRecords} from "../TotalRecords";
import {CustomTable} from "../CustomTable";

function Facilities() {
    const [facilities, setFacilities] = useState([]);
    const fileUploadAPI = '/divoc/admin/api/v1/facilities';
    const axiosInstance = useAxios('');

    useEffect(() => {
        fetchFacilities()
    }, []);

    function fetchFacilities() {
        axiosInstance.current.get(fileUploadAPI)
            .then(res => {
                setFacilities(res.data)
            }).catch(e => console.log(e));
    }

    return (
        <div>
            <div className="d-flex mt-3">
                <UploadCSV fileUploadAPI={fileUploadAPI}
                           onUploadComplete={fetchFacilities}
                />
                <TotalRecords
                    title={"Total # of Records in the\n DIVOC Facility Registry"}
                    count={facilities.length}
                />
            </div>
            <CustomTable data={facilities} fields={["serialNum", "facilityName", "admins", "status"]}/>
        </div>
    );
}

export default Facilities;
