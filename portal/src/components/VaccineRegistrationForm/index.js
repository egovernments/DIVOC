import React, { useEffect, useState } from "react";
import styles from "../VaccineRegistrationForm/VaccineRegistrationForm.module.css";
import regStyles from "../VaccineRegistration/VaccineRegistration.module.css"
import schema from '../../jsonSchema/vaccineSchema.json';
import Button from 'react-bootstrap/Button';
import { Col, Form } from "react-bootstrap";
import {useSelector} from "react-redux";

const IS_REQUIRED = " is required";
const GT_ZERO = " cannot be negative";

function VaccineRegistrationForm({vaccine, onSubmit, onBackClick}) {

    const [formData, setFormData] = useState(transformToFormData(vaccine));
    const [validationErrors, setValidationErrors] = useState();
    const currency = useSelector(state => state.etcd.appConfig.currency);

    function transformToFormData(vaccine) {
        const data = {...vaccine};
        if (vaccine?.doseIntervals) {
            data["doseIntervals"] = vaccine.doseIntervals.map(i => {
                return {
                    min: { count: i?.min, unit: "Days" },
                    max: { count: i?.max, unit: "Days" }
                };
            });
        } else {
            data["doseIntervals"] = [];
        }
        if (vaccine?.effectiveUntil) {
            data["effectiveUntil"] = {count: vaccine.effectiveUntil, unit: "Days"};
        } else {
            data["effectiveUntil"] = {count: undefined, unit: "Days"};
        }
        return data;
    }

    useEffect(() => {
        setFormData(transformToFormData(vaccine));
    }, [vaccine]);

    function validateFormData(data) {
        const errors = {};
        ["name", "provider", "price"].forEach(f => {
            if(!data[f]) {
                errors[f] = IS_REQUIRED;
            }
        });
        if (data["price"] && data["price"] < 0) {
            errors["price"] = GT_ZERO;
        }
        data.doseIntervals.forEach((interval, index) => {
            if(!interval.min.count) {
                errors["doseIntervals_"+index+"_min"] = IS_REQUIRED;
            } else if(interval.min.count < 0) {
                errors["doseIntervals_"+index+"_min"] = GT_ZERO;
            }else if(interval.max.count && interval.max.count < 0) {
                errors["doseIntervals_"+index+"_max"] = GT_ZERO;
            } else if (convertIntervalToDays(interval.max) < convertIntervalToDays(interval.min)) {
                errors["doseIntervals_"+index+"_max"] = " should be > Minimum Interval";
            }
        });
        if (data["effectiveUntil"]["count"] && data["effectiveUntil"]["count"] < 0) {
            errors["effectiveUntil"] = GT_ZERO;
        }
        setValidationErrors(errors);
        return Object.keys(errors).length === 0;
    }

    function handleChange(e) {
        const newData = {...formData};
        newData[e.target.name] = e.target.value;
        newData["price"] = newData["price"] * 1;
        setFormData(newData);
        if (validationErrors) {
            validateFormData(newData);
        }
    }

    function handleDoseChange(e) {
        const [fieldName, index,  intervalType] = e.target.name.split("_");
        const newData = {...formData};
        newData["doseIntervals"][index][intervalType] = e.target.value;
        setFormData(newData);
        if (validationErrors) {
            validateFormData(newData);
        }
    }

    function handleAddDose(e) {
        const newData = {...formData};
        newData["doseIntervals"] = (newData["doseIntervals"] ? newData["doseIntervals"] : [])
        .concat({min: {unit: "Days"}, max: {unit: "Days"}});
        setFormData(newData);
    }

    function handleRemoveDose(idx) {
        const newData = {...formData};
        newData["doseIntervals"].splice(idx, 1);
        setFormData(newData);
    }

    function handleSave() {
        const updatedVaccine = {...formData};
        if (formData.doseIntervals) {
            updatedVaccine.doseIntervals = formData.doseIntervals.map(i => {
                return {
                    min: convertIntervalToDays(i.min),
                    max: convertIntervalToDays(i.max)
                };
            });
        }
        if (formData.effectiveUntil) {
            const days = convertIntervalToDays(updatedVaccine.effectiveUntil);
            updatedVaccine.effectiveUntil = parseInt(days) >= 0  ? days : undefined;
        }
        if (validateFormData(formData)) {
            onSubmit(updatedVaccine);
        }
    }

    function convertIntervalToDays(interval) {
        const {count, unit} = interval;
        switch (unit) {
            case "Months":
                return count * 30;
            case "Years":
                return count * 365;
            case "Lifetime":
                return 73000;
            case "Days":
                return count;
            default:
                return undefined
        }
    }

    return <div className={regStyles["form-container"]}>
        <div className="d-flex">
            <h5 className={"mr-auto"}>{formData?.edited ? formData?.name : "Register New Vaccine"}</h5>
            <Button variant="outline-primary" onClick={onBackClick} style={{"marginBottom": "20px"}}>BACK</Button>
        </div>

        <Form>
            <Form.Row>
            <Col style={{"maxWidth": "37%"}}>
            {!formData?.edited && <Form.Group>
                <Form.Label>
                    {schema.properties.name.title}*
                    {validationErrors?.name && <p className={styles["error-message"]}>{validationErrors.name}</p>}
                </Form.Label>
                <Form.Control type="text" defaultValue={formData?.name} name="name" onChange={handleChange}/>
            </Form.Group>}
            <Form.Group>
                <Form.Label>
                    {schema.properties.provider.title}*
                    {validationErrors?.provider && <p className={styles["error-message"]}>{validationErrors.provider}</p>}
                </Form.Label>
                <Form.Control type="text" defaultValue={formData.provider} name="provider" onChange={handleChange}/>
            </Form.Group>
            <Form.Group>
                <Form.Label>{schema.properties.vaccinationMode.title}</Form.Label>
                <Form.Control as="select" name="vaccinationMode" onChange={handleChange}>
                    {schema.properties.vaccinationMode.enum.map(o => <option key={o} selected={formData.vaccinationMode===o}>{o}</option>)}
                </Form.Control>
            </Form.Group>
            <Form.Group>
                <Form.Label>
                    {schema.properties.price.title} ({currency})*
                    {validationErrors?.price && <p className={styles["error-message"]}>{validationErrors.price}</p>}
                </Form.Label>
                <Form.Control type="number" defaultValue={formData.price} name="price" onChange={handleChange}/>
            </Form.Group>
            </Col>

            <Col className={styles["right-form-col"]} style={{"marginLeft": "20px", "marginTop": "-10px"}}>
            <Form.Label>{schema.properties.doseIntervals.title}</Form.Label>
            <Form.Group>
                <Form.Label>
                    Dose #
                </Form.Label>
                <div className={styles["first-dose-block"]}>
                    <div style={{"padding": "12px"}}>1</div>
                </div>

                {formData.doseIntervals?.length > 0 && formData.doseIntervals.map( (interval, index) => 
                    <div key={index}>
                        <Form.Row>
                            <div className={styles["connecting-line-dynamic"]}></div>
                            <Col>
                                <TimeInterval
                                    style={{"marginRight": "30px", "display": "inline-block"}} 
                                    defaultValue={interval?.min} 
                                    name={"doseIntervals_" + index + "_min"} 
                                    onChange={handleDoseChange}
                                    errormsg={validationErrors && validationErrors["doseIntervals_"+index+"_min"]} 
                                    title={schema.properties.doseIntervals.items.properties.min.title+"*"}/>
                            
                                <TimeInterval
                                    style={{"display": "inline-block"}} 
                                    defaultValue={interval?.max} 
                                    name={"doseIntervals_" + index + "_max"} 
                                    onChange={handleDoseChange} 
                                    errormsg={validationErrors && validationErrors["doseIntervals_"+index+"_max"]} 
                                    title={schema.properties.doseIntervals.items.properties.max.title}/>
                            </Col>
                        </Form.Row>

                        <div className={styles["remove-dose-block"]}>
                            <div style={{"padding": "12px"}}>
                                {index+2}
                            </div>
                        </div>
                        {index+1 === formData.doseIntervals.length && 
                            <div className={styles["remove-dose-icon"]}>
                                <button type="button" className="close" aria-label="Close" style={{"float": "none"}} name={index} onClick={() => handleRemoveDose(index)}>
                                <span aria-hidden="true">&times;</span>
                                </button>
                            </div> 
                        }                       
                    </div>
                )}
                
                <div className={styles["connecting-line-bottom"]}></div>
                <div className={styles["add-dose-block"]}>
                    <div onClick={handleAddDose} className={styles["add-dose-content"]}>+</div>
                </div>
            </Form.Group>
            
            <TimeInterval 
                defaultValue={{"count": vaccine?.effectiveUntil, "unit": "Days"}} 
                name="effectiveUntil" allowLifeTime
                errormsg={validationErrors && validationErrors["effectiveUntil"]}
                onChange={handleChange} title={schema.properties.effectiveUntil.title}/>

            </Col>
            </Form.Row>
            <Button variant="outline-primary" onClick={handleSave}>SAVE</Button>
        </Form>
    </div>
}

