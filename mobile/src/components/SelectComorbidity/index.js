import React, {useEffect, useState} from "react";
import {ApiServices} from "../../Services/ApiServices";
import {
    FORM_WALK_IN_ELIGIBILITY_CRITERIA,
    FORM_WALK_IN_VERIFY_MOBILE,
    initialWalkInEnrollmentState, INVALID_ELIGIBILITY_CRITERIA,
    useWalkInEnrollment
} from "../WalkEnrollments/context";
import {BaseFormCard} from "../BaseFormCard";
import {getMessageComponent, LANGUAGE_KEYS} from "../../lang/LocaleContext";
import "./index.css";
import {CustomButton} from "../CustomButton";
import {comorbiditiesDb} from "../../Services/ComorbiditiesDB";
import {CONSTANT} from "../../utils/constants";
import {useHistory} from "react-router";
import config from "../../config"
import {EtcdConfigService} from "../../Services/EtcdConfigService";

export const SelectComorbidity = ({}) => {
    const {goNext} = useWalkInEnrollment();
    const history = useHistory();
    const MINIMUM_SUPPORT_YEAR = 1920;
    const [errors, setErrors] = useState({});
    const [conditions, setConditions] = useState([])
    const years = [];
    const curYear = new Date().getFullYear();
    const [showComorbidity, setShowComorbidity] = useState("yes");

    const [minAge, setMinAge] = useState(0);
    const [maxAge, setMaxAge] = useState(curYear - MINIMUM_SUPPORT_YEAR);
    const [formData, setFormData] = useState(initialWalkInEnrollmentState)
    const configurationService = new EtcdConfigService();

    function setComorbidities(result) {
        setConditions(result.commorbidities || [])
        setMinAge(result.minAge || 0)
        setMaxAge(result.maxAge || curYear - MINIMUM_SUPPORT_YEAR)
    }

    useEffect(() => {
        let programId = localStorage.getItem("programId");

        comorbiditiesDb.getComorbidities(programId)
            .then(res => {
                if (res) {
                    setComorbidities(res.comorbidities);
                } else {
                    configurationService.getProgramComorbidities(CONSTANT.PROGRAM_COMORBIDITIES_KEY)
                        .then((res) => {
                            const configs = res;
                            setComorbidities(configs)
                            comorbiditiesDb.saveComorbidities(programId, configs)
                        })
                        .catch((err) => {
                            console.log("Error occurred while fetching comorbidity config from etcd");
                            console.log(err)
                        })
                }
            })
            .catch(err => {

            });

    }, []);

    for (let i = MINIMUM_SUPPORT_YEAR; i <= curYear; i++) {
        years.push("" + i)
    }

    function onContinue() {
        function isValidAge() {
            return (curYear - formData.yob) >= minAge && (curYear - formData.yob) <= maxAge;
        }

        function hasConditions() {
            return conditions && conditions.length> 0
        }

        if(hasConditions() && formData.choice === "yes" && formData.comorbidities.length === 0) {
            setErrors({"choice":"* Please select at least one comorbidity"});
        }
        else if (formData.yob && formData.yob > 1900 && formData.choice === "yes" &&
            (isValidAge() || formData.comorbidities.length>0)) {
            setErrors({})
            goNext(FORM_WALK_IN_ELIGIBILITY_CRITERIA, FORM_WALK_IN_VERIFY_MOBILE, formData)
        } else if(formData.yob && formData.yob > 1900 && formData.choice === "no" && isValidAge()) {
            setErrors({})
            goNext(FORM_WALK_IN_ELIGIBILITY_CRITERIA, FORM_WALK_IN_VERIFY_MOBILE, formData)
        }
        else if (formData.yob && (curYear - formData.yob) < minAge) {
            goNext(FORM_WALK_IN_ELIGIBILITY_CRITERIA, INVALID_ELIGIBILITY_CRITERIA, formData)
        }
        else if (formData.yob && (curYear - formData.yob) > maxAge) {
            goNext(FORM_WALK_IN_ELIGIBILITY_CRITERIA, INVALID_ELIGIBILITY_CRITERIA, formData)
        }
        else {
            setErrors({"yob":"Please select year of birth"});
        }
    }

    function setValue(data) {
        setFormData((state) => ({...state, ...data}))
    }

    function onYOBChange(year) {
        setValue({yob: year})
    }

    function selectComorbidity(x) {
        let updatedList = [...formData.comorbidities];
        if (!x.checked && updatedList.includes(x.value)) {
            const index = updatedList.indexOf(x.value);
            if (index > -1) {
                updatedList.splice(index, 1);
            }
        } else {
            updatedList.push(x.value)
        }
        setValue({comorbidities: updatedList})
    }

    function showComorbiditiesHandler(event) {
        setShowComorbidity(event.target.value)
        setValue({choice: event.target.value})
        if (event.target.value === "no") {
            setValue({comorbidities: []})
        }
    }

    return (
        <div className="new-enroll-container">
            <BaseFormCard title={getMessageComponent(LANGUAGE_KEYS.ENROLLMENT_TITLE)} onBack={() => {history.push(config.urlPath)}}>
                <div className="select-program-container">
                    <div className="d-flex justify-content-between align-items-center">
                        <h5>Eligibility Criteria</h5>
                    </div>
                    <div>
                        <div className="d-flex flex-column align-items-start">
                            <label className="custom-text-label required">Year of birth</label>
                            <select className="form-control form-control-inline" id="yearSelect"
                                    placeholder="Select Year"
                                    value={formData.yob}
                                    onChange={(t) => onYOBChange(t.target && t.target.value)}>
                                <option>Select Year</option>
                                {
                                    years.map(x => <option selected={formData.yob === x} value={x}>{x}</option>)
                                }
                            </select>
                            <div className="invalid-input">
                                {errors.yob}
                            </div>
                        </div>
                        <div hidden={!conditions || conditions.length === 0}>
                        <div className="d-flex flex-column align-items-start">
                            <label className="custom-text-label required text-left mt-2" htmlFor="yearSelect">Does the
                                beneficiary have any of the following comorbidities?</label>
                            <div className="d-flex">
                                <div className="pl-2 form-check form-check-inline">
                                    <input className="form-check-input" type="radio" onChange={showComorbiditiesHandler}
                                           id="yes" name="choice" value="yes" checked={formData.choice === "yes"}/>
                                    <label className="form-check-label" htmlFor="yes">Yes</label>
                                </div>
                                <div className="pl-2 form-check form-check-inline">
                                    <input className="form-check-input" type="radio" onChange={showComorbiditiesHandler}
                                           id="no" name="choice" value="no" checked={formData.choice === "no"}/>
                                    <label className="form-check-label" htmlFor="no">No</label>
                                </div>
                            </div>
                            <div hidden={formData.choice === "no"} className="pt-3">
                                <label className="custom-text-label required text-left" htmlFor="yearSelect">
                                    If Yes, please select (all) applicable comorbidities
                                </label>
                                <div className="text-left">
                                    {
                                        conditions.map(x =>
                                            <div className="d-flex mb-1">
                                                <input className="mt-2" type="checkbox"
                                                       checked={formData.comorbidities.includes(x)}
                                                       value={x} id={x} onChange={(e) => {
                                                    selectComorbidity(e.target);
                                                }}/>
                                                <label className="ml-3 mb-0" htmlFor={x}>{x}</label>
                                            </div>)
                                    }
                                    <div className="invalid-input">
                                        {errors.choice}
                                    </div>
                                </div>
                            </div>
                        </div>
                        </div>
                    </div>
                    <div className="pb-3">
                        <CustomButton className="primary-btn w-100" type="submit" onClick={onContinue}>
                            <span>Continue</span>
                        </CustomButton>
                    </div>
                </div>
            </BaseFormCard>
        </div>
    );
};
