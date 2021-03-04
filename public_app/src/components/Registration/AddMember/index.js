import {useForm, useStep} from "react-hooks-helper";
import React, {useEffect, useState} from "react";
import {FormPersonalDetails} from "./FormPersonalDetails";
import axios from "axios";
import {Card, CardGroup, Container} from "react-bootstrap";
import {CustomButton} from "../../CustomButton";
import DefaultProgramLogo from "../../../assets/img/logo-noprogram.svg"
import SelectedLogo from "../../../assets/img/check.svg"
import {Success} from "./Success";
import {CITIZEN_TOKEN_COOKIE_NAME, PROGRAM_API, RECIPIENTS_API} from "../../../constants";
import {getUserNumberFromRecipientToken} from "../../../utils/reciepientAuth";
import {useHistory} from "react-router";
import "./index.css"
import Row from "react-bootstrap/Row";
import {getCookie} from "../../../utils/cookies";
import appConfig from "../../../config.json";


export const FORM_SELECT_PROGRAM = "selectProgram";
export const FORM_SELECT_COMORBIDITY = "selectComorbidity";
export const FORM_USER_DETAILS = "userDetails";
export const CONFIRMATION = "confirmation";
export const SUCCESS = "success";

const steps = [
  {id: FORM_SELECT_PROGRAM},
  {id: FORM_SELECT_COMORBIDITY},
  {id: FORM_USER_DETAILS},
  {id: CONFIRMATION},
  {id: SUCCESS}
];

const defaultData = {
  "choice":"yes",
  "programId": "",
  "nationalId": "",
  "name": "",
  "yob": "",
  "gender": "",
  "district": "",
  "state": "",
  "contact": "",
  "email": "",
  "confirmEmail": "",
  "comorbidities": [],
  "status":null,
  "locality": "",
  "pincode": ""
};

