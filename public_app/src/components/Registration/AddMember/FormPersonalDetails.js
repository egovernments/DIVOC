import React, {useEffect, useState} from "react";
import {Col, Container, Row} from "react-bootstrap";
import {CustomButton} from "../../CustomButton";
import Button from "react-bootstrap/Button";
import state_and_districts from '../../../DummyData/state_and_districts.json';
import {maskPersonalDetails} from "../../../utils/maskPersonalDetails";
import axios from "axios";
import {CITIZEN_TOKEN_COOKIE_NAME, RECIPIENTS_API} from "../../../constants";
import {getUserNumberFromRecipientToken} from "../../../utils/reciepientAuth";
import {getCookie} from "../../../utils/cookies";
import {
    AADHAAR_ERROR_MESSAGE,
    DISTRICT_ERROR_MSG,
    EMAIL_ERROR_MESSAGE,
    GENDER_ERROR_MSG, INVALID_NAME_ERR_MSG,
    MINIMUM_LENGTH_OF_NAME_ERROR_MSG,
    NAME_ERROR_MSG,
    NATIONAL_ID_ERROR_MSG,
    NATIONAL_ID_TYPE_ERROR_MSG,
    STATE_ERROR_MSG
} from "./error-constants";
import {formatDate} from "../../../utils/CustomDate";
import {isAllLetter, isValidAadhaarNumber} from "../../../utils/validations";

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
    },
    {
        "id": "panCard",
        "name": "Pan Card",
        "value": "in.gov.pancard"
    },
    {
        "id": "passport",
        "name": "Passport",
        "value": "in.gov.passport"
    },
    {
        "id": "healthInsurance",
        "name": "Health Insurance Smart Card",
        "value": "in.gov.healthInsurance"
    },
    {
        "id": "mnrega",
        "name": "MNREGA Job Card",
        "value": "in.gov.mnrega"
    },
    {
        "id": "id",
        "name": "Official Identity Card issued to MPs/MLAs",
        "value": "in.gov.id"
    }
];
// TODO: get state and distict from flagr
const STATES = Object.values(state_and_districts['states']).map(obj => obj.name);

const GENDERS = [
    "Male",
    "Female",
    "Others"
];
export const FormPersonalDetails = ({ setValue, formData, navigation, verifyDetails}) => {
    //"did:in.gov.uidai.aadhaar:11111111111", "did:in.gov.driverlicense:KA53/2323423"


    const MANDATORY_FIELDS = [
        "name",
        "dob",
        "state",
        "district",
        "gender"
    ];

    const { previous, next } = navigation;
    const [errors, setErrors] = useState({});

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
            if(nationalIDType === ID_TYPES[0].value && isValidAadhaarNumber(nationIDNumber)) {
                errors.aadhaar = AADHAAR_ERROR_MESSAGE
            }
        }
        if(!formData.name) {
            errors.name = NAME_ERROR_MSG
        } else if (formData.name.length < 2){
            errors.name = MINIMUM_LENGTH_OF_NAME_ERROR_MSG
        } else {
            if(!isAllLetter(formData.name)) {
                errors.name = INVALID_NAME_ERR_MSG
            }
        }

        if(!formData.state) {
            errors.state = STATE_ERROR_MSG
        }
        if(!formData.district) {
            errors.district = DISTRICT_ERROR_MSG
        }
        // if(!formData.dob) {errors.dob = DOB_ERROR_MSG}

        if(!formData.gender) {
            errors.gender = GENDER_ERROR_MSG
        }
        if (formData.email != "" && formData.email != formData.confirmEmail) {
            errors.email = EMAIL_ERROR_MESSAGE
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
        dataToSend["yob"] = parseInt(dataToSend["yob"]);
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
            })
          .catch(err => {
              alert("Error while registering, please try again later.\n" + err);
          });
    };
    return (
        <Container fluid>
            <div className="side-effect-container">
                <h3>{verifyDetails ? "Verify beneficiary details" : "Provide details to complete enrollment"}</h3>
                <IdDetails  verifyDetails={verifyDetails} formData={formData} setValue={setValue} errors={errors}/>
                <BeneficiaryDetails verifyDetails={verifyDetails} formData={formData} setValue={setValue} errors={errors}/>
                <ContactInfo verifyDetails={verifyDetails} formData={formData} setValue={setValue} errors={errors}/>
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

const ContactInfo = ({verifyDetails, formData, setValue, errors}) => {

    const userMobileNumber = getUserNumberFromRecipientToken();

    return (
        <div className="pt-5">
            <h5>Contact information for e-certificate</h5>
            <Row className="pt-2">
                <div className="p-0 col-6">
                    <Col className="col-6">
                        <label htmlFor="mobile">Mobile Number</label>
                        { !verifyDetails && <div className="radio-group">

                            <div className="pb-2">

                                <label className="form-check-label" htmlFor="defaultContact">
                                    {userMobileNumber}
                                </label>
                            </div>
                        </div>
                        }
                        {
                            verifyDetails &&
                            <><br/><b>{formData.contact}</b></>
                        }
                    </Col>
                </div>
                <div className="p-0 col-6">
                    <Col className="col-6">
                        <label htmlFor="email">Email ID</label>
                        <div hidden={verifyDetails}>
                            <input className="form-control" id="email" name="email" type="text"
                                   placeholder="Enter Email ID"
                                   defaultValue={maskPersonalDetails(formData.email, true)}
                                   onBlur={(evt) => evt.target.value = maskPersonalDetails(evt.target.value, true)}
                                   onFocus={(evt) => evt.target.value = formData.email}
                                   onChange={(e) => setValue({target: {name:"email", value:e.target.value}})}/>
                            <div className="pt-2">
                                <input className="form-control" id="confirmEmail" name="email" type="text"
                                       placeholder="Confirm Email ID"
                                       value={formData.confirmEmail}
                                       onChange={(e) => setValue({target: {name:"confirmEmail", value:e.target.value}})}
                                />
                            </div>
                            <div className="invalid-input">
                                {errors.email}
                            </div>
                        </div>
                        {
                            verifyDetails &&
                            <><br/><b>{formData.email}</b></>
                        }
                    </Col>
                </div>
            </Row>
        </div>
    )
};

const IdDetails = ({verifyDetails, formData, setValue, errors}) => {
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
                            <b>{getSelectedIdType()}</b>
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
                            <b>{formData.nationalId.split(":")[2]}</b>
                        }
                    </Col>
                </div>
            </Row>
        </div>
    )
};

