import React, {useEffect, useState} from "react";
import {useAxios} from "../../../utils/useAxios";
import "./Vaccinators.css"
import VaccinatorDetails from "../VaccinatorDetails/VaccinatorDetails";
import VaccinatorList from "../VaccinatorList/VaccinatorList";


export default function Vaccinators() {
    const [vaccinators, setVaccinators] = useState([]);
    const [selectedVaccinator, setSelectedVaccinator] = useState({});
    const [enableVaccinatorDetailView, setEnableVaccinatorDetailView] = useState(false);
    const fileUploadAPI = '/divoc/admin/api/v1/vaccinators';
    const axiosInstance = useAxios('');
    useEffect(() => {
        fetchVaccinators()
    }, []);

    function fetchVaccinators() {
        axiosInstance.current.get(fileUploadAPI)
            .then(res => {
                setVaccinators(res.data)
            });
    }

    function onAddVaccinator() {
        setSelectedVaccinator({});
        setEnableVaccinatorDetailView(true);
    }

    const onSelectVaccinator = (vaccinators) => {
        setSelectedVaccinator(vaccinators);
        setEnableVaccinatorDetailView(true)
    };
    return (
        <div>
            {enableVaccinatorDetailView === false &&
            <div>
                <div>
                    <button className="add-vaccinator-button" onClick={onAddVaccinator}>+ ADD VACCINATOR</button>
                </div>
                <div >
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
                />
            }
        </div>
    );
}
