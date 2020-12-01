import React from "react";
import {TabPanels} from "../TabPanel/TabPanel";
import {RoleSetup} from "../RoleSetup";


export default function FacilityAdmin() {
    return (
        <TabPanels tabs={[
            {title: "Role Setup", component: <RoleSetup/>},
            {title: "Program Overview", component: <span>Program Overview</span>},
            {title: "Vaccinator Details", component: <span>vaccinator details</span>},

        ]}/>
    );
}
