import React, {useEffect, useState} from 'react';
import UploadCSV from '../UploadCSV/UploadCSV';
import {useAxios} from "../../utils/useAxios";
import {CustomTable} from "../CustomTable";
import {useKeycloak} from "@react-keycloak/web";
import {CONSTANTS} from "../../utils/constants";

function VaccinatorsRegistry() {
    const {keycloak} = useKeycloak();
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
            {keycloak.hasResourceRole(CONSTANTS.ADMIN_ROLE, CONSTANTS.PORTAL_CLIENT) && <UploadCSV fileUploadAPI={fileUploadAPI} onUploadComplete={fetchVaccinators}/>}
            <CustomTable data={vaccinators} fields={["serialNum", "name", "status"]}/>
        </div>
    );
}

export default VaccinatorsRegistry;