import React, {useEffect, useState} from 'react';
import UploadCSV from '../UploadCSV/UploadCSV';
import {useAxios} from "../../utils/useAxios";
import {CustomTable} from "../CustomTable";
import {useKeycloak} from "@react-keycloak/web";
import {CONSTANTS, SampleCSV} from "../../utils/constants";
import {TotalRecords} from "../TotalRecords";

function VaccinatorsRegistry() {
    const {keycloak} = useKeycloak();
    const [vaccinators, setVaccinators] = useState([]);
    const fileUploadAPI = '/divoc/admin/api/v1/vaccinators';
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
            {keycloak.hasResourceRole(CONSTANTS.ADMIN_ROLE, CONSTANTS.PORTAL_CLIENT) &&
            <div className="d-flex mt-3">
                <UploadCSV fileUploadAPI={fileUploadAPI} onUploadComplete={fetchVaccinators}
                           sampleCSV={SampleCSV.VACCINATOR_REGISTRY}
                />
                <TotalRecords
                    title={"Total # of Records in the\nDIVOC Vaccinators Registry"}
                    count={vaccinators.length}
                />
            </div>
            }
            <CustomTable data={vaccinators} fields={["serialNum", "name", "facilityIds", "status"]}/>
        </div>
    );
}

export default VaccinatorsRegistry;
