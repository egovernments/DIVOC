import React, {useEffect, useRef, useState} from "react";
import "./index.css"
import {useSelector} from "react-redux";
import {constuctNationalId, getNationalIdNumber, getNationalIdType, ID_TYPES} from "../../utils/national-id";
import {BaseFormCard} from "../BaseFormCard";
import {getMessageComponent, LANGUAGE_KEYS} from "../../lang/LocaleContext";
import {maskPersonalDetails} from "../../utils/maskPersonalDetails";
import {CustomButton} from "../CustomButton";
import {
    AADHAAR_ERROR_MESSAGE,
    DISTRICT_ERROR_MSG,
    EMAIL_ERROR_MESSAGE,
    GENDER_ERROR_MSG,
    INVALID_NAME_ERR_MSG,
    MAXIMUM_LENGTH_OF_NAME_ERROR_MSG,
    MINIMUM_LENGTH_OF_NAME_ERROR_MSG,
    NAME_ERROR_MSG, NATIONAL_ID_ERROR_MSG, NATIONAL_ID_TYPE_ERROR_MSG, NATIONALITY_ERROR_MSG,
    PINCODE_ERROR_MESSAGE,
    STATE_ERROR_MSG
} from "./error-constants";
import {isInValidAadhaarNumber, isValidName, isValidPincode} from "../../utils/validations";
import {applicationConfigsDB} from "../../Services/ApplicationConfigsDB";
import {getSelectedProgram, getSelectedProgramId} from "../ProgramSelection";
import {programDb} from "../../Services/ProgramDB";
import doseCompletedImg from "../../assets/img/dose-completed.svg";
import currentDoseImg from "../../assets/img/dose-currentdose.svg";
import nextDoseImg from "../../assets/img/dose-nextdose.svg";
import {DosesState} from "../DosesState";

const GENDERS = [
    "Male",
    "Female",
    "Other"
];
export const RegisterBeneficiaryForm = ({verifyDetails, state, onBack, onContinue, buttonText}) => {
    const [formData, setFormData] = useState({...state});

    return (
        <div className="new-enroll-container">
            <BaseFormCard title={getMessageComponent(LANGUAGE_KEYS.ENROLLMENT_TITLE)} onBack={verifyDetails ? () => {
                onBack(formData)} : undefined}>
                <BeneficiaryForm verifyDetails={verifyDetails} state={state} onContinue={onContinue} buttonText={buttonText}/>
            </BaseFormCard>
        </div>
    )
}

