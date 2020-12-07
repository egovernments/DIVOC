import React, {createContext, useContext, useMemo, useReducer} from "react";
import "./index.scss"
import {BaseFormCard} from "../components/BaseFormCard";
import {Redirect, useHistory} from "react-router";
import {SelectVaccinator} from "../components/SelectVaccinator";
import {CONSTANT} from "../utils/constants";
import Button from "react-bootstrap/Button";
import {BatchCodeForm} from "../components/BatchCodeForm";
import {appIndexDb} from "../AppDatabase";

export function ConfirmFlow(props) {
    return (
        <ConfirmVaccineProvider>
            <ConfirmVaccination {...props}/>
        </ConfirmVaccineProvider>
    );
}

export function ConfirmVaccination(props) {
    const {goNext} = useConfirmVaccine();
    const {pageName, recipient_id} = props.match.params;

    function getForm() {
        switch (pageName) {
            case CONSTANT.SELECT_VACCINATOR:
                return <SelectVaccinator enrollCode={recipient_id}/>;
            case CONSTANT.BATCH_CODE:
                return <BatchCodeForm/>;
            default:
                return <Redirect to="/queue"/>
        }
    }

    return (
        <div className="confirm-vaccination-container">
            <BaseFormCard title={"Confirm Vaccinator and Batch"}>
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
        case ACTION_SELECT_BATCH: {
            const newState = {...state}
            newState.enrollCode = action.payload.enrollCode;
            newState.vaccinatorId = action.payload.vaccinatorId;
            return newState
        }
        case ACTION_PATIENT_COMPLETED: {
            const newState = {...state}
            newState.batchCode = action.payload.batchCode
            return newState
        }
        default:
            throw new Error();
    }
}

export const ACTION_SELECT_BATCH = "selectBatch"
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
            history.push(next)
        }
    }

    const goBack = function () {
        history.goBack()
    }

    const markPatientComplete = async function (batchCode) {
        try {
            const [state] = context;
            state.batchCode = batchCode
            await appIndexDb.saveEvent(state)
            await appIndexDb.markPatientAsComplete(state.enrollCode)
        } catch (e) {
            return Promise.reject("Failed to save")
        }
    }

    return {
        state,
        dispatch,
        goNext,
        goBack,
        markPatientComplete
    }
}
