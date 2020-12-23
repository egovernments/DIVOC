import React, {useEffect, useState} from "react";
import {TabPanels} from "../TabPanel/TabPanel";
import Certificates from "../CertificateRegistry/CertificateRegistry"
import {useKeycloak} from "@react-keycloak/web";
import {useAxios} from "../../utils/useAxios";
import {SampleCSV} from "../../utils/constants";
import DownloadImg from "../../assets/img/download.svg"
import "./FacilityAdmin.css"
import {Button, Col, Row} from "react-bootstrap";


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
                rightTabContent: <Button bsPrefix={"btn-template"}>
                    <Col className="d-flex flex-row">
                        <h6>DOWNLOAD TEMPLATE.CSV</h6>
                        <img src={DownloadImg} alt={"Download CSV"}/>
                    </Col>
                </Button>
            },
            // {title: "Role Setup", component: <RoleSetup/>},
            // {title: "Vaccinator Details", component: <VaccinatorList/>},
            // {title: "Program Overview", component: <span>Program Overview</span>},

        ]}/>
    );
}
