import React, {createContext, useContext, useMemo, useReducer} from "react";
import "./index.scss"
import {BaseFormCard} from "../components/BaseFormCard";
import {Redirect, useHistory} from "react-router";
import {SelectVaccinator} from "../components/SelectVaccinator";
import {CONSTANT} from "../utils/constants";
import {appIndexDb} from "../AppDatabase";
import config from "config.json"
import {programDb} from "../Services/ProgramDB";
import {getSelectedProgram} from "../components/ProgramSelection";
import {getVaccinationDetails, saveVaccinationDetails} from "../utils/storage";
import {getMessageComponent, LANGUAGE_KEYS} from "../lang/LocaleContext";

export function ConfirmFlow(props) {
    return (
        <ConfirmVaccineProvider>
            <ConfirmVaccination {...props}/>
        </ConfirmVaccineProvider>
    );
}

export function ConfirmVaccination(props) {
    const {pageName, recipient_id} = props.match.params;

    function getForm() {
        switch (pageName) {
            case CONSTANT.SELECT_VACCINATOR:
                return <SelectVaccinator enrollCode={recipient_id}/>;
            default:
                return <Redirect to={config.urlPath + '/queue'}/>
        }
    }

    return (
        <div className="confirm-vaccination-container">
            <BaseFormCard title={getMessageComponent(LANGUAGE_KEYS.VACCINATION_TITLE)}>
                <div className="pt-3 form-wrapper">
                    {
                        getForm()
                    }
                </div>
                {

                }
            </BaseFormCard>
        </div>
    );
}


const ConfirmVaccineContext = createContext(null)

export function ConfirmVaccineProvider(props) {
    const [state, dispatch] = useReducer(confirmVaccineReducer, initialState)
    const value = useMemo(() => [state, dispatch], [state])
    return <ConfirmVaccineContext.Provider value={value} {...props} />
}

const initialState = {};

function confirmVaccineReducer(state, action) {
    switch (action.type) {
        case ACTION_PATIENT_COMPLETED: {
            const newState = {...state}
            newState.enrollCode = action.payload.enrollCode;
            newState.vaccinatorId = action.payload.vaccinatorId;
            newState.medicineId = action.payload.medicineId;
            newState.batchCode = action.payload.batchCode
            return newState
        }
        default:
            throw new Error();
    }
}

export const ACTION_PATIENT_COMPLETED = "patientCompleted"

export function useConfirmVaccine() {

    const context = useContext(ConfirmVaccineContext)
    const history = useHistory();
    if (!context) {
        throw new Error(`useConfirmVaccine must be used within a ConfirmVaccineProvider`)
    }
    const [state, dispatch] = context;

    const goNext = function (current, next, payload) {
        payload.currentForm = current;
        dispatch({type: current, payload: payload})
        if (next) {
            history.push(config.urlPath + next)
        }
    }

    const goBack = function () {
        history.goBack()
    }

    const getFormDetails = async function () {
        const selectedProgram = getSelectedProgram();
        const vaccinator = await programDb.getVaccinators();
        const medicines = await programDb.getMedicines(selectedProgram)
        const vaccinationDetails = getVaccinationDetails();
        return {
            vaccinator: vaccinator || [],
            selectedVaccinator: vaccinationDetails.vaccinatorId,
            medicines: medicines || [],
            selectedMedicine: vaccinationDetails.medicineId,
            selectedDose: vaccinationDetails.selectedDose,
            batchIds: vaccinationDetails.batchIds || [],
            selectedBatchId: vaccinationDetails.lastBatchId,
        }
    }

    const markPatientComplete = async function (payload) {
        saveVaccinationDetails(payload)
        try {
            await appIndexDb.saveEvent(payload)
            await appIndexDb.markPatientAsComplete(payload)
        } catch (e) {
            return Promise.reject(e.message)
        }
    }

    return {
        state,
        dispatch,
        goNext,
        goBack,
        markPatientComplete,
        getFormDetails
    }
}
