import {BaseCard} from "../Base/Base";
import {AppDatabase, indexDb} from "../AppDatabase";
import React, {createContext, useContext, useEffect, useMemo, useReducer, useState} from "react";
import "./Home.scss"
import {Button, Col} from "react-bootstrap";
import {useHistory} from "react-router";
import {FORM_PRE_ENROLL_CODE} from "./Forms/PreEnrollmentFlow";
import vaccineBanner from "./vaccine_banner.png"
import enrollRecipient from "./enroll_recipient.png"
import recipientQueue from "./recipent_queue.png"
import verifyRecipient from "./verify_recpient.png"
import * as ProtoType from "prop-types";
import Row from "react-bootstrap/Row";

function ProgramHeader() {
    return <div className={"program-header"}>
        <BaseCard>
            <img className={"banner"} src={vaccineBanner} alt={""}/>
        </BaseCard>
    </div>;
}

function Title({text, content}) {
    return <div className={"title-container"}>
        <div className={"title"}>{text}</div>
        {content}
    </div>;
}

export default Home;

function EnrollmentTypes() {
    const {goNext, goToQueue} = useHome();
    return <>
        <div className={"enroll-container"}>
            <EnrolmentItems title={"Verify Recipient"} icon={verifyRecipient} onClick={() => {
                goNext('/preEnroll/' + FORM_PRE_ENROLL_CODE)
            }}/>
            <EnrolmentItems title={"Enroll Recipient"} icon={enrollRecipient} onClick={() => {
            }}/>
            <EnrolmentItems title={"Recipient Queue"} icon={recipientQueue} onClick={goToQueue}/>
        </div>
    </>;
}

EnrolmentItems.propTypes = {
    icon: ProtoType.string.isRequired,
    title: ProtoType.string.isRequired,
    onClick: ProtoType.func
};

function EnrolmentItems({icon, title, onClick}) {
    return (
        <div className={"verify-card"} onClick={onClick}>
            <BaseCard>
                <Col>
                    <img className={"icon"} src={icon} alt={""}/>
                    <h6>{title}</h6>
                </Col>
            </BaseCard>
        </div>
    );
}


StatisticsItem.propTypes = {
    value: ProtoType.string.isRequired,
    title: ProtoType.string.isRequired
};

function StatisticsItem({title, value}) {
    return (
        <div className={"recipient-row"}>
            <BaseCard>
                <Row>
                    <Col xs={3}>
                        <div className={"value"}>{value}</div>
                    </Col>
                    <Col xs={7} className={"title"}>{title}</Col>
                </Row>
            </BaseCard>
        </div>
    );
}


function Statistics() {
    const [result, setResults] = useState([]);
    useEffect(() => {
        indexDb.recipientDetails().then((result) => setResults(result));
    }, []);
    return <div className={"recipient-container"}>
        {result.map((item) => <StatisticsItem key={item.title} title={item.title} value={"" + item.value}/>)}
    </div>;
}

export function VaccineProgram() {
    return <div className={"home-container"}>
        <ProgramHeader/>
        <Title text={"Actions"} content={<EnrollmentTypes/>}/>
        <Title text={"Recipient Numbers"} content={<Statistics/>}/>
    </div>;
}

export function Home(props) {
    return (
        <HomeProvider>
            <VaccineProgram/>
        </HomeProvider>
    );
}


const initialState = {pageNo: 0};

function homeReducer(state, action) {
    switch (action.type) {
        case ACTION_VERIFY_RECIPIENT: {
            const payload = action.payload;
            if (payload.pageNo === 0) {
                return {pageNo: 1, ...state};
            }
            return {pageNo: 0, ...state};
        }
        case ACTION_PRE_ENROLLMENT_CODE: {
            const payload = action.payload;
            if (payload.pageNo === 1) {
                return {pageNo: 2, ...state};
            }
            return {pageNo: 0, ...state};
        }
        case ACTION_PRE_ENROLLMENT_DETAILS: {
            const payload = action.payload;
            if (payload.pageNo === 2) {
                return {pageNo: 3, ...state};
            }
            return {pageNo: 0, ...state};
        }
        case ACTION_VERIFY_AADHAR_NUMBER: {
            const payload = action.payload;
            if (payload.pageNo === 3) {
                return {pageNo: 4, ...state};
            }
            return {pageNo: 0, ...state};
        }
        case ACTION_VERIFY_AADHAR_OTP: {

            const payload = action.payload;
            if (payload.pageNo === 4) {
                return {pageNo: 5, ...state};
            }
            return {pageNo: 0, ...state};
        }
        case ACTION_GO_NEXT: {
            const payload = action.payload;
            if (payload.pageNo === 6) {
                return {pageNo: 0};
            }
            return {pageNo: payload.pageNo++};
        }

        case ACTION_GO_BACK: {
            const payload = action.payload;
            if (payload.pageNo === 0) {
                return {pageNo: 0};
            }
            return {pageNo: payload.pageNo--};
        }
        default:
            throw new Error();
    }
}

export const ACTION_VERIFY_RECIPIENT = 'verifyRecipient';
export const ACTION_PRE_ENROLLMENT_CODE = 'preEnrollmentCode';
export const ACTION_PRE_ENROLLMENT_DETAILS = 'preEnrollmentDetails';
export const ACTION_VERIFY_AADHAR_NUMBER = 'verifyAadharNumber';
export const ACTION_VERIFY_AADHAR_OTP = 'verifyAadharOTP';
export const ACTION_GO_NEXT = 'goNext';
export const ACTION_GO_BACK = 'goBack';

const HomeContext = createContext(null);

export function useHome() {
    const context = useContext(HomeContext);
    const history = useHistory();
    if (!context) {
        throw new Error(`useHome must be used within a HomeProvider`)
    }
    const [state, dispatch] = context;

    const goToVerifyRecipient = function () {
        dispatch({type: ACTION_VERIFY_RECIPIENT, payload: {pageNo: 0}})
        //history.push(`/verifyRecipient`)
    };

    const goToQueue = function () {
        history.push(`/queue`)
    };

    const goNext = function (path) {
        dispatch({type: ACTION_GO_NEXT, payload: {pageNo: state.pageNo}});
        if (path) {
            history.push(path)
        }
    };

    const goBack = function () {
        history.goBack();
        dispatch({type: ACTION_GO_BACK, payload: {pageNo: state.pageNo}})
    };

    return {
        state,
        dispatch,
        goToVerifyRecipient,
        goNext,
        goBack,
        goToQueue
    }
}

export function HomeProvider(props) {
    const [state, dispatch] = useReducer(homeReducer, initialState);
    const value = useMemo(() => [state, dispatch], [state]);
    return <HomeContext.Provider value={value} {...props} />
}
