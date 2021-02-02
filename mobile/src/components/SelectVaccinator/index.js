import React, {useEffect, useState} from "react";
import "./index.scss";
import Button from "react-bootstrap/Button";
import {ACTION_PATIENT_COMPLETED, useConfirmVaccine} from "../../ConfirmVaccination";
import {SyncFacade} from "../../SyncFacade";
import Select from 'react-select'
import AutoComplete from "../AutoComplete";

export const SelectVaccinator = (props) => {
    const {markPatientComplete, getFormDetails, goNext} = useConfirmVaccine();
    const [vaccinators, setVaccinators] = useState([])
    const [selectedVaccinatorId, setSelectedVaccinatorId] = useState();
    const [selectedMedicineName, setSelectedMedicineName] = useState();
    const [medicines, setMedicines] = useState([])
    const [batchIds, setBatchIds] = useState([])
    const [selectedBatchId, setSelectedBatchId] = useState();
    const [tempSelectedBatchId, setTempSelectedBatchId] = useState();

    function onActionBtnClick() {
        if (selectedVaccinatorId && selectedMedicineName && selectedBatchId) {
            const payload = {
                enrollCode: props.enrollCode,
                vaccinatorId: selectedVaccinatorId,
                medicineId: selectedMedicineName,
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

    useEffect(() => {
        getFormDetails()
            .then((result) => {
                setVaccinators(result.vaccinator)
                setMedicines(result.medicines)
                setBatchIds(result.batchIds)
                setSelectedVaccinatorId(result.selectedVaccinator)
                setSelectedMedicineName(result.selectedMedicine)
                setSelectedBatchId(result.selectedBatchId)
                setTempSelectedBatchId(result.selectedBatchId)
            })
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
                    onChange={(option) => {
                        setSelectedVaccinatorId(option.value)
                    }}/>
                <div className="select-title">SELECT VACCINE*</div>
                <Select
                    key={selectedMedicineName ?? "medicineId"}
                    isSearchable={false}
                    defaultValue={{value: selectedMedicineName, label: selectedMedicineName}}
                    options={medicines.map((item, index) => {
                        return {
                            label: item.name,
                            value: item.name,
                        }
                    })}
                    onChange={(option) => {
                        setSelectedMedicineName(option.value)
                    }}/>

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
            <Button variant="outline-primary" className="action-btn mt-4"
                    onClick={(onActionBtnClick)}>{"CONFIRM"}</Button>
        </div>
    );
}
