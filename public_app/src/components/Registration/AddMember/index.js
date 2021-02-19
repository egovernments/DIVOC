import { useForm, useStep } from "react-hooks-helper";
import React, {useEffect, useState} from "react";
import {FormPersonalDetails} from "./FormPersonalDetails";
import axios from "axios";
import {Card, CardColumns, CardGroup, Container} from "react-bootstrap";
import {CustomButton} from "../../CustomButton";
import DefaultProgramLogo from "../../../assets/img/logo-noprogram.svg"
import SelectedLogo from "../../../assets/img/check.png"
import {Success} from "./Success";
import {PROGRAM_API} from "../../../constants";
import {getUserNumberFromRecipientToken} from "../../../utils/reciepientAuth";
import {useHistory} from "react-router";
import "./index.css"
import check from "../../../assets/img/check.png";

export const FORM_SELECT_PROGRAM = "selectProgram";
export const FORM_USER_DETAILS = "userDetails";
export const CONFIRMATION = "confirmation";
export const SUCCESS = "success";

const steps = [
    { id: FORM_SELECT_PROGRAM},
    { id: FORM_USER_DETAILS},
    { id: CONFIRMATION},
    { id: SUCCESS}
];

const defaultData = {
    "programId": "",
    "nationalId": "",
    "name": "",
    "dob": "",
    "gender": "",
    "district": "",
    "state": "",
    "contact": "",
    "email": ""
}

export const AddMembersFlow = () => {
    const history = useHistory();
    const userMobileNumber = getUserNumberFromRecipientToken();
    defaultData["contact"] = userMobileNumber;

    const [formData, setValue] = useForm(defaultData);
    const { step, navigation } = useStep({ initialStep: 0, steps });
    const { id } = step;
    const [programs, setPrograms] = useState([]);

    useEffect(() => {
        fetchPrograms()
    }, []);

    useEffect(() => {
        if (!getUserNumberFromRecipientToken()) {
            history.push("/citizen")
        }
    }, []);

    function fetchPrograms() {
        const mockData = [
            {
                "description":"Covid 19 program",
                "endDate":"2021-02-24",
                "medicineIds":["1-b6ebbbe4-b09e-45c8-b7a3-38828092da1a"],
                "name":"Covid-19 program",
                "osCreatedAt":"2021-02-16T06:51:58.271Z",
                "osUpdatedAt":"2021-02-17T07:56:29.012Z",
                "osid":"1-b58ec6ec-c971-455c-ade5-7dce34ea0b09",
                "startDate":"2021-02-01",
                "status":"Active",
                "logoURL": "https://www.un.org/sites/un2.un.org/files/covid19_response_icon.svg",
            },
            {
                "description":"This is the Phase 3 of the vaccination drive happening in the country. Eligible beneficiaries will have to register themselves on the citizen portal. Based on the enrolment code and the ID proof, beneficiaries will be vaccinated and issued a digital certificate that can be downloaded from the citizen portal.",
                "endDate":"2021-06-30",
                "medicineIds":["1-b6ebbbe4-b09e-45c8-b7a3-38828092da1a","1-2a62ae65-1ea5-4a23-946b-062fe5f512f6","1-9ac9eaf1-82bf-4135-b6ee-a948ae972fd4"],
                "name":"Polio Vaccination",
                "osCreatedAt":"2021-02-16T09:57:37.474Z",
                "osUpdatedAt":"2021-02-17T09:37:23.195Z",
                "osid":"1-7875daad-7ceb-4368-9a4b-7997e3b5b008",
                "startDate":"2021-02-01",
                "status":"Active"
            }
        ];
        axios.get(PROGRAM_API)
            .then(res => {
                if (res.status === 200) {
                    setPrograms(res.data);
                    setValue({target: {name:"programId", value:res.data[0].osid}})
                }
            })
            .catch(e => {
                console.log(e);
                // mock data setup
                setPrograms(mockData)
                setValue({target: {name:"programId", value:mockData[0].osid}})
            })
    }

    let props = { formData, setValue, navigation, programs };

    switch (id) {
        case FORM_SELECT_PROGRAM:
            return <SelectProgram {...props} />;
        case FORM_USER_DETAILS:
            props["verifyDetails"] = false
            return <FormPersonalDetails {...props} />;
        case CONFIRMATION:
            props["verifyDetails"] = true
            return <FormPersonalDetails {...props} />
        case SUCCESS:
            return <Success {...props} />
        default:
            return null;
    }
}

const SelectProgram = ({ setValue, formData, navigation, programs }) => {
    const history = useHistory();
    const { next } = navigation;

    function onProgramSelect(osid) {
        setValue({target: {name:"programId", value:osid}})
    }

    return (
        <Container fluid>
            <div className="select-program-container">
                <div className="d-flex justify-content-between align-items-center">
                    <h3>Please select vaccination program</h3>
                    <span className="back-btn cursor-pointer" onClick={() => {history.goBack()}}>Back</span>
                </div>
                <CardGroup className="mt-5">
                    {
                        programs.map(p =>
                            <div className="p-2">
                            <a key={p.osid} style={{ cursor: 'pointer' }} onClick={() => onProgramSelect(p.osid)}>
                                <Card border={p.osid === formData.programId ? "success" : "light"} style={{ width: '15rem' }} className="text-center h-100">
                                    {p.osid === formData.programId&& <img src={SelectedLogo} className="selected-program-img"/>}
                                    <Card.Img variant="top" src={p.logoURL ? p.logoURL : DefaultProgramLogo} className="p-4" style={{ maxHeight: '9rem', height: '9rem' }} />
                                    <Card.Body>
                                        <Card.Title>{p.name}</Card.Title>
                                    </Card.Body>
                                </Card>
                            </a>
                            </div>
                        )
                    }
                </CardGroup>
                <CustomButton className="blue-btn" type="submit" onClick={next}>
                    <span>Continue &#8594;</span>
                </CustomButton>
            </div>
        </Container>
    )
}
