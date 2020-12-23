import React, {useEffect, useState} from "react";
import {TabPanels} from "../TabPanel/TabPanel";
import Certificates from "../CertificateRegistry/CertificateRegistry"
import {useKeycloak} from "@react-keycloak/web";
import {useAxios} from "../../utils/useAxios";


export default function FacilityAdmin() {
    const {keycloak} = useKeycloak();
    const [vaccinators, setVaccinators] = useState([]);
    const getVaccinatorPath = 'divoc/admin/api/v1/vaccinators';
    const axiosInstance = useAxios('');

    useEffect(() => {
        fetchVaccinators()
    }, []);

    function fetchVaccinators() {
        axiosInstance.current.get(getVaccinatorPath)
            .then(res => {
                setVaccinators(res.data)
            });
    }

    return (
        <TabPanels tabs={[
            {title: "Upload Vaccination Details", component: <Certificates />},
            // {title: "Role Setup", component: <RoleSetup/>},
            // {title: "Vaccinator Details", component: <VaccinatorList/>},
            // {title: "Program Overview", component: <span>Program Overview</span>},

        ]}/>
    );
}