export function BeneficiaryForm({verifyDetails, state, onContinue, buttonText}) {
    const walkInForm = useRef(null)

    const [errors, setErrors] = useState({});
    const [formData, setFormData] = useState({...state});

    useEffect(() => {
        walkInForm.current.scrollIntoView()

    }, [verifyDetails]);

    function setValue(evt) {
        setFormData((state) => ({
            ...state,
            [evt.target.name]: evt.target.value
        }))
    }

    function validateUserDetails() {
        const errorsData = {}
        const nationalIDType = getNationalIdType(formData.identity)
        const nationIDNumber = getNationalIdNumber(formData.identity)

        if(!nationalIDType) {
            errorsData.nationalIDType = NATIONAL_ID_TYPE_ERROR_MSG
        }
        if(!nationIDNumber) {
            errorsData.nationalID = NATIONAL_ID_ERROR_MSG;
        } else {
            if(nationalIDType === ID_TYPES[0].value && isInValidAadhaarNumber(nationIDNumber)) {
                errorsData.aadhaar = AADHAAR_ERROR_MESSAGE
            }
        }
        if(!formData.name) {
            errorsData.name = NAME_ERROR_MSG
        } else if (formData.name.length < 2){
            errorsData.name = MINIMUM_LENGTH_OF_NAME_ERROR_MSG
        } else if (formData.name.length > 99) {
            errorsData.name = MAXIMUM_LENGTH_OF_NAME_ERROR_MSG
        } else {
            if(!isValidName(formData.name)) {
                errorsData.name = INVALID_NAME_ERR_MSG
            }
        }
        if(!formData.state) {
            errorsData.state = STATE_ERROR_MSG
        }
        if(!formData.district) {
            errorsData.district = DISTRICT_ERROR_MSG
        }

        if(!formData.nationalId) {
            errorsData.nationalId = NATIONALITY_ERROR_MSG
        }

        if(formData.pincode && !isValidPincode(formData.pincode)) {
            errorsData.pincode = PINCODE_ERROR_MESSAGE
        }

        if(!formData.gender) {
            errorsData.gender = GENDER_ERROR_MSG
        }
        if (formData.email != "" && formData.email != formData.confirmEmail) {
            errorsData.email = EMAIL_ERROR_MESSAGE
        }

        setErrors(errorsData)
        return Object.values(errorsData).filter(e => e).length > 0
        // TODO: add validations before going to confirm screen
    }

    function onContinueClick() {
        if (verifyDetails) {
            onContinue(formData)
        } else {
            if (validateUserDetails()) {
                alert("Please fill all the required field")
            } else {
                onContinue(formData)
            }
        }
    }

    return (
        <div className="text-left verify-mobile-container" ref={walkInForm}>
            <IdDetails formData={formData} setValue={setValue} verifyDetails={verifyDetails} errors={errors}/>
            <BeneficiaryDetails formData={formData} setValue={setValue} verifyDetails={verifyDetails}
                                errors={errors}/>
            <ContactInfo formData={formData} setValue={setValue} verifyDetails={verifyDetails} errors={errors}/>
            <VaccineDetails formData={formData} setValue={setValue} verifyDetails={verifyDetails} errors={errors}/>
            <CustomButton className="primary-btn w-100 mt-5 mb-5"
                          onClick={onContinueClick}>{buttonText}</CustomButton>
        </div>
    )
}

const IdDetails = ({verifyDetails, formData, setValue, errors}) => {
    function getSelectedIdType() {
        const preSelectedIdValue = formData.identity ? getNationalIdType(formData.identity) : undefined;
        return preSelectedIdValue ? ID_TYPES.filter(a => a.value === preSelectedIdValue)[0].name : ""
    }

    function onIdChange(event, type) {
        if (type === "idType") {
            const idValue = event.target.value;
            let existingIdNumber = "";
            if (formData.identity) {
                const nationalIdNumber = getNationalIdNumber(formData.identity);
                existingIdNumber = nationalIdNumber ? nationalIdNumber : ""
            }
            let identity = constuctNationalId(idValue, existingIdNumber)
            setValue({target: {name: "identity", value: identity}})
        } else if (type === "idNumber") {
            const idNumber = event.target.value;
            let existingIdType = "";
            if (formData.identity) {
                const nationalIdType = getNationalIdType(formData.identity);
                existingIdType = nationalIdType ? nationalIdType : "";
            }
            let identity = constuctNationalId(existingIdType, idNumber);
            setValue({target: {name: "identity", value: identity}})
        }
    }

    return (
        <div>
            <h5>ID details</h5>
            <div>
                <label className={verifyDetails ? "custom-verify-text-label" : "custom-text-label required"}
                       htmlFor="name">Name (As per ID card)</label>
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
            </div>
            <div>
                <label className={verifyDetails ? "custom-verify-text-label" : "custom-text-label required"}
                       htmlFor="idType">ID Type </label>
                <select className="form-control" id="idType"
                        hidden={verifyDetails}
                        placeholder="Select ID Type"
                        onChange={(e) => onIdChange(e, "idType")}>
                    <option disabled selected={!getSelectedIdType()} value>Select ID Type</option>
                    {
                        ID_TYPES.map(d => <option selected={d.name === getSelectedIdType()}
                                                  value={d.value}>{d.name}</option>)
                    }
                </select>
                <div className="invalid-input">
                    {errors.nationalIDType}
                </div>
                {
                    verifyDetails &&
                    <p>{getSelectedIdType()}</p>
                }
            </div>
            <div>
                <label className={verifyDetails ? "custom-verify-text-label" : "custom-text-label required"}
                       htmlFor="idNumber">ID Number </label>
                <input className="form-control" id="idNumber"
                       hidden={verifyDetails}
                       type="text" placeholder="Enter ID Number"
                       defaultValue={getNationalIdNumber(formData.identity)}
                       onBlur={(e) => onIdChange(e, "idNumber")}/>
                <div className="invalid-input">
                    {errors.nationalID}

                </div>
                <div className="invalid-input">
                    {errors.aadhaar}
                </div>
                {
                    verifyDetails &&
                    <p>{getNationalIdNumber(formData.identity)}</p>
                }
            </div>
            <div>
                <label className={verifyDetails ? "custom-verify-text-label" : "custom-text-label"}
                       htmlFor="name">Age</label>
                <div> {new Date().getFullYear() - formData.yob} Years</div>
            </div>
            <div>
                <label className={verifyDetails ? "custom-verify-text-label" : "custom-text-label required"}
                       htmlFor="gender">Gender </label>
                <select className="form-control" id="gender" name="gender" onChange={setValue}
                        hidden={verifyDetails}>
                    <option disabled selected={!formData.gender} value>Select Gender</option>
                    {
                        GENDERS.map(id => <option selected={id === formData.gender} value={id}>{id}</option>)
                    }
                </select>
                {
                    verifyDetails &&
                    <><br/><p>{formData.gender}</p></>
                }
                <div className="invalid-input">
                    {errors.gender}
                </div>
            </div>
        </div>
    )
};

