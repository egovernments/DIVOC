import React, {useEffect, useState} from "react";
import "./index.scss";
import {DropdownButton, Form} from "react-bootstrap";
import Button from "react-bootstrap/Button";
import {ACTION_PATIENT_COMPLETED, useConfirmVaccine} from "../../ConfirmVaccination";
import DropdownItem from "react-bootstrap/DropdownItem";
import {SyncFacade} from "../../SyncFacade";
import Select from 'react-select'

export const SelectVaccinator = (props) => {
    const {markPatientComplete, getFormDetails, goNext} = useConfirmVaccine();
    const [vaccinators, setVaccinators] = useState([])
    const [selectedVaccinatorId, setSelectedVaccinatorId] = useState();
    const [selectedMedicineName, setSelectedMedicineName] = useState();
    const [medicines, setMedicines] = useState([])
    const [batchIds, setBatchIds] = useState([])
    const [selectedBatchId, setSelectedBatchId] = useState();
    const [batchCode, setBatchCode] = useState();

    function onActionBtnClick() {
        if (selectedVaccinatorId && selectedMedicineName && batchCode) {
            const payload = {
                enrollCode: props.enrollCode,
                vaccinatorId: selectedVaccinatorId,
                medicineId: selectedMedicineName,
                batchId: batchCode
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

    function onBatchCodeChange(e) {
        setBatchCode(e.target.value)
    }

    useEffect(() => {
        getFormDetails()
            .then((result) => {
                setVaccinators(result.vaccinator)
                setMedicines(result.medicines)
                setBatchIds(result.batchIds)
                setBatchCode(result.selectedBatchId)
                setSelectedVaccinatorId(result.selectedVaccinator)
                setSelectedMedicineName(result.selectedMedicine)
                setSelectedBatchId(result.selectedBatchId)
            })
    }, [])

    return (
        <div className="select-vaccinator-wrapper">
            <div className="table-wrapper">
                <span className="select-title">SELECT VACCINATOR</span>
                <Select
                    key={selectedVaccinatorId}
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
                <span className="select-title">SELECT VACCINE</span>
                <DropdownButton id="dropdown-item-button" title="Dropdown button">
                    {
                        medicines.map((data, index) => {
                            if (selectedMedicineName && selectedMedicineName.osid === data.osid) {
                                return <DropdownItem as="button" active>{data.name}</DropdownItem>
                            } else {
                                return <DropdownItem as="button"
                                                     onClick={() => setSelectedMedicineName(data.name)}>
                                    {data.name}</DropdownItem>
                            }
                        })
                    }
                </DropdownButton>

                <span className="select-title">SELECT BATCH IDS</span>
                <DropdownButton id="dropdown-item-button" title="Dropdown button">
                    {
                        batchIds.map((data, index) => {
                            if (selectedBatchId && selectedBatchId === data) {
                                return <DropdownItem as="button" active>{data}</DropdownItem>
                            } else {
                                return <DropdownItem as="button"
                                                     onClick={() => {
                                                         setBatchCode(data)
                                                         setSelectedBatchId(data)
                                                     }}>
                                    {data}</DropdownItem>
                            }
                        })
                    }
                </DropdownButton>

                <Form.Group>
                    <Form.Label className="d-block text-center">Enter Batch ID</Form.Label>
                    <Form.Control value={batchCode} type="text" placeholder="XXXXXXXXXXXXX"
                                  onChange={onBatchCodeChange}/>
                </Form.Group>

            </div>
            <Button variant="outline-primary" className="action-btn" onClick={(onActionBtnClick)}>{"CONFIRM"}</Button>
        </div>
    );
}
