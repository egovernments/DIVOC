import {useForm, useStep} from "react-hooks-helper";
import React, {useEffect, useState} from "react";
import {FormPersonalDetails} from "./FormPersonalDetails";
import axios from "axios";
import {Card, CardGroup, Container, Modal} from "react-bootstrap";
import {CustomButton} from "../../CustomButton";
import DefaultProgramLogo from "../../../assets/img/logo-noprogram.svg"
import SelectedLogo from "../../../assets/img/check.svg"
import {Success} from "./Success";
import {
    CITIZEN_TOKEN_COOKIE_NAME,
    CONFIG_API,
    CONFIG_KEY,
    PROGRAM_API, PROGRAM_COMORBIDITIES_KEY,
    RECIPIENTS_API
} from "../../../constants";
import {getUserNumberFromRecipientToken} from "../../../utils/reciepientAuth";
import {useHistory} from "react-router";
import "./index.css"
import Row from "react-bootstrap/Row";
import {getCookie} from "../../../utils/cookies";
import appConfig from "../../../config.js";
import {useTranslation} from "react-i18next";


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
  "programName": "",
  "nationalId": "",
  "identity": "",
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
    const [members, setMembers] = useState([]);
    const [isValidationLoading, setValidationLoading] = useState(true);

    useEffect(() => {
      if (!getUserNumberFromRecipientToken()) {
        history.push("/citizen")
      }
      fetchPrograms();
      fetchMembers();
    }, []);

    function fetchPrograms() {
        axios.get(PROGRAM_API)
            .then(res => {
                if (res.status === 200) {
                    let programs = res.data.filter(p => new Date(p.endDate + " 00:00") - new Date() > 0)
                    setPrograms(programs);
                    setValue({target: {name: "programId", value: programs[0].osid}})
                    setValue({target: {name: "programName", value: programs[0].name}})
                }
            })
            .catch(e => {
                console.log(e);
                history.push("/registration")
            })
    }

    function fetchMembers() {
        const token = getCookie(CITIZEN_TOKEN_COOKIE_NAME);
        const config = {
            headers: {"Authorization": token, "Content-Type": "application/json"},
        };
        axios
          .get(RECIPIENTS_API, config)
          .then((res) => {
              setMembers(res.data);
              if (res && res.data && res.data.length >= appConfig.registerMemberLimit) {
                history.push("/registration");
              }
              setValidationLoading(false);
            })
          .catch(e => {
              console.log(e);
          })
    }

    if (isValidationLoading) {
        return <div>Loading...</div>
    }

  let props = {formData, setValue, navigation, programs, members};

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

