import React from "react";
import { TabPanels } from "../TabPanel/TabPanel";
import FacilityActivation from "../FacilityActivation/FacilityActivation";
import FacilityAdjustingRate from "../FacilityAdjustingRate/FacilityAdjustingRate";
import FacilityDetails from "../FacilityDetails/FacilityDetails";

function FacilityController() {
    const PROGRAMS = ["C-19 Program"];

    const STATE_NAMES = {
        AP: "Andhra Pradesh",
        AR: "Arunachal Pradesh",
        AS: "Assam",
        BR: "Bihar",
        CT: "Chhattisgarh",
        GA: "Goa",
        GJ: "Gujarat",
        HR: "Haryana",
        HP: "Himachal Pradesh",
        JH: "Jharkhand",
        KA: "Karnataka",
        KL: "Kerala",
        MP: "Madhya Pradesh",
        MH: "Maharashtra",
        MN: "Manipur",
        ML: "Meghalaya",
        MZ: "Mizoram",
        NL: "Nagaland",
        OR: "Odisha",
        PB: "Punjab",
        RJ: "Rajasthan",
        SK: "Sikkim",
        TN: "Tamil Nadu",
        TG: "Telangana",
        TR: "Tripura",
        UT: "Uttarakhand",
        UP: "Uttar Pradesh",
        WB: "West Bengal",
        AN: "Andaman and Nicobar Islands",
        CH: "Chandigarh",
        DN: "Dadra and Nagar Haveli and Daman and Diu",
        DL: "Delhi",
        JK: "Jammu and Kashmir",
        LA: "Ladakh",
        LD: "Lakshadweep",
        PY: "Puducherry",
        TT: "All of India",
    };

    const DISTRICT_NAMES = {
        Bagalkote: 5,
        Ballari: 2,
        Belagavi: 4,
        "Bengaluru Rural": 3,
        "Bengaluru Urban": 2,
        Bidar: 1,
        Chamarajanagara: 4,
        Chikkaballapura: 5,
        Chikkamagaluru: 3,
        Chitradurga: 6,
        "Dakshina Kannada": 2,
        Davanagere: 3,
        Dharwad: 5,
        Gadag: 1,
        Hassan: 2,
        Haveri: 4,
        Kalaburagi: 3,
        Kodagu: 2,
        Kolar: 1,
        Koppal: 4,
        Mandya: 2,
        Mysuru: 7,
        "Other State": 3,
        Raichur: 6,
        Ramanagara: 5,
        Shivamogga: 7,
        Tumakuru: 3,
        Udupi: 6,
        "Uttara Kannada	": 2,
        " Vijayapura": 8,
        Yadgir: 2,
    };

    return (
        <TabPanels
            tabs={[
                {
                    title: "Facility Activation",
                    component: (
                        <FacilityActivation
                            districtList={DISTRICT_NAMES}
                            stateList={STATE_NAMES}
                            program={PROGRAMS}
                        />
                    ),
                },
                {
                    title: "Adjusting Rate",
                    component: (
                        <FacilityAdjustingRate
                            districtList={DISTRICT_NAMES}
                            stateList={STATE_NAMES}
                            program={PROGRAMS}
                        />
                    ),
                },
                {
                    title: "All Facilities",
                    component: (
                        <FacilityDetails
                            districtList={DISTRICT_NAMES}
                            stateList={STATE_NAMES}
                            program={PROGRAMS}
                        />
                    ),
                },
            ]}
        />
    );
}

export default FacilityController;