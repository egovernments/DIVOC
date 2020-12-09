import React, {useState} from "react";
import {Col, Container, Row} from "react-bootstrap";
import "./index.css";
import {SubmitSymptomsForm} from "../SubmitSymptomsForm";

export const SideEffects = () => {
    const [symptoms, setSymptoms] = useState([
        {
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
        },
        {
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
        },
        {
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
        }, {
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
        },
    ]);
    const [selectedGroupSymptoms, setSelectedGroupSymptoms] = useState([0]);
    const [selectedSymptoms, setSelectedSymptoms] = useState([]);
    const [showSubmitForm, setShowSubmitForm] = useState(false);

    function onSymptomSelected(symptom) {
        const data = [...selectedSymptoms];
        const symptomIndex = data.indexOf(symptom);
        if (symptomIndex >= 0) {
            data.splice(symptomIndex, 1);
        } else {
            data.push(symptom)
        }
        setSelectedSymptoms(data)
    }

    function onSymptomGroupSelected(symptom) {
        const data = [...selectedGroupSymptoms];
        const symptomIndex = data.indexOf(symptom);
        if (symptomIndex >= 0) {
            data.splice(symptomIndex, 1);
        } else {
            data.push(symptom)
        }
        setSelectedGroupSymptoms(data)
    }

    function onOtherSymptomChange(evt) {

    }

    function onConfirmSymptomsClick() {
        setShowSubmitForm(true)
    }

    function onReset() {
        setShowSubmitForm(false);
        setSelectedSymptoms([]);
        setSelectedGroupSymptoms([0]);
    }

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
                                            symptoms.map(({name}, groupIndex) => {
                                                return (
                                                    <>
                                                        <div key={groupIndex}
                                                             className="symptom-wrapper d-flex align-items-center pt-1"
                                                             onClick={() => {
                                                                 onSymptomGroupSelected(groupIndex)
                                                             }}>
                                                    <span className="custom-group">
                                                        {selectedGroupSymptoms.includes(groupIndex) ? "-" : "+"}
                                                    </span>
                                                            <span className="title">{name}</span>
                                                        </div>
                                                        {
                                                            selectedGroupSymptoms.includes(groupIndex) && symptoms[groupIndex].types.map((type, index) => (
                                                                <div key={index}
                                                                     className="symptom-wrapper d-flex align-items-center ml-3"
                                                                     onClick={() => {
                                                                         onSymptomSelected(`${groupIndex}-${index}`)
                                                                     }}>
                                                    <span
                                                        className={`custom-checkbox ${selectedSymptoms.includes(`${groupIndex}-${index}`) ? 'active' : ''}`}/>
                                                                    <span className="title">{type.name}</span>
                                                                </div>))
                                                        }
                                                    </>
                                                )
                                            })
                                        }

                                        {
                                            <div className="symptom-wrapper d-flex align-items-center"
                                                 onClick={() => {
                                                     onSymptomSelected("others")
                                                 }}>
                                                    <span
                                                        className={`custom-checkbox ${selectedSymptoms.includes("others") ? 'active' : ''}`}/>
                                                <span className="title">{"Others"}</span>
                                            </div>
                                        }
                                        {
                                            <textarea className="others-textarea" placeholder={"Please elaborate"}
                                                      disabled={!selectedSymptoms.includes("others")}
                                                      onChange={onOtherSymptomChange}/>
                                        }
                                    </div>
                                    {
                                        <button className="confirm-symptoms-btn"
                                                disabled={selectedSymptoms.length === 0}
                                                onClick={onConfirmSymptomsClick}>Confirm Symptoms</button>
                                    }
                                </Col>
                                <Col lg={6}>
                                    {selectedSymptoms.length > 0 && <h5>Follow Instructions</h5>}
                                    <div className="instructions-container">
                                        {
                                            selectedSymptoms.map((symptomIdx, idx) => {
                                                const [groupId, symptomId] = symptomIdx.split("-");
                                                if (groupId in symptoms) {
                                                    const {types} = symptoms[groupId];
                                                    const {name, instructions} = types[symptomId];
                                                    return (
                                                        instructions.map((instruction, index) => (
                                                            <div className="instruction-wrapper">
                                                                <span className="instruction-title">{name}</span><br/>
                                                                <span
                                                                    className="instruction-heading">Instructions</span>
                                                                <br/>
                                                                <span key={index}>{instruction}</span>
                                                            </div>
                                                        ))
                                                    )
                                                }
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