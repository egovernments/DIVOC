import React, {useState} from "react";
import {Col, Container, Row} from "react-bootstrap";
import "./index.css";
import {useHistory} from "react-router-dom";
import Form from "@rjsf/core";
import {CustomCheckboxWidget} from "../CustomCheckboxWidget";
import {CustomRangeWidget} from "../CustomRangeWidget";
import {CustomButton} from "../CustomButton";
import {SmallInfoCards} from "../CertificateStatus";
import VerifyCertificateImg from '../../assets/img/verify-certificate-home.svg'
import LearnMoreImg from '../../assets/img/leanr_more_small.png'

export const SideEffects = () => {
    const history = useHistory();

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


    let showNextButton = false;
    const schema = {
        properties: {
            "Flu-like symptoms": {
                "type": "boolean",
                "title": "Flu-like symptoms",
                "enumNames": ["Yes", "No"]
            },
            "Temperature": {
                "type": "number",
                "title": "Temperature",
                "minimum": 90,
                "maximum": 108,
                "multipleOf": 0.1,
                "unit": "°F"
            },
            "Rapid Heartbeat": {
                "type": "boolean",
                "title": "Rapid Heartbeat",
                "enumNames": ["Yes", "No"]
            },
            "Fatigue": {
                "type": "boolean",
                "title": "Fatigue",
                "enumNames": ["Yes", "No"]
            },
            "Headache": {
                "type": "boolean",
                "title": "Headache",
                "enumNames": ["Yes", "No"]
            },
            "Muscle/Joint Pain": {
                "type": "boolean",
                "title": "Muscle/Joint Pain",
                "enumNames": ["Yes", "No"]
            },
            "Pain Scale": {
                "type": "number",
                "title": "Pain Scale",
                "minimum": 0,
                "maximum": 10,
                "multipleOf": 1,
                "unit": ""
            },
            "Chills": {
                "type": "boolean",
                "title": "Chills",
                "enumNames": ["Yes", "No"]
            },
            "Cough": {
                "type": "boolean",
                "title": "Cough",
                "enumNames": ["Yes", "No"]
            },
            "Paralysis": {
                "type": "boolean",
                "title": "Paralysis",
                "enumNames": ["Yes", "No"]
            },
            "Arm Soreness": {
                "type": "boolean",
                "title": "Arm Soreness",
                "enumNames": ["Yes", "No"]
            },
            "Nausea": {
                "type": "boolean",
                "title": "Nausea",
                "enumNames": ["Yes", "No"]
            },
            "Migraine": {
                "type": "boolean",
                "title": "Migraine",
                "enumNames": ["Yes", "No"],
            },
            "Swollen Glands": {
                "type": "boolean",
                "title": "Swollen Glands",
                "enumNames": ["Yes", "No"]
            },
            "Other": {
                "className": "feedback-input-box",
                "type": "string"
            }

        }
    };

    const uiSchema = {
        "Temperature": {
            "ui:options": {label: false},
            "ui:widget": "range"
        },
        "Pain Scale": {
            "ui:options": {label: false},
            "ui:widget": "range"
        },
        "Other": {
            "classNames": ["side-effects-input-box"],
            "ui:options": {label: false},
            "ui:placeholder": "Type to enter any other conditions"
        }
    };

    const widgets = {
        CheckboxWidget: CustomCheckboxWidget,
        RangeWidget: CustomRangeWidget
    };

    const onSideEffectsSubmit = (data, e) => {
        debugger
    }

    return (
        <div className="main-container">
            <Container fluid>
                <div className="side-effect-container">
                    <h3 className="text-center">Provide Feedback</h3>
                    <span className="text-center d-block">By reporting any side-effects of the vaccine, you will ensure the safety of others in the community and help the government contain the pandemic effectively.</span>
                    <Container className="pt-5">
                        <Row>
                            <Col>
                                <h4 align="">Report Side-effects</h4>
                                <h5 align="">Select Symptoms</h5>
                                <Form schema={schema}
                                      uiSchema={uiSchema} widgets={widgets} onSubmit={onSideEffectsSubmit}>
                                    <div className="d-flex justify-content-center">
                                        <CustomButton className="green-btn" type="submit" onClick={() => {
                                        }}>
                                            <span>Confirm Symptoms</span>
                                        </CustomButton>
                                    </div>
                                </Form>
                            </Col>
                        </Row>
                    </Container>
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
