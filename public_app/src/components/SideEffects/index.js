import React, {useState} from "react";
import {Col, Container, Row} from "react-bootstrap";
import "./index.css";
import {SubmitSymptomsForm} from "../SubmitSymptomsForm";

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
    Object.keys(symptoms).forEach((key, idx) => {
        symptoms[key].forEach((d) => {
            if ("types" in d) {
                showNextButton = true;
            }
        });
    });
    return (
        <div className="main-container">
            <Container fluid>
                <div className="side-effect-container">
                    <h3 className="mb-4">Report Side-effects</h3>
                    <Row>
                        <Col lg={6}>
                            <Row>
                                <Col lg={6}>
                                    <h5>Select Symptoms</h5>
                                    <div className="symptoms-container">
                                        {
                                            Object.keys(symptoms).map((key, idx) => {

                                                return (
                                                    <>
                                                        {showGroupHeader && <span className="mt-1 group-header">{key}</span>}
                                                        {
                                                            symptoms[key].map((symptom) => (
                                                                <div key={idx}
                                                                     className="symptom-wrapper d-flex align-items-center pb-2"
                                                                     onClick={() => {
                                                                         onSymptomSelected(symptom, symptom.name)
                                                                     }}>
                                                    <span
                                                        className={`custom-checkbox ${selectedSymptomIds.includes(symptom.name) ? 'active' : ''}`}/>
                                                                    <span className="title">{symptom.name}</span>
                                                                </div>
                                                            ))
                                                        }
                                                    </>)
                                            })
                                        }

                                        {
                                            showOtherSection &&
                                            <div className="symptom-wrapper d-flex align-items-center pt-3"
                                                 onClick={() => {
                                                     addOrRemoveSelectedItem("others")
                                                 }}>
                                            <span
                                                className={`custom-checkbox ${selectedSymptomIds.includes("others") ? 'active' : ''}`}/>
                                                <span className="title">{"Others"}</span>
                                            </div>
                                        }
                                        {
                                            showOtherSection &&
                                            <textarea className="others-textarea" placeholder={"Please elaborate"}
                                                      disabled={!selectedSymptomIds.includes("others")}
                                                      onChange={onOtherSymptomChange}/>
                                        }
                                    </div>
                                    {
                                        <button className="confirm-symptoms-btn mr-3" style={{background: "grey"}}
                                                onClick={onReset}>Reset</button>
                                    }
                                    {
                                        showNextButton &&
                                        <button className="confirm-symptoms-btn"
                                                disabled={Object.keys(nextSymptoms).length === 0}
                                                onClick={onNextBtnClick}>Next</button>
                                    }
                                    {
                                        !showNextButton && <button className="confirm-symptoms-btn"
                                                                   onClick={onConfirmSymptomsClick}>Confirm
                                            Symptoms</button>
                                    }
                                </Col>
                                <Col lg={6}>
                                    {instructions.length > 0 && <h5>Follow Instructions</h5>}
                                    <div className="instructions-container">
                                        {
                                            instructions.map((data, idx) => {
                                                return (
                                                    data.instructions.map((instruction, index) => (
                                                        <div className="instruction-wrapper" key={idx}>
                                                            <span className="instruction-title">{data.name}</span><br/>
                                                            <span
                                                                className="instruction-heading">Instructions</span>
                                                            <br/>
                                                            <span key={index}>{instruction}</span>
                                                        </div>
                                                    ))
                                                )
                                            })
                                        }
                                    </div>
                                </Col>
                            </Row>
                        </Col>
                        <Col lg={6}>{
                            showSubmitForm && <SubmitSymptomsForm onComplete={onReset}/>
                        }</Col>
                    </Row>
                </div>
            </Container>
        </div>
    );
};