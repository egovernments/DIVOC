import {BaseCard} from "../Base/Base";
import {appIndexDb} from "../AppDatabase";
import React, {createContext, useContext, useEffect, useMemo, useReducer, useState} from "react";
import "./Home.scss"
import {Col} from "react-bootstrap";
import {useHistory} from "react-router";
import {FORM_PRE_ENROLL_CODE} from "./Forms/PreEnrollmentFlow";
import vaccineBanner from "../assets/img/home-banner.svg"
import enrollRecipient from "./enroll_recipient.png"
import recipientQueue from "./recipent_queue.png"
import verifyRecipient from "./verify_recpient.png"
import * as ProtoType from "prop-types";
import Row from "react-bootstrap/Row";
import {getMessageComponent, getNumberComponent, LANGUAGE_KEYS} from "../lang/LocaleContext";
import {FORM_WALK_IN_ENROLL_FORM} from "../components/WalkEnrollments";
import {WALK_IN_ROUTE} from "../components/WalkEnrollments/context";

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

    const {goToVerifyRecipient, goToQueue, goToNewEnroll} = useHome();
    return <>
        <div className="enroll-container">
            <EnrolmentItems title={getMessageComponent(LANGUAGE_KEYS.VERIFY_RECIPIENT)} icon={verifyRecipient}
                            onClick={() => {
                                goToVerifyRecipient()
                            }}/>
            <EnrolmentItems title={getMessageComponent(LANGUAGE_KEYS.ENROLL_RECIPIENT)} icon={enrollRecipient}
                            onClick={() => {
                                goToNewEnroll()
                            }}/>
            <EnrolmentItems title={getMessageComponent(LANGUAGE_KEYS.RECIPIENT_QUEUE)} icon={recipientQueue}
                            onClick={goToQueue}/>
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
        {result.map((item) => <StatisticsItem key={item.titleKey} title={getMessageComponent(item.titleKey)}
                                              value={getNumberComponent(item.value)}/>)}
    </div>;
}

export function VaccineProgram() {
    return <div className={"home-container"}>
        <ProgramHeader/>
        <Title text={getMessageComponent(LANGUAGE_KEYS.ACTIONS)} content={<EnrollmentTypes/>}/>
        <Title text={getMessageComponent(LANGUAGE_KEYS.RECIPIENT_NUMBERS)} content={<Statistics/>}/>
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
    const context = useContext(HomeContext);
    const history = useHistory();
    if (!context) {
        throw new Error(`useHome must be used within a HomeProvider`)
    }
    const [state, dispatch] = context;

    const goToVerifyRecipient = function () {
        history.push('preEnroll/' + FORM_PRE_ENROLL_CODE)
    }

    const goToQueue = function () {
        history.push(`/queue`)
    };
    const goToNewEnroll = function () {
        history.push('/' + WALK_IN_ROUTE + '/' + FORM_WALK_IN_ENROLL_FORM)
    };

    return {
        state,
        dispatch,
        goToVerifyRecipient,
        goToQueue,
        goToNewEnroll
    }
}

export function HomeProvider(props) {
    const [state, dispatch] = useReducer(homeReducer, initialState);
    const value = useMemo(() => [state, dispatch], [state]);
    return <HomeContext.Provider value={value} {...props} />
}
