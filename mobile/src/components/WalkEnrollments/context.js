import React, {createContext, useContext, useMemo, useReducer} from "react";
import {useHistory} from "react-router";
import {FORM_WALK_IN_ENROLL_FORM, FORM_WALK_IN_ENROLL_PAYMENTS} from "./index";

export const WALK_IN_ROUTE = "walkInEnroll"

const WalkInEnrollmentContext = createContext(null)

export function WalkInEnrollmentProvider(props) {
    const [state, dispatch] = useReducer(walkInEnrollmentReducer, initialState)
    const value = useMemo(() => [state, dispatch], [state])
    return <WalkInEnrollmentContext.Provider value={value} {...props} />
}

const initialState = {};

function walkInEnrollmentReducer(state, action) {
    switch (action.type) {
        case FORM_WALK_IN_ENROLL_FORM: {
            const newState = {...state}
            newState.name = action.payload.name;
            return newState
        }
        case FORM_WALK_IN_ENROLL_PAYMENTS: {
            const newState = {...state}
            return newState
        }
        default:
            throw new Error();
    }
}

export function useWalkInEnrollment() {

    const context = useContext(WalkInEnrollmentContext)
    const history = useHistory();
    if (!context) {
        throw new Error(`useWalkInEnrollment must be used within a WalkInEnrollmentProvider`)
    }
    const [state, dispatch] = context;

    const goNext = function (current, next, payload) {
        payload.currentForm = current;
        dispatch({type: current, payload: payload})
        if (next) {
            if (next === '/') {
                history.replace("/", null)
            } else {
                history.push('/' + WALK_IN_ROUTE + '/' + next)
            }
        }
    }

    const goBack = function () {
        history.goBack()
    }

    return {
        state,
        dispatch,
        goNext,
        goBack,
    }
}
