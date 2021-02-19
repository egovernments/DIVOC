import React, {useEffect, useState} from "react";
import {Row, Col, Container, InputGroup, FormControl} from "react-bootstrap";
import {CustomButton} from "../../CustomButton";
import {CustomDateWidget} from "../../CustomDateWidget";
import Button from "react-bootstrap/Button";
import state_and_districts from '../../../DummyData/state_and_districts.json';
import {maskPersonalDetails} from "../../../utils/maskPersonalDetails";
import axios from "axios";
import {CITIZEN_TOKEN_COOKIE_NAME, PROGRAM_API, RECIPIENTS_API} from "../../../constants";
import {getUserNumberFromRecipientToken} from "../../../utils/reciepientAuth";
import {getCookie} from "../../../utils/cookies";
import {
    AADHAAR_ERROR_MESSAGE, DISTRICT_ERROR_MSG, DOB_ERROR_MSG, GENDER_ERROR_MSG,
    NAME_ERROR_MSG,
    NATIONAL_ID_ERROR_MSG,
    NATIONAL_ID_TYPE_ERROR_MSG, STATE_ERROR_MSG
} from "./error-constants";

export const FormPersonalDetails = ({ setValue, formData, navigation, verifyDetails}) => {
    //"did:in.gov.uidai.aadhaar:11111111111", "did:in.gov.driverlicense:KA53/2323423"
    const ID_TYPES = [
        {
            "id": "aadhaar",
            "name": "Aadhaar",
            "value": "in.gov.uidai.aadhaar"
        },
        {
            "id": "driverLicense",
            "name": "Driver License",
            "value": "in.gov.driverlicense"
        }
    ];

    // TODO: get state and distict from flagr
    const STATES = Object.values(state_and_districts['states']).map(obj => obj.name);

    const GENDERS = [
        "Male",
        "Female",
        "Others"
    ];
    const MANDATORY_FIELDS = [
        "name",
        "dob",
        "state",
        "district",
        "gender"
    ];

    const { previous, next } = navigation;
    const [errors, setErrors] = useState({});
    const IdDetails = () => {
        function constuctNationalId(idtype, idNumber) {
            return ["did", idtype, idNumber].join(":")
        }

        function getSelectedIdType() {
            const preSelectedIdValue = formData.nationalId ? formData.nationalId.split(":")[1]: undefined;
            return preSelectedIdValue ? ID_TYPES.filter(a => a.value === preSelectedIdValue)[0].name: ""
        }

        function onIdChange(event, type) {
            if (type === "idType") {
                const idValue = event.target.value;
                let existingIdNumber = "";
                if (formData.nationalId) {
                    existingIdNumber = formData.nationalId.split(":")[2] ? formData.nationalId.split(":")[2]: ""
                }
                let nationalId = constuctNationalId(idValue, existingIdNumber)
                setValue({target: {name:"nationalId", value:nationalId}})
            } else if (type === "idNumber") {
                const idNumber = event.target.value;
                let existingIdType = "";
                if (formData.nationalId)
                    existingIdType = formData.nationalId.split(":")[1] ? formData.nationalId.split(":")[1]: "";
                let nationalId = constuctNationalId(existingIdType, idNumber);
                setValue({target: {name:"nationalId", value:nationalId}})
            }
        }

        return (
            <div className="pt-5">
                <h5>ID details</h5>
                <Row className="pt-2">
                    <div className="p-0 col-6">
                        <Col className="col-6">
                            <label htmlFor="idType">ID Type *</label>
                            <select className="form-control" id="idType"
                                    hidden={verifyDetails}
                                    placeholder="Select ID Type"
                                    onChange={(e) => onIdChange(e, "idType")}>
                                <option disabled selected={!getSelectedIdType()} value>Select ID Type</option>
                                {
                                    ID_TYPES.map(d => <option selected={d.name === getSelectedIdType()} value={d.value}>{d.name}</option>)
                                }
                            </select>
                            <div className="invalid-input">
                                {errors.nationalIDType}
                            </div>
                            {
                                verifyDetails &&
                                <p>{getSelectedIdType()}</p>
                            }
                        </Col>
                    </div>
                    <div className="p-0 col-6">
                        <Col className="col-6">
                            <label htmlFor="idNumber">ID Number *</label>
                            <input className="form-control" id="idNumber"
                                   hidden={verifyDetails}
                                   type="text" placeholder="Enter ID Number"
                                   defaultValue={formData.nationalId.split(":")[2]}
                                   onBlur={(e) => onIdChange(e, "idNumber")}/>
                            <div className="invalid-input">
                                {errors.nationalID}

                            </div>
                            <div className="invalid-input">
                                {errors.aadhaar}
                            </div>
                            {
                                verifyDetails &&
                                <p>{formData.nationalId.split(":")[2]}</p>
                            }
                        </Col>
                    </div>
                </Row>
            </div>
        )
    };

    const BeneficiaryDetails = () => {

        const [districts, setDistricts] = useState([]);

        useEffect(() => {
            setDistictsForState(formData.state)
        }, []);

        function onStateSelected(stateSelected) {
            setValue({target: {name:"state", value:stateSelected}});
            setValue({target: {name:"district", value:""}});
            setDistictsForState(stateSelected)
        }

        function setDistictsForState(state) {
            const stateObj = Object.values(state_and_districts['states']).find(obj => obj.name === state);
            if (stateObj) {
                setDistricts(stateObj.districts)
            } else {
                setDistricts([])
            }
        }

        function setDobValue(dob) {
            setValue({target: {name:"dob", value:dob}})
        }

        return (
            <div className="pt-5">
                <h5>Beneficiary Details</h5>
                <Row className="pt-2">
                    <div className="p-0 col-6">
                        <Col className="col-6">
                            <label htmlFor="name">Name * (As per ID card)</label>
                            <input className="form-control" name="name" id="name" type="text"
                                   hidden={verifyDetails}
                                   placeholder="Enter Name"
                                   defaultValue={formData.name}
                                   onBlur={setValue}/>
                            <div className="invalid-input">
                                {errors.name}
                            </div>
                            {
                                verifyDetails &&
                                    <p>{formData.name}</p>
                            }
                        </Col>
                    </div>
                    <div className="p-0 col-6">
                        <Col className="col-6">
                            <label htmlFor="state">State *</label>
                            <select className="form-control" name="state" id="state"
                                    onChange={(e) => onStateSelected(e.target.value)}
                                    hidden={verifyDetails}>
                                <option disabled selected={!formData.state} value>Select State</option>
                                {
                                    STATES.map(id => <option selected={id === formData.state} value={id}>{id}</option>)
                                }
                            </select>
                            <div className="invalid-input">
                                {errors.state}
                            </div>
                            {
                                verifyDetails &&
                                    <p>{formData.state}</p>
                            }
                        </Col>
                    </div>
                </Row>
                <Row className="pt-2">
                    <div className="p-0 col-6">
                        <Col className="col-6">
                            <label htmlFor="name">Date of Birth *</label>
                            { !verifyDetails && <CustomDateWidget id="dob" placeholder="Select Date"
                                              value={formData.dob}
                                              onChange={d => setDobValue(d)} />}
                            {
                                verifyDetails &&
                                <p>{formData.dob}</p>
                            }
                            <div className="invalid-input">
                                {errors.dob}
                            </div>
                        </Col>
                    </div>
                    <div className="p-0 col-6">
                        <Col className="col-6">
                            <label htmlFor="district">District *</label>
                            <select className="form-control" id="district" name="district" onChange={setValue} hidden={verifyDetails}>
                                <option disabled selected={!formData.district} value>Select District</option>
                                {
                                    districts.map(d => <option selected={d.name === formData.district} value={d.name}>{d.name}</option>)
                                }
                            </select>
                            <div className="invalid-input">
                                {errors.district}
                            </div>
                            {
                                verifyDetails &&
                                <p>{formData.district}</p>
                            }
                        </Col>
                    </div>
                </Row>
                <Row className="pt-2">
                    <div className="p-0 col-6">
                        <Col className="col-6">
                            <label htmlFor="gender">Gender *</label>
                            <select className="form-control" id="gender" name="gender" onChange={setValue} hidden={verifyDetails}>
                                <option disabled selected={!formData.gender} value>Select Gender</option>
                                {
                                    GENDERS.map(id => <option selected={id === formData.gender} value={id}>{id}</option>)
                                }
                            </select>
                            {
                                verifyDetails &&
                                <p>{formData.gender}</p>
                            }
                            <div className="invalid-input">
                                {errors.gender}
                            </div>
                        </Col>
                    </div>
                </Row>
            </div>
        )
    };


    const ContactInfo = () => {

        const userMobileNumber = getUserNumberFromRecipientToken();

        const [beneficiaryNumber, setBeneficiaryNumber] = useState('');
        const [oTPSent, setOTPSent] = useState(false);
        const [otp, setOtp] = useState('');

        const [email, setEmail] = useState(formData.email);
        const [confirmEmail, setConfirmEmail] = useState(formData.email);

        useEffect(() => {
            if (formData.contact && userMobileNumber !== formData.contact) {
                setBeneficiaryNumber(formData.contact);
            }
        }, []);

        function sendOTP() {
            // TODO add logic to call backend to send the OTP
            setOTPSent(true)
        }

        function verifyOTP(value) {
            setOtp(value);
            if (value === "1234") {
                alert("OTP verified!");
                setValue({target: {name:"contact", value:beneficiaryNumber}});
            }
        }

        function verifyEmail(confirmEmail) {
            setConfirmEmail(confirmEmail)
            if (email === confirmEmail) {
                alert("Email confirmed")
                setValue({target: {name:"email", value:email}});
            }
        }

        return (
            <div className="pt-5">
                <h5>Contact information for e-certificate</h5>
                <Row className="pt-2">
                    <div className="p-0 col-6">
                        <Col className="col-6">
                            <label htmlFor="mobile">Mobile Number</label>
                            { !verifyDetails && <div className="radio-group">
                                <div className="form-check radio pb-2">
                                    <input className="form-check-input" type="radio" name="contact" id="defaultContact"
                                           checked={userMobileNumber === formData.contact}
                                           value={userMobileNumber} onChange={setValue}/>
                                    <label className="form-check-label" htmlFor="defaultContact">
                                        Use {userMobileNumber}
                                    </label>
                                </div>
                                <div className="form-check radio pb-2">
                                    <input className="form-check-input" type="radio" name="contact" id="otherContact"
                                           checked={beneficiaryNumber === formData.contact}
                                           value={beneficiaryNumber} onChange={()=> alert("Fill the beneficiary number before selecting")}/>
                                    <label className="form-check-label" htmlFor="otherContact">
                                        Use Beneficiary Number
                                    </label>
                                    <InputGroup>
                                        <input className="form-control" id="mobileNumber" type="text"
                                               value={beneficiaryNumber}
                                               onChange={e => setBeneficiaryNumber(e.target.value)}
                                               placeholder="Enter Mobile number" />
                                        <InputGroup.Append>
                                            <Button hidden={!beneficiaryNumber || userMobileNumber !== formData.contact} variant="link" onClick={() => sendOTP()}>Verify</Button>
                                        </InputGroup.Append>
                                    </InputGroup>
                                    {
                                        oTPSent &&
                                        <InputGroup className="mt-3">
                                            <InputGroup.Prepend>
                                                <InputGroup.Text>OTP</InputGroup.Text>
                                            </InputGroup.Prepend>
                                            <input className="form-control" id="OTP" type="text"
                                                   value={otp}
                                                   placeholder="Enter OTP" onChange={(e) => verifyOTP(e.target.value)}
                                            />
                                        </InputGroup>
                                    }
                                </div>
                            </div>
                            }
                            {
                                verifyDetails &&
                                    <p>{formData.contact}</p>
                            }
                        </Col>
                    </div>
                    <div className="p-0 col-6">
                        <Col className="col-6">
                            <label htmlFor="email">Email ID</label>
                            <div hidden={verifyDetails}>
                                <input className="form-control" id="email" name="email" type="text"
                                       placeholder="Enter Email ID"
                                       defaultValue={maskPersonalDetails(email, true)}
                                       onBlur={(evt) => evt.target.value = maskPersonalDetails(evt.target.value, true)}
                                       onFocus={(evt) => evt.target.value = email}
                                       onChange={(e) => setEmail(e.target.value)}/>
                                <div className="pt-2">
                                    <input className="form-control" id="confirmEmail" name="email" type="text"
                                           placeholder="Confirm Email ID"
                                           value={confirmEmail}
                                           onChange={(e) => verifyEmail(e.target.value)}/>
                                </div>
                            </div>
                            {
                                verifyDetails &&
                                    <p>{formData.email}</p>
                            }
                        </Col>
                    </div>
                </Row>
            </div>
        )
    };

    function validateUserDetails() {
        const errors = {}
        const nationalIDType = formData.nationalId.split(":")[1]
        const nationIDNumber = formData.nationalId.split(":")[2]

        if(!nationalIDType) {
            errors.nationalIDType = NATIONAL_ID_TYPE_ERROR_MSG
        }
        if(!nationIDNumber) {
            errors.nationalID = NATIONAL_ID_ERROR_MSG;
        } else {
            console.log("IDDDD", nationalIDType, ID_TYPES[0])
          if(nationalIDType === ID_TYPES[0].value && (nationIDNumber.length !== 12 || isNaN(nationIDNumber))) {
              errors.aadhaar = AADHAAR_ERROR_MESSAGE
          }
        }
        if(!formData.name) {
            errors.name = NAME_ERROR_MSG
        }
        if(!formData.state) {
            errors.state = STATE_ERROR_MSG
        }
        if(!formData.district) {
            errors.district = DISTRICT_ERROR_MSG
        }
        if(!formData.dob) {
            errors.dob = DOB_ERROR_MSG
        }
        if(!formData.gender) {
            errors.gender = GENDER_ERROR_MSG
        }
        setErrors(errors)
        return Object.values(errors).filter(e => e).length > 0
        // TODO: add validations before going to confirm screen
    }

    const onContinue = () => {
        if (validateUserDetails()) {
            alert("Please fill all the required field")
        } else {
            next()
        }
    };

    const onSubmit = () => {
        // TODO: refactor fields of formData itself to match api body
        let dataToSend = {...formData};
        delete dataToSend["state"];
        delete dataToSend["district"];
        delete dataToSend["contact"];
        dataToSend["address"] = {
            "addressLine1": "",
            "addressLine2": "",
            "state": "",
            "district": "",
            "pincode": 0
        };
        dataToSend["address"]["state"] = formData.state;
        dataToSend["address"]["district"] = formData.district;
        dataToSend["phone"] = getUserNumberFromRecipientToken();
        dataToSend["beneficiaryPhone"] = formData.contact
        const token = getCookie(CITIZEN_TOKEN_COOKIE_NAME);
        const config = {
            headers: {"recipientToken": token, "Content-Type": "application/json"},
        };
        axios.post(RECIPIENTS_API, dataToSend, config)
            .then(res => {
                if (res.status === 200) {
                    next()
                }
            });
        next()
    };
    return (
        <Container fluid>
            <div className="side-effect-container">
                <h3>Provide details to complete enrollment</h3>
                <IdDetails/>
                <BeneficiaryDetails/>
                <ContactInfo/>
                <Button className="mr-3 btn-link" variant="link" type="submit" onClick={previous}>
                    <span>Back</span>
                </Button>
                { !verifyDetails &&
                    <CustomButton className="blue-btn" type="submit" onClick={onContinue}>
                        <span>Continue &#8594;</span>
                    </CustomButton>
                }
                { verifyDetails &&
                    <CustomButton className="blue-btn" type="submit" onClick={onSubmit}>
                        <span>Confirm</span>
                    </CustomButton>
                }
            </div>
        </Container>

    )
}
