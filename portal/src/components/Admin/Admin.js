import React from "react";
import VaccineRegistration from "../VaccineRegistration/VaccineRegistration";
import {TabPanels} from "../TabPanel/TabPanel";
import VaccinatorsRegistry from "../VaccinatorsRegistry/VaccinatorsRegistry";
import FacilitiesRegistry from "../FacilitiesRegistry/FacilitiesRegistry";
import ProgramRegistration from "../ProgramRegistration/ProgramRegistration";
import PreEnrollment from "../PreEnrollment/PreEnrollment";
import {Button, Col} from "react-bootstrap";
import {SampleCSV} from "../../utils/constants";
import DownloadImg from "../../assets/img/download.svg";
import "./Admin.module.css"


export default function Admin() {

    return (
        <TabPanels tabs={[
            {
                title: 'Facilities',
                component: <FacilitiesRegistry/>,
                rightTabContent: <Button bsPrefix={"btn-template"} href={SampleCSV.FACILITY_REGISTRY}>
                    <Col className="d-flex flex-row">
                        <h6>DOWNLOAD TEMPLATE.CSV</h6>
                        <img src={DownloadImg} alt={"Download CSV"}/>
                    </Col>
                </Button>
            },
            {title: 'Vaccinators', component: <VaccinatorsRegistry/>},
            {title: 'Vaccine Programs', component: <ProgramRegistration/>},
            {title: 'Vaccines', component: <VaccineRegistration/>},
            {title: 'Pre-Enrollment', component: <PreEnrollment/>},

        ]}/>
    );
}