const BeneficiaryDetails = ({verifyDetails, formData, setValue, errors}) => {
    const state_and_districts = useSelector(state => state.etcd.appConfig.stateAndDistricts);
    const STATES = Object.values(state_and_districts['states']).map(obj => obj.name);

    const [districts, setDistricts] = useState([]);
    const [nationalities, setNationalities] = useState([]);

    useEffect(() => {
        setDistictsForState(formData.state)
        applicationConfigsDB.getApplicationConfigs()
            .then(res => {
                setNationalities(res.nationalities)
            })
    }, []);

    function onStateSelected(stateSelected) {
        setValue({target: {name: "state", value: stateSelected}});
        setValue({target: {name: "district", value: ""}});
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
        setValue({target: {name: "dob", value: dob}})
    }

    // const minDate = new Date();
    // minDate.setYear(minDate.getYear() - maxAge);
    return (
        <div className="pt-3">
            <h5>Residence Details</h5>
            <div>
                <label className={verifyDetails ? "custom-verify-text-label" : "custom-text-label required"}
                       htmlFor="state">State </label>
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
            </div>
            <div>
                <label className={verifyDetails ? "custom-verify-text-label" : "custom-text-label required"}
                       htmlFor="district">District </label>
                <select className="form-control" id="district" name="district" onChange={setValue}
                        hidden={verifyDetails}>
                    <option disabled selected={!formData.district} value>Select District</option>
                    {
                        districts.map(d => <option selected={d.name === formData.district}
                                                   value={d.name}>{d.name}</option>)
                    }
                </select>
                <div className="invalid-input">
                    {errors.district}
                </div>
                {
                    verifyDetails &&
                    <p>{formData.district}</p>
                }
            </div>
            <div>
                <label hidden={verifyDetails && !formData.locality}
                       className={verifyDetails ? "custom-verify-text-label" : "custom-text-label"}
                       htmlFor="locality">Locality</label>
                <input className="form-control" name="locality" id="locality" type="text"
                       hidden={verifyDetails}
                       placeholder="Enter your locality"
                       defaultValue={formData.locality}
                       onBlur={setValue}/>
                {
                    verifyDetails &&
                    <p>{formData.locality}</p>
                }
            </div>
            <div>
                <label hidden={verifyDetails && !formData.pincode}
                       className={verifyDetails ? "custom-verify-text-label" : "custom-text-label"}
                       htmlFor="pinCode">Pin code</label>
                <input className="form-control" name="pincode" id="pinCode" type="text"
                       hidden={verifyDetails}
                       placeholder="Enter your pin code"
                       defaultValue={formData.pincode}
                       onBlur={setValue}
                />
                <div className="invalid-input">
                    {errors.pincode}
                </div>
                {
                    verifyDetails &&
                    <p>{formData.pincode}</p>
                }
            </div>
            <div>
                <label className={verifyDetails ? "custom-verify-text-label" : "custom-text-label required"}
                       htmlFor="state">Nationality </label>
                <select className="form-control" name="nationalId" id="nationalId"
                        onChange={setValue}
                        hidden={verifyDetails}>
                    <option disabled selected={!formData.nationalId} value>Select Nationality</option>
                    {
                        nationalities.map(id => <option selected={id === formData.nationalId} value={id}>{id}</option>)
                    }
                </select>
                <div className="invalid-input">
                    {errors.nationalId}
                </div>
                {
                    verifyDetails &&
                    <p>{formData.nationalId}</p>
                }
            </div>
        </div>
    )
};

