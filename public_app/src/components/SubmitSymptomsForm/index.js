import React, {useState} from "react";
import "./index.css"
import axios from "axios";
import {pathOr} from "ramda";
import {CertificateDetailsPaths} from "../../constants";

const state = {
    GenerateOTP: "GenerateOTP",
    VerifyOTP: "VerifyOTP",
    ChoosePatient: "ChoosePatient",
    ShowPatientDetails: "ShowPatientDetails",
    CompletedMessage: "CompletedMessage"
};
const stateDetails = {
    [state.GenerateOTP]: {
        subTitle: "Please enter the mobile number provided during vaccination"
    },
    [state.VerifyOTP]: {
        subTitle: "Please enter the otp received to your mobile number"
    },
    [state.ChoosePatient]: {
        subTitle: "Please choose the patient"
    },
    [state.ShowPatientDetails]: {
        subTitle: ""
    },
    [state.CompletedMessage]: {
        subTitle: ""
    }
};

export const SubmitSymptomsForm = (props) => {
    const [mobileNumber, setMobileNumber] = useState("");
    const [patientSelected, setPatientSelected] = useState(-1);
    const [recipients, setRecipients] = useState([]);
    const [otp, setOTP] = useState("");
    const [currentState, setCurrentState] = useState("GenerateOTP");
    const [confirmDetails, setConfirmDetails] = useState(false);

    async function moveToNextState() {
        if (currentState === state.GenerateOTP) {
            if (mobileNumber.length === 10) {
                setCurrentState(state.VerifyOTP)
            }
        }
        if (currentState === state.VerifyOTP) {
            if (otp === "1234") {
                setCurrentState(state.ChoosePatient);
                await fetchPatients()
            }
        }
        if (currentState === state.ChoosePatient) {
            if (patientSelected >= 0) {
                setCurrentState(state.ShowPatientDetails)
            }
        }
        if (currentState === state.ShowPatientDetails) {
            if (confirmDetails) {
                setCurrentState(state.CompletedMessage)
            }
        }

        if (currentState === state.CompletedMessage) {
            props.onComplete()
        }
    }

    async function fetchPatients() {
        const response = await axios
            .get("/divoc/api/v1/certificates/" + mobileNumber)
            .then((res) => {
                return res.data;
            });
        setRecipients(response)
    }

    return (
        <div className="submit-symptoms-form">
            {
                currentState === state.CompletedMessage && <div>
                    <h5>The healthcare facility has been notified. You will receive a call back soon.</h5>
                    <h5>If the symptoms worsen, please visit the facility so that the doctors can attend to at the earliest.</h5>
                    <h6 className="mt-5" style={{color: "#5C9EF8"}}>If you need to contact the facility immediately</h6>
                    <span className="mt-3 d-inline-block" style={{fontSize: '14px'}}>
                        {pathOr("NA", CertificateDetailsPaths["Vaccination Facility"].path, recipients[patientSelected].certificate)}
                        <br/>
                        {pathOr("", ["evidence", "0", "facility", "address", "streetAddress"], recipients[patientSelected].certificate)}
                        {", "}
                        {pathOr("", ["evidence", "0", "facility", "address", "district"], recipients[patientSelected].certificate)}
                        {", "}
                        {pathOr("", ["evidence", "0", "facility", "address", "addressRegion"], recipients[patientSelected].certificate)}
                        {", "}
                        {pathOr("", ["evidence", "0", "facility", "address", "addressCountry"], recipients[patientSelected].certificate)}
                    </span>
                    <br/>
                    {/*<span style={{fontSize: '14px'}}>{pathOr("NA", ["certificate", "facility", "contact"], recipients[patientSelected])}</span>*/}
                    <br/>
                    <button className="form-btn mt-5" onClick={moveToNextState}>Continue</button>
                </div>
            }
            {
                currentState !== state.CompletedMessage && <>
                    <h5 className="form-title">Can you help us identify the patient with these symptoms</h5>
                    <span className="form-subtitle">{stateDetails[currentState].subTitle}</span>
                    {
                        currentState === state.GenerateOTP &&
                        <>
                            <input type="number" className="input-text" maxLength={10} value={mobileNumber}
                                   placeholder={"+91 XXXXXXXXXX"}
                                   onChange={(evt) => setMobileNumber(evt.target.value)}/>
                            <button className="form-btn" onClick={moveToNextState}>Generate OTP</button>
                        </>
                    }
                    {
                        currentState === state.VerifyOTP &&
                        <>
                            <input type="text" className="input-text" maxLength={10} value={mobileNumber}
                                   placeholder={"+91 XXXXXXXXXX"}
                                   disabled={true}/>
                            <input type="text" className="input-text" maxLength={4} value={otp} placeholder={"OTP - XXXX"}
                                   onChange={(evt) => setOTP(evt.target.value)}/>
                            <button className="form-btn" onClick={moveToNextState}>Verify OTP</button>
                        </>
                    }
                    {
                        currentState === state.ChoosePatient && <div>
                            {
                                recipients.map(({osid, certificate: {credentialSubject: {name, gender, age}}}, index) => (
                                    <div key={index} className="mt-2 d-flex align-items-center">
                                        <input type="radio" id={index} name="choose-recipient" className="mr-3"
                                               checked={patientSelected === index} onChange={() => {
                                            setPatientSelected(index)
                                        }}/>
                                        <label for={index}>
                                            <span style={{fontSize: "14px"}}>{name}</span><br/>
                                            <span style={{fontSize: "12px"}}>{gender}</span>, <span
                                            style={{fontSize: "12px"}}>{age || "NA"}</span>
                                        </label>
                                    </div>
                                ))
                            }
                            <button className="form-btn mt-3" onClick={moveToNextState}>Submit</button>
                        </div>
                    }
                    {
                        currentState === state.ShowPatientDetails &&
                        <>
                            <table className="patient-details-table">
                                {
                                    Object.keys(CertificateDetailsPaths).map((item, index) => {
                                        return (
                                            <tr>
                                                <td className="table-title">{item}</td>
                                                <td className="table-value">{pathOr("NA", CertificateDetailsPaths[item].path, recipients[patientSelected].certificate)}</td>
                                            </tr>
                                        )
                                    })
                                }
                            </table>
                            <div className="confirmation-wrapper">
                                <input type="checkbox" id="confirm-wrapper" className="confirmation-checkbox" checked={confirmDetails} onChange={()=>{setConfirmDetails(!confirmDetails)}}/>
                                <label for={"confirm-wrapper"} className="confirmation-msg">I confirm that this patient is having the identified symptoms</label>
                            </div>
                            <button className="form-btn" onClick={moveToNextState} disabled={!confirmDetails}>Confirm Patient</button>
                        </>
                    }
                </>
            }
        </div>
    )
};