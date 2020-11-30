import {BaseCard} from "../Base/Base";
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
import {appIndexDb} from "../AppDatabase";

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
    const {goToVerifyRecipient} = useHome()
    return <>
        <div className={"enroll-container"}>
            <EnrolmentItems title={"Verify Recipient"} icon={verifyRecipient} onClick={() => {
                goToVerifyRecipient()
            }}/>
            <EnrolmentItems title={"Enroll Recipient"} icon={enrollRecipient} onClick={() => {
            }}/>
            <EnrolmentItems title={"Recipient Queue"} icon={recipientQueue} onClick={() => {
            }}/>
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
    const [result, setResults] = useState([])
    useEffect(() => {
        appIndexDb.recipientDetails().then((result) => setResults(result))
    }, [])
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
        case ACTION_VERIFY_RECIPIENT:
            return state;
        default:
            throw new Error();
    }
}

export const ACTION_VERIFY_RECIPIENT = 'verifyRecipient';

const HomeContext = createContext(null);

export function useHome() {
    const context = useContext(HomeContext)
    const history = useHistory();
    if (!context) {
        throw new Error(`useHome must be used within a HomeProvider`)
    }
    const [state, dispatch] = context

    const goToVerifyRecipient = function () {
        history.push('preEnroll/' + FORM_PRE_ENROLL_CODE)
    }

    const goToQueue = function () {
        history.push(`/queue`)
    }

    return {
        state,
        dispatch,
        goToVerifyRecipient,
        goToQueue
    }
}

export function HomeProvider(props) {
    const [state, dispatch] = useReducer(homeReducer, initialState)
    const value = useMemo(() => [state, dispatch], [state])
    return <HomeContext.Provider value={value} {...props} />
}
