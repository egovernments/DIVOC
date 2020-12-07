import React from 'react';
import {TabPanels} from "../TabPanel/TabPanel";
import FacilityActivation from "../FacilityActivation/FacilityActivation";
import FacilityAdjustingRate from "../FacilityAdjustingRate/FacilityAdjustingRate";

function FacilityController() {
    return (
        <TabPanels tabs={[
            {title: "Facility Activation", component: <FacilityActivation/>},
            {title: "Adjusting Rate", component: <FacilityAdjustingRate/>},
        ]}/>
    );
}

export default FacilityController;