export const AddMembersFlow = () => {
  const history = useHistory();
  const userMobileNumber = getUserNumberFromRecipientToken();
  defaultData["contact"] = userMobileNumber;

  const [formData, setValue] = useForm(defaultData);
  const {step, navigation} = useStep({initialStep: 0, steps});
  const {id} = step;
  const [programs, setPrograms] = useState([]);

  useEffect(() => {
    fetchPrograms()
  }, []);


    useEffect(() => {
        if (!getUserNumberFromRecipientToken()) {
            history.push("/citizen")
        }

        checkIfMemberLimitCrossed()
            .then((isLimitCrossed) => {
                console.log(isLimitCrossed);
                if (isLimitCrossed) {
                    history.push("/registration")
                }
            })
    }, []);


    async function checkIfMemberLimitCrossed() {
        const token = getCookie(CITIZEN_TOKEN_COOKIE_NAME);
        const config = {
            headers: {"Authorization": token, "Content-Type": "application/json"},
        };
        return axios
            .get(RECIPIENTS_API, config)
            .then((res) => {
                return res && res.data && res.data.length >= appConfig.registerMemberLimit;
            })
            .catch(e => {
                console.log(e);
                return false;
            })
    }

    function fetchPrograms() {
        axios.get(PROGRAM_API)
            .then(res => {
                if (res.status === 200) {
                    setPrograms(res.data);
                    setValue({target: {name: "programId", value: res.data[0].osid}})
                }
            })
            .catch(e => {
                console.log(e);
                history.push("/registration")
            })
    }

  let props = {formData, setValue, navigation, programs};

  switch (id) {
    case FORM_SELECT_PROGRAM:
      return <SelectProgram {...props} />;
    case FORM_SELECT_COMORBIDITY:
      return <SelectComorbidity {...props}/>;
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
};

const SelectComorbidity = ({setValue, formData, navigation, programs}) => {
  const MINIMUM_SUPPORT_YEAR = 1920;
  const [errors, setErrors] = useState({});
  const [conditions, setConditions] = useState([])
  const years = [];
  const curYear = new Date().getFullYear();
  const [showCommorbidity, setShowCommorbidity] = useState("yes");

  const [minAge, setMinAge] = useState(50);
  const [maxAge, setMaxAge] = useState(curYear - MINIMUM_SUPPORT_YEAR);

  useEffect(() => {
    const data = {
      "flagKey": "programs",
      "entityContext": {
        "programId": formData.programId
      }
    };
    axios
      .post("/config/api/v1/evaluation", data)
      .then((res) => {
        return res.data;
      })
      .catch((err) => {
        console.log(err)
      })
      .then((result) => {
        if(result["variantAttachment"]) {
          setConditions(result["variantAttachment"].commorbidities || [])
          setMinAge(result["variantAttachment"].minAge)
          setMaxAge(result["variantAttachment"].maxAge)
        } else {
          console.error("program eligibility criteria is not configure");
        }
      })
  }, []);

  for (let i = MINIMUM_SUPPORT_YEAR; i < curYear; i++) {
    years.push("" + i)
  }
  const {previous, next} = navigation;

  function onNext() {
    function isValidAge() {
      return (curYear - formData.yob) >= minAge && (curYear - formData.yob) <= maxAge;
    }

    if(formData.choice === "yes" && formData.comorbidities.length === 0) {
      setErrors({...errors, "choice":"* Please select at least one comorbidity"});
    }
    else if (formData.yob && formData.yob > 1900 && formData.choice === "yes" &&
      (isValidAge() || formData.comorbidities.length>0)) {
      next()
    } else if(formData.yob && formData.yob > 1900 && formData.choice === "no" && isValidAge()) {
      next()
    }
    else if (formData.yob && (curYear - formData.yob) < minAge) {
      setErrors({...errors, "yob":"Without any below mentioned conditions, minimum age for eligibility is " + minAge});
    }
    else if (formData.yob && (curYear - formData.yob) > maxAge) {
      setErrors({...errors, "yob":"Without any below mentioned conditions, maximum age for eligibility is " + maxAge});
    }
    else {
      // errors.yob = "Please select year of birth";
      setErrors({...errors, "yob":"Please select year of birth"});
    }
  }

  function onYOBChange(year) {
    setValue({target: {name: "yob", value: year}})
  }

  function selectComorbidity(x) {
    let updatedList = formData.comorbidities;
    if (!x.checked && updatedList.includes(x.value)) {
      const index = updatedList.indexOf(x.value);
      if (index > -1) {
        updatedList.splice(index, 1);
      }
    } else {
      updatedList.push(x.value)
    }
    setValue({target: {name: "comorbidities", value: updatedList}})
  }

  function showComorbiditiesHandler(event) {
    setShowCommorbidity(event.target.value)
    setValue({target: {name: "choice", value: event.target.value}})
    if (event.target.value === "no") {
      setValue({target: {name: "comorbidities", value: []}})
    }
  }

  return (
    <Container fluid>
      <div className="select-program-container">
        <div className="d-flex justify-content-between align-items-center">
          <h3>Check beneficiary's eligibility for the program</h3>
        </div>
        <div className="shadow-sm bg-white p-4">
          <div className="p-2">
            <h5>Enter beneficiary's year of birth</h5>
          </div>
          <div className={"col-sm-4"}>
            <label className="custom-text-label required" for="yearSelect">Year of birth</label>
            <select className="form-control form-control-inline" id="yearSelect" placeholder="Select"
                    onChange={(t) => onYOBChange(t.target && t.target.value)}>
              <option>Select</option>
              {
                years.map(x => <option selected={formData.yob === x} value={x}>{x}</option>)
              }
            </select>
            <div className="invalid-input">
              {errors.yob}
            </div>
          </div>
          <div className="pt-5">
              <p style={{fontSize:"1.1rem"}}>Does the beneficiary have any of the following comorbidities?</p>
              <div className="pl-2 form-check form-check-inline">
                <input className="form-check-input" type="radio" onChange={showComorbiditiesHandler}
                       id="yes" name="choice" value="yes" defaultChecked checked={formData.choice === "yes"}/>
                <label className="form-check-label" htmlFor="yes">Yes</label>
              </div>
              <div className="pl-2 form-check form-check-inline">
                <input className="form-check-input" type="radio"  onChange={showComorbiditiesHandler}
                       id="no" name="choice" value="no" checked={formData.choice === "no"}/>
                <label className="form-check-label" htmlFor="no">No</label>
              </div>
            <div hidden={formData.choice === "no"} className="pt-3">
              <p>If Yes, Please select comorbidity</p>
              <Row className={"col-6 ml-0"}>
                {
                  conditions.map(x =>
                    <div className="col-md-6">
                      <input className="form-check-input" type="checkbox" checked={formData.comorbidities.includes(x)}
                             value={x} id={x} onChange={(e) => {
                        selectComorbidity(e.target);
                      }}/>
                      <label className="form-check-label" htmlFor={x}>{x}</label>
                    </div>)
                }
                <div className="invalid-input">
                  {errors.choice}
                </div>
              </Row>
            </div>
          </div>
        </div>
        <div className="pt-3">
          <CustomButton isLink={true} type="submit" onClick={previous}>
            <span>Back</span>
          </CustomButton>
          <CustomButton className="blue-btn" type="submit" onClick={() => onNext()}>
            <span>Continue &#8594;</span>
          </CustomButton>
        </div>
      </div>
    </Container>
  );
};

const SelectProgram = ({setValue, formData, navigation, programs}) => {
  const history = useHistory();
  const {next} = navigation;

  function onProgramSelect(osid) {
    setValue({target: {name: "programId", value: osid}})
    // Reinitialize the selected comorbidities if the user changed the program
    setValue({target: {name: "comorbidities", value: []}})
  }

  return (
    <Container fluid>
      <div className="select-program-container">
        <div className="d-flex justify-content-between align-items-center">
          <h3>Please select vaccination program</h3>
        </div>
        <CardGroup className="mt-5">
          {
            programs.map(p =>
              <div className="p-2">
                <a key={p.osid} style={{cursor: 'pointer'}} onClick={() => onProgramSelect(p.osid)}>
                  <Card border={p.osid === formData.programId ? "success" : "light"} style={{width: '15rem'}}
                        className="text-center h-100">
                    {p.osid === formData.programId && <img src={SelectedLogo} className="selected-program-img"/>}
                    <Card.Img variant="top" src={p.logoURL ? p.logoURL : DefaultProgramLogo} className="p-4"
                              style={{maxHeight: '9rem', height: '9rem'}}/>
                    <Card.Body>
                      <Card.Title>{p.name}</Card.Title>
                    </Card.Body>
                  </Card>
                </a>
              </div>
            )
          }
        </CardGroup>
        <CustomButton isLink={true} type="submit" onClick={() => {history.goBack()}}>
          <span>Back</span>
        </CustomButton>
        <CustomButton className="blue-btn" type="submit" onClick={next}>
          <span>Continue &#8594;</span>
        </CustomButton>
      </div>
    </Container>
  )
}
