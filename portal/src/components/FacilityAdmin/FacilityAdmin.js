import React from "react";
import VaccineRegistration from "../VaccineRegistration/VaccineRegistration";
import {TabPanels, useStyles} from "../TabPanel/TabPanel";
import VaccinatorsRegistry from "../VaccinatorsRegistry/VaccinatorsRegistry";


export default function FacilityAdmin() {
    const [value, setValue] = React.useState(0);
    const classes = useStyles();
    const handleChange = (event, newValue) => {
        setValue(newValue);
    };
    return (
        <TabPanels tabs={[
            {title: "Vaccinators", component: <VaccinatorsRegistry/>},
            {title: "Enrollment", component: <VaccineRegistration/>}

        ]}/>
    );
}
