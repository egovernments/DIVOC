import React, {useEffect, useState} from 'react';
import UploadCSV from '../UploadCSV/UploadCSV';
import {useAxios} from "../../utils/useAxios";
import {TotalRecords} from "../TotalRecords";
import {API_URL, SampleCSV} from "../../utils/constants";
import {CustomTable} from "../CustomTable";

function Facilities() {
    const [facilities, setFacilities] = useState([]);
    const fileUploadAPI = API_URL.FACILITY_API;
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
            <div className="d-flex mt-3">
                <UploadCSV fileUploadAPI={fileUploadAPI} onUploadComplete={fetchFacilities}
                           sampleCSV={SampleCSV.FACILITY_REGISTRY}/>
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