const ContactInfo = ({verifyDetails, formData, setValue, errors}) => {

    const userMobileNumber = "";

    return (
        <div className="pt-3">
            <h5>Contact information</h5>
            <div>
                <label className={verifyDetails ? "custom-verify-text-label" : "custom-text-label"}
                       htmlFor="mobile">Mobile</label>
                {!verifyDetails && <div className="radio-group">

                    <div className="pb-2">

                        <label className="form-check-label" htmlFor="defaultContact">
                            {formData.phone}
                        </label>
                    </div>
                </div>
                }
                {
                    verifyDetails &&
                    <><br/><p>{formData.phone}</p></>
                }
            </div>
            <div hidden={verifyDetails && !formData.email} >
                <label className={verifyDetails ? "custom-verify-text-label" : "custom-text-label"}
                       htmlFor="email">Beneficiary Email ID</label>
                <div hidden={verifyDetails}>
                    <input className="form-control" id="email" name="email" type="text"
                           placeholder="Enter Email ID"
                           defaultValue={maskPersonalDetails(formData.email, true)}
                           onBlur={(evt) => evt.target.value = maskPersonalDetails(evt.target.value, true)}
                           onFocus={(evt) => evt.target.value = formData.email}
                           onChange={(e) => setValue({target: {name: "email", value: e.target.value}})}/>
                    <div className="pt-2">
                        <label hidden={verifyDetails && !formData.email} htmlFor="confirmEmail">Verify Beneficiary Email
                            ID</label>
                        <input className="form-control" id="confirmEmail" name="email" type="text"
                               placeholder="Confirm Email ID"
                               value={formData.confirmEmail}
                               onPaste={(e) => {
                                   e.preventDefault()
                               }}
                               onDrag={(e) => {
                                   e.preventDefault()
                               }}
                               onDrop={(e) => {
                                   e.preventDefault()
                               }}
                               onChange={(e) => setValue({target: {name: "confirmEmail", value: e.target.value}})}
                        />
                    </div>
                    <div className="invalid-input">
                        {errors.email}
                    </div>
                </div>
                {
                    verifyDetails &&
                    <><br/><p>{maskPersonalDetails(formData.email)}</p></>
                }
            </div>
        </div>
    )
};

const VaccineDetails = ({verifyDetails, formData, setValue, errors}) => {

    const hasVaccine = formData.appointments ?
        formData.appointments.filter(a => a["programId"] === getSelectedProgramId() && a.vaccine).length > 0 : false;

    return (
        <div className="pt-3">
            <div hidden={!hasVaccine}>
                <h5>Vaccine Details</h5>
                <div>
                    <label className={verifyDetails ? "custom-verify-text-label" : "custom-text-label"}
                           htmlFor="mobile">Vaccine</label>
                    {
                        verifyDetails &&
                        <><br/>
                        <p>
                            {formData.appointments.filter(a => a["programId"] === getSelectedProgramId() && !a.certified)[0]?.vaccine}
                            {
                                <DosesState appointments={formData.appointments}/>
                            }
                        </p></>
                    }
                </div>
            </div>
            <div hidden={!formData.comorbidities || formData.comorbidities.length === 0} className="comorbidities-section">
                <label htmlFor="confirmEmail">Comorbidities</label>
                <p>
                    {formData.comorbidities.join(", ")}
                </p>
            </div>
        </div>
    )
};
