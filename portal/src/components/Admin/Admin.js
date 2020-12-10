import React from "react";
import VaccineRegistration from "../VaccineRegistration/VaccineRegistration";
import {TabPanels} from "../TabPanel/TabPanel";
import VaccinatorsRegistry from "../VaccinatorsRegistry/VaccinatorsRegistry";
import FacilitiesRegistry from "../FacilitiesRegistry/FacilitiesRegistry";
import ProgramRegistration from "../ProgramRegistration/ProgramRegistration";
import PreEnrollment from "../PreEnrollment/PreEnrollment";


export default function Admin() {

    return (
        <TabPanels tabs={[
            {title: 'Facilities', component: <FacilitiesRegistry/>},
            {title: 'Vaccinators', component: <VaccinatorsRegistry/>},
            {title: 'Vaccine Programs', component: <ProgramRegistration/>},
            {title: 'Vaccines', component: <VaccineRegistration/>},
            {title: 'Pre-Enrollment', component: <PreEnrollment/>},

        ]}/>
    );
}
