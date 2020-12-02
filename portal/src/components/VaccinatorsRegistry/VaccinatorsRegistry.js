import React, {useEffect, useState} from 'react';
import UploadCSV from '../UploadCSV/UploadCSV';
import {useAxios} from "../../utils/useAxios";
import {CustomTable} from "../CustomTable";

function VaccinatorsRegistry() {
    const [vaccinators, setVaccinators] = useState([]);
    const fileUploadAPI = 'divoc/admin/api/v1/vaccinators';
    const axiosInstance = useAxios('');
    useEffect(() => {
        fetchVaccinators()
    }, []);

    function fetchVaccinators() {
        axiosInstance.current.get(fileUploadAPI)
            .then(res => {
                setVaccinators(res.data)
            });
    }

    return (
        <div>
            <UploadCSV fileUploadAPI={fileUploadAPI} onUploadComplete={fetchVaccinators}/>
            <CustomTable data={vaccinators} fields={["serialNum", "name", "status"]}/>
        </div>
    );
}

export default VaccinatorsRegistry;