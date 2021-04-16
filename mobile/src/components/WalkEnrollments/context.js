import React, {createContext, useContext, useMemo, useReducer} from "react";
import {useHistory} from "react-router";
import {appIndexDb} from "../../AppDatabase";
import config from "config.json"

export const FORM_WALK_IN_ELIGIBILITY_CRITERIA = "eligibility_criteria";
export const FORM_WALK_IN_VERIFY_MOBILE = "verify_mobile";
export const FORM_WALK_IN_VERIFY_OTP = "verify_otp";
export const FORM_WALK_IN_ENROLL_FORM = "form";
export const FORM_WALK_IN_VERIFY_FORM = "verify_form";
export const FORM_WALK_IN_ENROLL_PAYMENTS = "payments";
export const FORM_WALK_IN_ENROLL_CONFIRMATION = "confirm";
export const INVALID_ELIGIBILITY_CRITERIA = "invalid_eligibility_criteria"

export const WALK_IN_ROUTE = "walkInEnroll";

const WalkInEnrollmentContext = createContext(null);

export const initialWalkInEnrollmentState = {
    comorbidities: [],
    yob: "",
    choice: "yes",
    currentForm: FORM_WALK_IN_ELIGIBILITY_CRITERIA,
    nextForm: FORM_WALK_IN_ELIGIBILITY_CRITERIA,

    programId: "",
    programName: "",
    nationalId: "",
    identity: "",
    name: "",
    gender: "",
    district: "",
    state: "",
    contact: "",
    email: "",
    confirmEmail: "",
    status: null,
    locality: "",
    comorbidity: "",
    occupation: "",
    pulseRate: "",
    respiratoryRate: "",
    bloodPressure: "",
    temprature: "",
    pincode: "",
    phone: "",
    beneficiaryPhone: "",
    appointments: [],
};


export function WalkInEnrollmentProvider(props) {
    const [state, dispatch] = useReducer(walkInEnrollmentReducer, initialWalkInEnrollmentState);
    const value = useMemo(() => [state, dispatch], [state]);
    return <WalkInEnrollmentContext.Provider value={value} {...props} />
}


function walkInEnrollmentReducer(state, action) {
    switch (action.type) {
        case FORM_WALK_IN_ELIGIBILITY_CRITERIA:
        case FORM_WALK_IN_VERIFY_MOBILE:
        case FORM_WALK_IN_VERIFY_OTP:
        case FORM_WALK_IN_VERIFY_FORM:
        case FORM_WALK_IN_ENROLL_CONFIRMATION:
        case INVALID_ELIGIBILITY_CRITERIA:
        case FORM_WALK_IN_ENROLL_PAYMENTS: {
            return {
                ...state,
                ...action.payload
            };
        }
        case FORM_WALK_IN_ENROLL_FORM: {
            const newState = {
                ...state,
                ...action.payload
            };
            newState.address = {
                addressLine1: "",
                addressLine2: "",
                district: action.payload.district,
                state: action.payload.state,
                pincode: action.payload.pincode
            };
            return newState
        }
        default:
            return  state;
    }
}

export function useWalkInEnrollment() {

    const context = useContext(WalkInEnrollmentContext);
    const history = useHistory();
    if (!context) {
        throw new Error(`useWalkInEnrollment must be used within a WalkInEnrollmentProvider`)
    }
    const [state, dispatch] = context;

    const goNext = function (current, next, payload) {
        payload.currentForm = current;
        payload.nextForm = next;
        dispatch({type: current, payload: payload});
        if (next) {
            if (next === '/') {
                history.replace(config.urlPath, null)
            } else {
                history.push(config.urlPath + '/' + WALK_IN_ROUTE + '/' + next)
            }
        }
    };

    const goBack = function () {
        history.goBack()
    };

    const saveWalkInEnrollment = async function (paymentMode) {
        state.paymentMode = paymentMode ?? "NA";
        return appIndexDb.saveWalkInEnrollments(state)
    };

    return {
        state,
        dispatch,
        goNext,
        goBack,
        saveWalkInEnrollment
    }
}
