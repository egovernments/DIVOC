import {PreEnrollmentCode} from "./EnterPreEnrollment";
import {VerifyAadhaarNumber, VerifyAadhaarOTP} from "./EnterAadhaarNumber";
import React, {createContext, useContext, useMemo, useReducer} from "react";
import {Redirect, useHistory} from "react-router";
import {appIndexDb, QUEUE_STATUS} from "../../AppDatabase";
import {PatientInfo, PreEnrollmentDetails} from "../../components/PreEnrollmentDetail";
import "./PreEnrollmentFlow.scss";
import config from "config.json"
import {
    FORM_WALK_IN_ENROLL_PAYMENTS,
    FORM_WALK_IN_VERIFY_FORM
} from "../../components/WalkEnrollments/context";
import {BeneficiaryVerifyPayment} from "./BeneficiaryVerifyPayment";
import {useOnlineStatus} from "../../utils/offlineStatus";

export const FORM_PRE_ENROLL_CODE = "preEnrollCode";
export const FORM_PRE_ENROLL_DETAILS = "preEnrollDetails";
export const FORM_AADHAAR_NUMBER = "verifyAadhaarNumber";
export const FORM_AADHAAR_OTP = "verifyAadhaarOTP";

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
    const {state, goNext} = usePreEnrollment();
    switch (pageName) {
        case FORM_PRE_ENROLL_CODE :
            return <PreEnrollmentCode/>;
        case FORM_PRE_ENROLL_DETAILS :
            return <PreEnrollmentDetails/>
        case FORM_AADHAAR_NUMBER : {
            if (state.name) {
                return <VerifyAadhaarNumber/>
            }
            break;
        }
        case FORM_AADHAAR_OTP :
            if (state.identity) {
                return <VerifyAadhaarOTP/>
            }
            break;
        case FORM_WALK_IN_VERIFY_FORM:
            return <PatientInfo/>;
        case FORM_WALK_IN_ENROLL_PAYMENTS : {
            return <BeneficiaryVerifyPayment/>
        }
        default:
    }
    return <Redirect
        to={{
            pathname: config.urlPath + '/preEnroll/' + FORM_PRE_ENROLL_CODE,
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
            const newState = {...state, ...action.payload};
            newState.state = action.payload.address.state;
            newState.district = action.payload.address.district;
            newState.previousForm = action.payload.currentForm ?? null;
            return newState

        }
        case FORM_AADHAAR_NUMBER: {
            const newState = {...state};
            newState.identity = "did:in.gov.uidai.aadhaar:" + action.payload.aadhaarNumber;
            newState.previousForm = action.payload.currentForm ?? null;
            return newState
        }
        case FORM_AADHAAR_OTP: {
            const newState = {...state};
            newState.aadhaarOtp = action.payload.aadhaarOtp;
            newState.previousForm = action.payload.currentForm ?? null;
            return newState
        }
        case FORM_WALK_IN_ENROLL_PAYMENTS: {
            return {
                ...state,
                ...action.payload
            };
        }
        case FORM_WALK_IN_VERIFY_FORM: {
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
            newState.enrollCode = action.payload.code;
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
                history.replace(config.urlPath + "/queue", null)
            } else {
                history.push(config.urlPath + '/preEnroll/' + next)
            }
        }
    };

    const addToQueue = function (paymentMode) {
        const [state] = context;
        state.paymentMode = paymentMode ?? "NA";
        const queue = {
            enrollCode: state.code,
            mobileNumber: state.phone,
            previousForm: "Payment Mode",
            name: state.name,
            dob: state.dob,
            yob: state.yob,
            age: new Date().getFullYear() - state.yob,
            gender: state.gender,
            status: QUEUE_STATUS.IN_QUEUE,
            code: state.code,
            programId: localStorage.getItem("programId"),
            identity: state.identity,
            nationality: state.nationalId,
            appointments: state.appointments
        }
        return appIndexDb.addToQueue(queue)
    };

    const goBack = function () {
        history.goBack()
    };

    const getUserDetails = function (enrollCode, isOnline) {
        return appIndexDb.getPatientDetails(enrollCode, isOnline)
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


