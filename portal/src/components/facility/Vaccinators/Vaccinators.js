import React, {useEffect, useState} from "react";
import {useAxios} from "../../../utils/useAxios";
import "./Vaccinators.module.css"
import VaccinatorDetails from "../VaccinatorDetails/VaccinatorDetails";
import VaccinatorList from "../VaccinatorList/VaccinatorList";
import keycloak from "../../../utils/keycloak";
import {equals, reject} from "ramda";
import {API_URL} from "../../../utils/constants";
import styles from "./Vaccinators.module.css";


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
                fetchVaccinators(res["attributes"]["facility_code"][0]).then(res => {
                    res.data.forEach(item => {
                        if (!("programs" in item)) {
                            Object.assign(item, {programs: []});
                        }
                    });
                    setVaccinators(res.data)
                })
            })
    }, []);

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
                    console.log("got selected vaccinatior ", vaccinator);
                    setSelectedVaccinator(vaccinator);
                }
            })
        });
    };

    return (
        <div>
            {enableVaccinatorDetailView === false &&
            <div>
                <div className={`row ${styles['container']}`}>
                    <button className={`${styles['add-vaccinator-button']}`} onClick={onAddVaccinator}>+ ADD VACCINATOR</button>
                </div>
                <div className={`row ${styles['container']}`}>
                    <VaccinatorList
                        vaccinators={vaccinators}
                        onSelectVaccinator={onSelectVaccinator}
                    />
                </div>
            </div>
            }
            {enableVaccinatorDetailView === true &&
                <VaccinatorDetails
                    selectedVaccinator={selectedVaccinator}
                    setEnableVaccinatorDetailView={setEnableVaccinatorDetailView}
                    fetchVaccinators={fetchVaccinators}
                    onSelectVaccinatorBasedOnCode={onSelectVaccinatorBasedOnCode}
                />
            }
        </div>
    );
}