const BeneficiaryDetails = ({verifyDetails, formData, setValue, errors}) => {

    const [districts, setDistricts] = useState([]);

    useEffect(() => {
        setDistictsForState(formData.state)
    });

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
        // const minDate = new Date();
        // minDate.setYear(minDate.getYear() - maxAge);
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
                                   maxLength={100}
                                   onBlur={setValue}/>
                            <div className="invalid-input">
                                {errors.name}
                            </div>
                            {
                                verifyDetails &&
                                    <b>{formData.name}</b>
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
                                    <b>{formData.state}</b>
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
                                <><br/><b>{formData.gender}</b></>
                            }
                            <div className="invalid-input">
                                {errors.gender}
                            </div>
                            <label htmlFor="name" className="pt-2">Age</label>
                            <div className={"pl-2" + verifyDetails?" font-weight-bold":""}> {new Date().getFullYear() - formData.yob} Years </div>
                            {/*<label htmlFor="name">Date of Birth *</label>
    function setDobValue(dob) {
        setValue({target: {name:"dob", value:dob}})
    }
    // const minDate = new Date();
    // minDate.setYear(minDate.getYear() - maxAge);
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
                            <b>{formData.name}</b>
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
                            <b>{formData.state}</b>
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
                            <><br/><b>{formData.gender}</b></>
                        }
                        <div className="invalid-input">
                            {errors.gender}
                        </div>
                        <label htmlFor="name" className="pt-2">Age</label>
                        <div className={"pl-2" + verifyDetails?" font-weight-bold":""}> {new Date().getFullYear() - formData.yob} Years </div>
                        {/*<label htmlFor="name">Date of Birth *</label>
                            { !verifyDetails && <CustomDateWidget id="dob" placeholder="Select Date"
                                              value={minDate}
                                              minDate={minDate}
                                              maxDate={minDate}
                                              onChange={d => {
                                                  setDobValue(d)
                                              }} />}
                            {
                                verifyDetails &&
                                <><br/><b>{formatDate(formData.dob)}</b></>
                            }
                            <div className="invalid-input">
                                {errors.dob}
                            </div>*/}
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
                            <b>{formData.district}</b>
                        }
                    </Col>
                </div>
            </Row>
        </div>
    )
}
