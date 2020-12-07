import React from "react";
import {TabPanels} from "../TabPanel/TabPanel";
import {RoleSetup} from "../RoleSetup";
import VaccinatorsRegistry from "../VaccinatorsRegistry/VaccinatorsRegistry";


export default function FacilityAdmin() {
    return (
        <TabPanels tabs={[
            {title: "Role Setup", component: <RoleSetup/>},
            {title: "Vaccinator Details", component: <VaccinatorsRegistry/>},
            {title: "Program Overview", component: <span>Program Overview</span>},

        ]}/>
    );
}
