import React, {useEffect, useState} from "react";
import {TabPanels} from "../TabPanel/TabPanel";
import Certificates from "../CertificateRegistry/CertificateRegistry"
import {SampleCSV} from "../../utils/constants";
import DownloadImg from "../../assets/img/download.svg"
import "./FacilityAdmin.css"
import {Button, Col, Row} from "react-bootstrap";
import {RoleSetup} from "../RoleSetup"
import Vaccinators from "../facility/Vaccinators/Vaccinators";
import ProgramOverview from "../ProgramOverview";
import Beneficiaries from "../Beneficiaries/Beneficiaries";


export default function FacilityAdmin(props) {
    const tabIndex = props.location?.state?.tabIndex;
    useEffect(() => {
    }, []);

    return (
        <TabPanels tabs={[
            {
                title: "Upload Vaccination Details",
                component: <Certificates/>,
                rightTabContent: <Button bsPrefix={"btn-template"} href={SampleCSV.BULK_CERTIFY}>
                    <Col className="d-flex flex-row">
                        <h6>DOWNLOAD TEMPLATE.CSV</h6>
                        <img src={DownloadImg} alt={"Download CSV"}/>
                    </Col>
                </Button>
            },
            {title: "Role Setup", component: <RoleSetup/>},
            {title: "Vaccinator Details", component: <Vaccinators/>},
            {title: "Program Overview", component: <ProgramOverview/>},
            {title: "Beneficiaries", component: <Beneficiaries/>},
        ]}
        tabIndex={tabIndex}
        />
    );
}
