import React from 'react';
import {TabPanels} from "../TabPanel/TabPanel";
import FacilityActivation from "../FacilityActivation/FacilityActivation";
import FacilityAdjutingRate from "../FacilityAdjutingRate/FacilityAdjutingRate";

function FacilityController() {
    return (
        <TabPanels tabs={[
            {title: "Facility Activation", component: <FacilityActivation/>},
            {title: "Adjusting Rate", component: <FacilityAdjutingRate/>},
        ]}/>
    );
}

export default FacilityController;