function TimeInterval({defaultValue, name, onChange, title, style, allowLifeTime=false, errormsg=""}) {

    const options = allowLifeTime ? ["Days", "Months", "Years", "Lifetime"] : ["Days", "Months", "Years"];
    const [timeInterval, setTimeInterval] = useState(defaultValue);

    function handleChange(e) {
        const newValue = {...timeInterval}
        newValue[e.target.name] = e.target.value;
        if(newValue["count"]) {
            newValue["count"] = parseInt(newValue["count"]);
        }
        if(newValue["unit"] === "Lifetime") {
            newValue["count"] = 1;
        }
        setTimeInterval(newValue);
        onChange({
            "target": {
                "name": name,
                "value": newValue
            }
        });
    }

    return <Form.Group style={style}>
        <Form.Label className={styles["time-interval-label"]}>
            {title}
            <p className={styles["error-message"]}>{errormsg}</p>
        </Form.Label>
        <Form.Control className={styles["time-interval-count"]} type="number" name="count" value={timeInterval.count} onChange={handleChange}/>
        <Form.Control className={styles["time-interval-unit"]} as="select" name="unit" onChange={handleChange}>
            {options.map(o => <option key={o} selected={timeInterval.unit===o}>{o}</option>)}
        </Form.Control>
    </Form.Group>
}


export default VaccineRegistrationForm;