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
            <div className="mt-5">
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
