import React, {useState} from "react";
import {Col, Container, Row} from "react-bootstrap";
import "./index.css";
import {SubmitSymptomsForm} from "../SubmitSymptomsForm";
import {ReactComponent as VaccinationActiveImg} from "../../assets/img/FeedbackScreen.svg";
import CertificateImg from "../../assets/img/download-certificate-home.svg";
import VerifyCertificateImg from '../../assets/img/verify-certificate-home.svg'
import {CertificateStatus, SmallInfoCards} from "../CertificateStatus";
import {Link, useHistory} from "react-router-dom";
import LearnMoreImg from '../../assets/img/leanr_more_small.png'

const data = {
    0: [{
        "name": "Loss of Sense",
        "types": [
            {
                "name": "Loss of Smell",
                "instructions": ["You should get Covid-19 test done."]
            },
            {
                "name": "Loss of Taste",
                "instructions": ["You should get Covid-19 test done."]
            },
            {
                "name": "Temporary loss of Vision ",
                "instructions": ["You should consult a pulmonologist"]
            },
        ]
    }],
    1: [{
        "name": "Mental Health",
        "types": [
            {
                "name": "Memory loss",
                "instructions": ["You should consult post-Covid support"]
            },
            {
                "name": "Bouts of Depression / Anxiety / Panic Attacks",
                "instructions": ["You should consult a psychiatrist"]
            },
            {
                "name": "Severe Headache",
                "instructions": ["You should consult post-Covid support"]
            },
        ]
    }],
    2: [{
        "name": "Cardiovascular disease symptoms",
        "types": [
            {
                "name": "Sudden black Out",
                "instructions": ["You should consult a cardiologist"]
            },
            {
                "name": "Palpitations",
                "instructions": ["You should consult a cardiologist"]
            },
        ]
    }],
    3: [{
        "name": "Paralysis",
        "types": [
            {
                "name": "Temporary Paralysis",
                "instructions": ["You should consult a neurologist"]
            }, {
                "name": "Permanent Paralysis",
                "instructions": ["You should consult a neurologist"]
            }
        ]
    }],
};



export const SideEffects = () => {
    const history = useHistory();
    const [symptoms, setSymptoms] = useState(data);
    const [nextSymptoms, setNextSymptoms] = useState({});
    const [selectedSymptomIds, setSelectedSymptomIds] = useState([]);
    const [instructions, setInstructions] = useState([]);
    const [showOtherSection, setShowOtherSection] = useState(true);
    const [showSubmitForm, setShowSubmitForm] = useState(false);
    const [showGroupHeader, setShowGroupHeader] = useState(false);

    function addOrRemoveSelectedItem(itemIdx) {
        if (selectedSymptomIds.includes(itemIdx)) {
            setSelectedSymptomIds(selectedSymptomIds.filter(i => i !== itemIdx))
        } else {
            setSelectedSymptomIds(selectedSymptomIds.concat(itemIdx))
        }
    }

    function onSymptomSelected(symptom, groupIndex) {
        const nextSymptomsData = {...nextSymptoms};
        if ("types" in symptom) {
            const id = symptom.name;
            if (id in nextSymptomsData) {
                delete nextSymptomsData[id];
            } else {
                nextSymptomsData[id] = symptom.types;
            }
        }
        if ("instructions" in symptom) {
            const updatedInstructions = instructions.filter(data => data.name !== symptom.name);
            if (updatedInstructions.length === instructions.length) {
                updatedInstructions.push({name: symptom.name, instructions: symptom.instructions})
            }
            setInstructions(updatedInstructions)
        }
        addOrRemoveSelectedItem(groupIndex);
        setNextSymptoms(nextSymptomsData);
    }


    function onOtherSymptomChange(evt) {

    }

    function onConfirmSymptomsClick() {
        setShowSubmitForm(true)
    }

    function onNextBtnClick() {
        setSymptoms(nextSymptoms);
        setNextSymptoms({});
        setShowOtherSection(false);
        setShowGroupHeader(true);
    }

    function onReset() {
        setShowSubmitForm(false);
        setSymptoms(data);
        setInstructions([]);
        setShowOtherSection(true);
        setNextSymptoms({});
        setSelectedSymptomIds([]);
        setShowGroupHeader(false);
    }

    let showNextButton = false;
    return (
        <div className="main-container">
            <Container fluid>
                <div className="side-effect-container">
                    <h3 align="center">Provide Feedback</h3>
                    <span width="40%" display="inline-block">By reporting any side-effects of the vaccine, you will ensure the safety of others in the community and help the government contain the pandemic effectively.</span>
                {/* <img src={VaccinationActiveImg} alt=""/> */}
                <VaccinationActiveImg/>
                    <SmallInfoCards
                    text={"Verify Certificate"}
                    img={VerifyCertificateImg}
                    onClick={() => {
                        history.push("/verify-certificate/")
                    }}
                    backgroundColor={"#F2FAF6"}
                    />
                    <br/>
                    <SmallInfoCards text={"Learn about the Vaccination process"} img={LearnMoreImg}
                           onClick={() => {
                                history.push("/learn/")
                            }}
                            backgroundColor={"#EFF5FD"}/>
                
                
                </div>
            </Container>
        </div>
    );
}
