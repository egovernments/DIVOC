import React, {useEffect, useState} from "react";
import "./index.scss";
import Button from "react-bootstrap/Button";
import {ACTION_PATIENT_COMPLETED, useConfirmVaccine} from "../../ConfirmVaccination";
import {SyncFacade} from "../../SyncFacade";
import Select from 'react-select'
import AutoComplete from "../AutoComplete";


const selectorTheme = theme => ({
    ...theme,
    colors: {
        ...theme.colors,
        primary25: 'neutral0',
        primary: 'black',
    },
});

export const SelectVaccinator = (props) => {
    const {markPatientComplete, getFormDetails, goNext} = useConfirmVaccine();
    const [vaccinators, setVaccinators] = useState([])
    const [selectedVaccinatorId, setSelectedVaccinatorId] = useState();
    const [selectedMedicineName, setSelectedMedicineName] = useState();
    const [selectedDose, setSelectedDose] = useState();
    const [medicines, setMedicines] = useState([])
    const [batchIds, setBatchIds] = useState([])
    const [selectedBatchId, setSelectedBatchId] = useState();
    const [tempSelectedBatchId, setTempSelectedBatchId] = useState();

    function isInputValid() {
        return selectedVaccinatorId && selectedMedicineName && selectedBatchId && selectedDose;
    }

    function onActionBtnClick() {
        if (isInputValid()) {
            const payload = {
                enrollCode: props.enrollCode,
                vaccinatorId: selectedVaccinatorId,
                medicineId: selectedMedicineName,
                dose: selectedDose,
                batchId: selectedBatchId
            }
            markPatientComplete(payload).then((value) => {
                return SyncFacade.push()
            }).then((value => {
                goNext(ACTION_PATIENT_COMPLETED, `/queue`, {});
            })).catch((e) => {
                goNext(ACTION_PATIENT_COMPLETED, `/queue`, {});
            })
        }
    }

    function defaultVaccinatorOption() {
        const defaultVaccinator = vaccinators.find((item) => item.osid === selectedVaccinatorId)
        if (defaultVaccinator) {
            return {
                label: defaultVaccinator.name,
                value: defaultVaccinator.osid,
            }
        }
    }

    function fetchDoseOptions() {
        const selectedMedicine = medicines.filter( item => item.name === selectedMedicineName)[0]
        const totalDoses = selectedMedicine.doseIntervals ? selectedMedicine.doseIntervals.length + 1 : 1;
        let doseCounts = [];
        for(let i = 1; i <= totalDoses; i++){
            doseCounts.push({label: i,value: i})
        }
        return doseCounts;
    }

    useEffect(() => {
        getFormDetails()
            .then((result) => {
                setVaccinators(result.vaccinator)
                setMedicines(result.medicines)
                setBatchIds(result.batchIds)
                setSelectedVaccinatorId(result.selectedVaccinator)
                setSelectedMedicineName(result.selectedMedicine)
                setSelectedDose(result.selectedDose)
                setSelectedBatchId(result.selectedBatchId)
                setTempSelectedBatchId(result.selectedBatchId)
            })
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    return (
        <div className="select-vaccinator-wrapper">
            <div className="table-wrapper">
                <div className="select-title">SELECT VACCINATOR*</div>
                <Select
                    key={selectedVaccinatorId ?? "vaccinatorId"}
                    isSearchable={false}
                    defaultValue={defaultVaccinatorOption()}
                    options={vaccinators.map((item, index) => {
                        return {
                            label: item.name,
                            value: item.osid,
                        }
                    })}
                    theme={selectorTheme}
                    onChange={(option) => {
                        setSelectedVaccinatorId(option.value)
                    }}/>
                <div className="select-title">SELECT VACCINE*</div>
                <Select
                    key={selectedMedicineName ?? "medicineId"}
                    isSearchable={false}
                    defaultValue={selectedMedicineName && {value: selectedMedicineName, label: selectedMedicineName}}
                    options={medicines.map((item, index) => {
                        return {
                            label: item.name,
                            value: item.name,
                        }
                    })}
                    theme={selectorTheme}
                    onChange={(option) => {
                        setSelectedMedicineName(option.value)
                    }}/>
                {selectedMedicineName && <div>
                    <div className="select-title">SELECT DOSE*</div>
                    <Select
                        key={selectedDose ?? "doseId"}
                        isSearchable={false}
                        defaultValue={selectedDose && {value: selectedDose, label: selectedDose}}
                        options={fetchDoseOptions()}
                        theme={selectorTheme}
                        onChange={(option) => {
                            setSelectedDose(option.value)
                        }}/>
                    </div>
                }
                <div className="d-flex flex-column">
                    <div className="select-title">ENTER BATCH ID*</div>
                    <AutoComplete
                        noSuggestion={false}
                        key={tempSelectedBatchId ?? "batchId"}
                        onChange={(value) => {
                            setSelectedBatchId(value)
                        }}
                        defaultText={selectedBatchId}
                        suggestions={batchIds}
                    />
                </div>
            </div>
            <Button variant="outline-primary" className="action-btn mt-4" disabled={!isInputValid()}
                    onClick={(onActionBtnClick)}>{"CONFIRM"}</Button>
        </div>
    );
}
