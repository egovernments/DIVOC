import React, {useEffect, useState} from "react";
import "./index.scss";
import {DropdownButton, Form} from "react-bootstrap";
import Button from "react-bootstrap/Button";
import {ACTION_PATIENT_COMPLETED, useConfirmVaccine} from "../../ConfirmVaccination";
import DropdownItem from "react-bootstrap/DropdownItem";
import {SyncFacade} from "../../SyncFacade";

export const SelectVaccinator = (props) => {
    const {markPatientComplete, getFormDetails, goNext} = useConfirmVaccine();
    const [vaccinators, setVaccinators] = useState([])
    const [selectedVaccinator, setSelectedVaccinator] = useState();
    const [selectedMedicine, setSelectedMedicine] = useState();
    const [medicines, setMedicines] = useState([])
    const [batchIds, setBatchIds] = useState([])
    const [selectedBatchIds, setSelectedBatchIds] = useState();
    const [batchCode, setBatchCode] = useState();

    function onActionBtnClick() {
        if (selectedVaccinator && selectedMedicine && batchCode) {
            const payload = {
                enrollCode: props.enrollCode,
                vaccinatorId: selectedVaccinator.osid,
                medicineId: selectedMedicine.name,
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

    function onBatchCodeChange(e) {
        setBatchCode(e.target.value)
    }

    useEffect(() => {
        getFormDetails()
            .then((result) => {
                setVaccinators(result.vaccinator)
                setMedicines(result.medicines)
                setBatchIds(result.batchIds)
                setSelectedVaccinator(result.selectedVaccinator)
                setSelectedMedicine(result.selectedMedicine)
                setSelectedBatchIds(result.selectedBatchId)
            })
    }, [])
    return (
        <div className="select-vaccinator-wrapper">
            <div className="table-wrapper">
                <span className="select-title">SELECT VACCINATOR</span>
                <DropdownButton id="dropdown-item-button" title="Dropdown button">
                    {
                        vaccinators.map((data, index) => {
                            if (selectedVaccinator && selectedVaccinator.osid === data.osid) {
                                return <DropdownItem as="button" active>{data.name}</DropdownItem>
                            } else {
                                return <DropdownItem as="button"
                                                     onClick={() => setSelectedVaccinator(data)}>
                                    {data.name}</DropdownItem>
                            }
                        })
                    }
                </DropdownButton>
                <span className="select-title">SELECT VACCINE</span>
                <DropdownButton id="dropdown-item-button" title="Dropdown button">
                    {
                        medicines.map((data, index) => {
                            if (selectedMedicine && selectedMedicine.osid === data.osid) {
                                return <DropdownItem as="button" active>{data.name}</DropdownItem>
                            } else {
                                return <DropdownItem as="button"
                                                     onClick={() => setSelectedMedicine(data)}>
                                    {data.name}</DropdownItem>
                            }
                        })
                    }
                </DropdownButton>

                <span className="select-title">SELECT BATCH IDS</span>
                <DropdownButton id="dropdown-item-button" title="Dropdown button">
                    {
                        batchIds.map((data, index) => {
                            if (selectedBatchIds && selectedBatchIds.name === data.name) {
                                return <DropdownItem as="button" active>{data.name}</DropdownItem>
                            } else {
                                return <DropdownItem as="button"
                                                     onClick={() => setSelectedMedicine(data)}>
                                    {data.name}</DropdownItem>
                            }
                        })
                    }
                </DropdownButton>

                <Form.Group>
                    <Form.Label className="d-block text-center">Enter Batch ID</Form.Label>
                    <Form.Control type="text" placeholder="XXXXXXXXXXXXX" onChange={onBatchCodeChange}/>
                </Form.Group>

            </div>
            <Button variant="outline-primary" className="action-btn" onClick={(onActionBtnClick)}>{"NEXT"}</Button>
        </div>
    );
}
