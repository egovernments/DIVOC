import React, {useEffect, useState} from "react";
import {TabPanels} from "../TabPanel/TabPanel";
import Certificates from "../CertificateRegistry/CertificateRegistry"
import {useKeycloak} from "@react-keycloak/web";
import {useAxios} from "../../utils/useAxios";
import {Button} from "react-bootstrap";
import {SampleCSV} from "../../utils/constants";
import "./FacilityAdmin.css"


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
            {
                title: "Upload Vaccination Details",
                component: <Certificates/>,
                rightTabContent: <a href={SampleCSV.BULK_CERTIFY} className={"btn-template"}>
                    <div onClick={() => {
                    }}>
                        <p>DOWNLOAD TEMPLATE>CSV</p>
                        <img/>
                    </div>
                </a>
            },
            // {title: "Role Setup", component: <RoleSetup/>},
            // {title: "Vaccinator Details", component: <VaccinatorList/>},
            // {title: "Program Overview", component: <span>Program Overview</span>},

        ]}/>
    );
}