export const SelectComorbidity = ({setValue, formData, navigation, programs, hideYOB=false}) => {
  const MINIMUM_SUPPORT_AGE = 120;
  const [errors, setErrors] = useState({});
  const [conditions, setConditions] = useState([])
  const years = [];
  const curYear = new Date().getFullYear();
  const [showCommorbidity, setShowCommorbidity] = useState("yes");
  const [invalidCondition, setInvalidCondition] = useState(false)
  const history = useHistory()

  const [minAge, setMinAge] = useState(0);
  const [maxAge, setMaxAge] = useState(MINIMUM_SUPPORT_AGE);
  const {t} = useTranslation();

  useEffect(() => {
      let apiUrl = CONFIG_API.replace(CONFIG_KEY, PROGRAM_COMORBIDITIES_KEY)
      const token = getCookie(CITIZEN_TOKEN_COOKIE_NAME);
      const config = {
          headers: {"Authorization": token, "Content-Type": "application/json"},
      };
      axios
          .get(apiUrl, config)
          .catch((err) => {
              console.log(err)
          })
          .then((result) => {
              setConditions(result.data.Comorbidities || [])
              setMinAge(result.data.MinAge || 0)
              setMaxAge(result.data.MaxAge || MINIMUM_SUPPORT_AGE)
          })
  }, []);

  for (let i = curYear - maxAge; i < curYear; i++) {
    years.push("" + i)
  }
  const {previous, next} = navigation;

  function onNext() {
    function isValidAge() {
      return (curYear - formData.yob) >= minAge && (curYear - formData.yob) <= maxAge;
    }

    function hasConditions() {
      return conditions && conditions.length> 0
    }

    if(hasConditions() && formData.choice === "yes" && formData.comorbidities.length === 0) {
      setErrors({...errors, "choice":t('errors.selectComorbidity')});
    }
    else if (formData.yob && formData.yob >= (curYear - maxAge) && formData.choice === "yes" &&
      (isValidAge() || formData.comorbidities.length>0)) {
      next()
    } else if(formData.yob && formData.yob >= (curYear - maxAge) && formData.choice === "no" && isValidAge()) {
      next()
    }
    else if (formData.yob && (curYear - formData.yob) < minAge) {
      setInvalidCondition(true)
    }
    else if (formData.yob && (curYear - formData.yob) > maxAge) {
      setInvalidCondition(true)
    }
    else {
      // errors.yob = "Please select year of birth";
      setErrors({...errors, "yob":t('errors.selectYob')});
    }
  }
  function handleClose() {
      setInvalidCondition(false);
      history.push("/registration");

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
        <Modal show={invalidCondition} centered onHide={handleClose}>
            <Modal.Header>
                <strong className="text-center">{t('errors.invalidBeneficiary',{ program: formData.programName})}</strong>
            </Modal.Header>
            <Modal.Footer>
                <CustomButton onClick = {handleClose} style={{margin: "auto"}} className="blue-btn" >{t('button.ok')}</CustomButton>
            </Modal.Footer>
        </Modal>
      <div className="select-program-container">
        <div className="d-flex justify-content-between align-items-center">
          <h3>{t('registration.checkEligibility.title', { program: formData.programName})}</h3>
        </div>
        <div className="shadow-sm bg-white p-4">
            {!hideYOB &&
            <>
                <div className="p-2">
                    <h5>{t('registration.checkEligibility.yobTitle')}</h5>
                </div>
                <div className={"col-sm-4"}>
                    <label className="custom-text-label required" for="yearSelect">{t('registration.checkEligibility.yob')}</label>
                    <select className="form-control form-control-inline" id="yearSelect" disabled={hideYOB}
                            placeholder="Select"
                            onChange={(t) => onYOBChange(t.target && t.target.value)}>
                        <option>{t('common.select')}</option>
                        {
                            years.map(x => {
                                return <option selected={formData.yob === x} value={x}>{x}</option>
                            })
                        }
                    </select>
                    <div className="invalid-input">
                        {errors.yob}
                    </div>
                </div>
            </>}
          <div className="pt-5 comorbidities-wrapper" hidden={!conditions || conditions.length === 0}>
              <p style={{fontSize:"1.1rem"}}>{t('registration.checkEligibility.comorbiditiesTitle')}</p>
              <div className="pl-2 form-check form-check-inline">
                <input className="form-check-input" type="radio" onChange={showComorbiditiesHandler}
                       id="yes" name="choice" value="yes" checked={formData.choice === "yes"}/>
                <label className="form-check-label" htmlFor="yes">{t('common.yes')}</label>
              </div>
              <div className="pl-2 form-check form-check-inline">
                <input className="form-check-input" type="radio"  onChange={showComorbiditiesHandler}
                       id="no" name="choice" value="no" checked={formData.choice === "no"}/>
                <label className="form-check-label" htmlFor="no">{t('common.no')}</label>
              </div>
            <div hidden={formData.choice === "no"} className="pt-3">
              <p>{t('registration.checkEligibility.comorbiditiesSelectInfo')}</p>
              <div className={"col-12 ml-0 comorbidities-list-wrapper"}>
                {
                  conditions.map(x =>
                    <div>
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
              </div>
            </div>
          </div>
        </div>
        <div className="pt-3">
          <CustomButton isLink={true} type="submit" onClick={previous}>
            <span>{t('button.back')}</span>
          </CustomButton>
          <CustomButton className="blue-btn" type="submit" onClick={() => onNext()}>
            <span>{t('button.continue')} &#8594;</span>
          </CustomButton>
        </div>
      </div>
    </Container>
  );
};

export const SelectProgram = ({setValue, formData, navigation, programs, showBack=true}) => {
  const history = useHistory();
  const {next} = navigation;
  const {t} = useTranslation();

  function onProgramSelect(osid, name) {
    setValue({target: {name: "programId", value: osid}})
    setValue({target: {name: "programName", value: name}})
    // Reinitialize the selected comorbidities if the user changed the program
    setValue({target: {name: "comorbidities", value: []}})
  }

  return (
    <Container fluid>
      <div className="select-program-container">
        <div className="d-flex justify-content-between align-items-center">
          <h3>{t('registration.selectProgram.title')}</h3>
        </div>
        <CardGroup className="mt-5">
          {
            programs.map(p =>
              <ProgramCard program={p} selectedProgramId={formData.programId} onProgramSelect={onProgramSelect}/>
            )
          }
        </CardGroup>
          {showBack && <CustomButton isLink={true} type="submit" onClick={() => {history.goBack()}}>
          <span>{t('login.backButton')}</span>
        </CustomButton>}
          {programs.length>0 && <CustomButton className="blue-btn" type="submit" onClick={next}>
          <span>{t('button.continue')} &#8594;</span>
        </CustomButton>}
      </div>
    </Container>
  )
}

export const ProgramCard = ({program, selectedProgramId, onProgramSelect}) => {
    return (
        <div className="p-2">
            <a key={program.osid} style={{cursor: 'pointer'}} onClick={() => onProgramSelect(program.osid, program.name)}>
                <Card border={program.osid === selectedProgramId ? "success" : "light"} style={{width: '15rem'}}
                      className="text-center h-100">
                    {program.osid === selectedProgramId && <img src={SelectedLogo} className="selected-program-img"/>}
                    <Card.Img variant="top" src={program.logoURL ? program.logoURL : DefaultProgramLogo} className="p-4"
                              style={{maxHeight: '9rem', height: '9rem'}}/>
                    <Card.Body>
                        <Card.Title>{program.name}</Card.Title>
                    </Card.Body>
                </Card>
            </a>
        </div>
    )
}
