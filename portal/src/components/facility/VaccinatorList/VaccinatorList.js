import React, {useEffect, useState} from "react";
import {CustomTable} from "../../CustomTable";
import {useKeycloak} from "@react-keycloak/web";
import {useAxios} from "../../../utils/useAxios";


export default function VaccinatorList() {
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
        <CustomTable data={vaccinators} fields={["serialNum", "name", "facilityIds", "averageRating", "status"]} canSelectColumn={false}/>
    );
}
