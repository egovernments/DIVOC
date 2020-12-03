import {PreEnrollmentCode} from "./EnterPreEnrollment";
import {VerifyAadharNumber, VerifyAadharOTP} from "./EnterAadharNumber";
import React, {createContext, useContext, useMemo, useReducer} from "react";
import {Redirect, useHistory} from "react-router";
import {appIndexDb} from "../../AppDatabase";
import {PreEnrollmentDetails} from "../../components/PreEnrollmentDetail";
import "./PreEnrollmentFlow.scss";

export const FORM_PRE_ENROLL_CODE = "preEnrollCode";
export const FORM_PRE_ENROLL_DETAILS = "preEnrollDetails";
export const FORM_AADHAR_NUMBER = "verifyAadharNumber";
export const FORM_AADHAR_OTP = "verifyAadharOTP";

export function PreEnrollmentFlow(props) {
    return (
        <PreEnrollmentProvider>
            <div className="pre-enrollment-container">
                <PreEnrollmentRouteCheck pageName={props.match.params.pageName}/>
            </div>
        </PreEnrollmentProvider>
    );
}

function PreEnrollmentRouteCheck({pageName}) {
    const {state} = usePreEnrollment();
    switch (pageName) {
        case FORM_PRE_ENROLL_CODE :
            return <PreEnrollmentCode/>;
        case FORM_PRE_ENROLL_DETAILS : {
            if (state.mobileNumber) {
                return <PreEnrollmentDetails/>
            }
            break;
        }
        case FORM_AADHAR_NUMBER : {
            if (state.name) {
                return <VerifyAadharNumber/>
            }
            break;
        }
        case FORM_AADHAR_OTP :
            if (state.aadharNumber) {
                return <VerifyAadharOTP/>
            }
            break;
        default:
    }
    return <Redirect
        to={{
            pathname: '/preEnroll/' + FORM_PRE_ENROLL_CODE,
        }}
    />
}


const PreEnrollmentContext = createContext(null);

export function PreEnrollmentProvider(props) {
    const [state, dispatch] = useReducer(preEnrollmentReducer, initialState);
    const value = useMemo(() => [state, dispatch], [state]);
    return <PreEnrollmentContext.Provider value={value} {...props} />
}

const initialState = {};

function preEnrollmentReducer(state, action) {
    switch (action.type) {
        case FORM_PRE_ENROLL_CODE: {
            const newState = {...state};
            newState.enrollCode = action.payload.enrollCode;
            newState.mobileNumber = action.payload.mobileNumber;
            newState.previousForm = action.payload.currentForm;
            return newState
        }
        case FORM_PRE_ENROLL_DETAILS: {
            const newState = {...state};
            newState.name = action.payload.name;
            newState.dob = action.payload.dob;
            newState.gender = action.payload.gender;
            newState.previousForm = action.payload.currentForm ?? null;
            return newState

        }
        case FORM_AADHAR_NUMBER: {
            const newState = {...state};
            newState.aadharNumber = action.payload.aadharNumber;
            newState.previousForm = action.payload.currentForm ?? null;
            return newState
        }
        case FORM_AADHAR_OTP: {
            const newState = {...state};
            newState.aadharOtp = action.payload.aadharOtp;
            newState.previousForm = action.payload.currentForm ?? null;
            return newState
        }
        default:
            throw new Error();
    }
}

export function usePreEnrollment() {

    const context = useContext(PreEnrollmentContext);
    const history = useHistory();
    if (!context) {
        throw new Error(`usePreEnrollment must be used within a PreEnrollmentProvider`)
    }
    const [state, dispatch] = context;

    const goNext = function (current, next, payload) {
        payload.currentForm = current;
        dispatch({type: current, payload: payload});
        if (next) {
            if (next === '/') {
                history.replace("/", null)
            } else {
                history.push('/preEnroll/' + next)
            }
        }
    };

    const addToQueue = function () {
        const [state] = context;
        return appIndexDb.addToQueue(state)
    };

    const goBack = function () {
        history.goBack()
    };

    const getUserDetails = function (enrollCode, mobileNumber) {
        return appIndexDb.getPatientDetails(enrollCode, mobileNumber)
    };

    return {
        state,
        dispatch,
        goNext,
        goBack,
        getUserDetails,
        addToQueue
    }
}


