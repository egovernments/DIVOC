import React, {useEffect, useState} from "react";
import {useAxios} from "../../../utils/useAxios";
import "./Vaccinators.css"
import VaccinatorDetails from "../VaccinatorDetails/VaccinatorDetails";
import VaccinatorList from "../VaccinatorList/VaccinatorList";
import keycloak from "../../../utils/keycloak";
import {equals, reject} from "ramda";
import {API_URL} from "../../../utils/constants";
import "./Vaccinators.css";

export default function Vaccinators() {
    const [vaccinators, setVaccinators] = useState([]);
    const [selectedVaccinator, setSelectedVaccinator] = useState({});
    const [enableVaccinatorDetailView, setEnableVaccinatorDetailView] = useState(false);
    const [facilityCode, setFacilityCode] = useState('');
    const axiosInstance = useAxios('');

    useEffect(() => {
        keycloak.loadUserProfile()
            .then(res => {
                setFacilityCode(res["attributes"]["facility_code"][0]);
                fetchSetVaccinators(res["attributes"]["facility_code"][0])
            })
    }, []);

    function fetchSetVaccinators(fc) {
        fetchVaccinators(fc).then(res => {
            res.data.forEach(item => {
                if (!("programs" in item)) {
                    Object.assign(item, {programs: []});
                }
            });
            setVaccinators(res.data)
        })
    }

    function fetchVaccinators(fc) {
        let params = {
            facilityCode: fc ? fc : facilityCode,
        };
        params = reject(equals(''))(params);
        const queryParams = new URLSearchParams(params);
        return axiosInstance.current.get(API_URL.VACCINATORS_API, {params: queryParams})
    }

    function onAddVaccinator() {
        setSelectedVaccinator({});
        setEnableVaccinatorDetailView(true);
    }

    const onSelectVaccinator = (vaccinator) => {
        setSelectedVaccinator(vaccinator);
        setEnableVaccinatorDetailView(true)
    };

    const onSelectVaccinatorBasedOnCode = (code) => {
        fetchVaccinators().then(res => {
            setVaccinators(res.data);
            res.data.map(vaccinator => {
                if (vaccinator.code === code) {
                    setSelectedVaccinator(vaccinator);
                }
            })
        });
    };

    return (
        <div className="vaccinator-list-container">
            {enableVaccinatorDetailView === false &&
            <div>
                <div className='mt-2 ml-4 d-flex justify-content-between align-items-center'>
                    <div className="title-vaccinator">All Vaccinators</div>
                    <button className='add-vaccinator-button mr-4' onClick={onAddVaccinator}>+ ADD
                        NEW VACCINATOR
                    </button>
                </div>
                <div className={`row pl-lg-5 pr-lg-5`}>
                    <VaccinatorList
                        vaccinators={vaccinators}
                        onSelectVaccinator={onSelectVaccinator}
                        fetchVaccinators={fetchSetVaccinators}
                    />
                </div>
            </div>
            }
            {enableVaccinatorDetailView === true &&
            <VaccinatorDetails
                selectedVaccinator={selectedVaccinator}
                setEnableVaccinatorDetailView={setEnableVaccinatorDetailView}
                onSelectVaccinatorBasedOnCode={onSelectVaccinatorBasedOnCode}
                facilityCode={facilityCode}
            />
            }
        </div>
    );
}


const sampleJson = [
    {
        "averageRating":
            0,
        "code":
            "65423456",
        "email":
            "sam@emial.com",
        "facilityIds":
            [
                "BLR14"
            ],
        "mobileNumber":
            "9878123456",
        "name":
            "sam",
        "nationalIdentifier":
            "87634562",
        "osid":
            "1-96d4342d-d2b6-4a1a-95ea-6120857e3f85",
        "programs":
            [
                {
                    "osid": "1-fdb3c409-a8e2-4b65-ac54-e2a1a43f8e6d",
                    "programId": "c19",
                    "status": "Active"
                }
            ],
        "status":
            "Active",
        "trainingCertificate":
            ""
    }
    ,
    {
        "averageRating":
            0,
        "code":
            "4365469609",
        "email":
            "b@rr.com",
        "facilityIds":
            [
                "BLR14"
            ],
        "mobileNumber":
            "4365469609",
        "name":
            "BRR",
        "nationalIdentifier":
            "4365469609",
        "osid":
            "1-d5b65639-12a4-412e-a379-b6bef1924c6e",
        "programs":
            [
                {
                    "certified": true,
                    "osid": "1-80ec6e8b-43bd-4728-8394-b97d183d6075",
                    "programId": "c19"
                }
            ],
        "status":
            "Active",
        "trainingCertificate":
            ""
    }
    ,
    {
        "averageRating":
            0,
        "code":
            "3733879826",
        "email":
            "b@rr2.com",
        "facilityIds":
            [
                "BLR14"
            ],
        "mobileNumber":
            "3733879826",
        "name":
            "BRR2",
        "nationalIdentifier":
            "3733879826",
        "osid":
            "1-6224c840-0792-492f-8b5e-88c95c27d235",
        "programs":
            [
                {
                    "osid": "1-eddd9363-3539-401a-bb51-0668419b9c85",
                    "programId": "c19"
                }
            ],
        "status":
            "Active",
        "trainingCertificate":
            ""
    }
    ,
    {
        "averageRating":
            0,
        "code":
            "7311990788",
        "email":
            "b@r4.com",
        "facilityIds":
            [
                "BLR14"
            ],
        "mobileNumber":
            "7311990788",
        "name":
            "Bb4",
        "nationalIdentifier":
            "7311990788",
        "osid":
            "1-1027b428-8418-4469-9b2d-47b4ed080244",
        "programs":
            [
                {
                    "certified": true,
                    "osid": "1-f0f9124c-ea07-40ba-b50b-3c497a9670a3",
                    "programId": "c19"
                }
            ],
        "status":
            "Active",
        "trainingCertificate":
            ""
    }
];
