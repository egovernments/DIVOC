import React, {useEffect, useState} from 'react';
import UploadCSV from '../UploadCSV/UploadCSV';
import {useAxios} from "../../utils/useAxios";
import {CustomTable} from "../CustomTable";

function Facilities() {
    const [facilities, setFacilities] = useState([]);
    const fileUploadAPI = 'divoc/admin/api/v1/facilities';
    const axiosInstance = useAxios('');

    useEffect(() => {
        fetchFacilities()
    }, []);

    function fetchFacilities() {
        axiosInstance.current.get(fileUploadAPI)
            .then(res => {
                setFacilities(res.data)
            });
    }

    return (
        <div>
            <UploadCSV fileUploadAPI={fileUploadAPI} onUploadComplete={fetchFacilities}/>
            <CustomTable data={facilities} fields={[ "serialNum", "facilityName", "status", "admins"]}/>
        </div>
    );
}

export default Facilities;