import React, {useEffect, useState} from "react";
import {Redirect} from "react-router";
import {BaseFormCard} from "../BaseFormCard";
import "./index.scss"
import {Button} from "react-bootstrap";
import {
    FORM_WALK_IN_ELIGIBILITY_CRITERIA, FORM_WALK_IN_ENROLL_CONFIRMATION,
    FORM_WALK_IN_ENROLL_FORM,
    FORM_WALK_IN_ENROLL_PAYMENTS,
    FORM_WALK_IN_VERIFY_FORM,
    FORM_WALK_IN_VERIFY_MOBILE,
    FORM_WALK_IN_VERIFY_OTP,
    initialWalkInEnrollmentState,
    useWalkInEnrollment,
    WALK_IN_ROUTE,
    WalkInEnrollmentProvider
} from "./context";
import Row from "react-bootstrap/Row";
import PropTypes from 'prop-types';
import schema from '../../jsonSchema/walk_in_form.json';
import Form from "@rjsf/core/lib/components/Form";
import {ImgDirect, ImgGovernment, ImgVoucher} from "../../assets/img/ImageComponents";
import config from "config.json"
import {useSelector} from "react-redux";
import {getMessageComponent, LANGUAGE_KEYS, useLocale} from "../../lang/LocaleContext";
import {SelectComorbidity} from "../SelectComorbidity";
import {VerifyMobile} from "../VerifyMobile";
import {VerifyOTP} from "../VerifyOTP";
import {RegisterBeneficiaryForm} from "../RegisterBeneficiaryForm";
import {WalkInConfirmation} from "../WalkInConfirmation";
import {CustomButton} from "../CustomButton";


export function WalkEnrollmentFlow(props) {
    return (
        <WalkInEnrollmentProvider>
            <WalkInEnrollmentRouteCheck pageName={props.match.params.pageName}/>
        </WalkInEnrollmentProvider>
    );
}

function WalkInEnrollmentRouteCheck({pageName}) {
    const {state, goNext} = useWalkInEnrollment();
    if (pageName === state.nextForm) {
        switch (pageName) {
            case FORM_WALK_IN_ELIGIBILITY_CRITERIA :
                return <SelectComorbidity/>;
            case FORM_WALK_IN_VERIFY_MOBILE:
                return <VerifyMobile/>;
            case FORM_WALK_IN_VERIFY_OTP:
                return <VerifyOTP/>;
            case FORM_WALK_IN_ENROLL_FORM:
                const onFormContinue = (formData) => {
                    goNext(FORM_WALK_IN_ENROLL_FORM, FORM_WALK_IN_VERIFY_FORM, formData)
                };
                return <RegisterBeneficiaryForm state={state} onContinue={onFormContinue} />;
            case FORM_WALK_IN_VERIFY_FORM:
                const onContinue = (formData) => {
                        goNext(FORM_WALK_IN_VERIFY_FORM, FORM_WALK_IN_ENROLL_PAYMENTS, formData)
                };
                const onBack = (formData) => {goNext(FORM_WALK_IN_VERIFY_FORM, FORM_WALK_IN_ENROLL_FORM, formData)};
                return <RegisterBeneficiaryForm verifyDetails={true} state={state} onBack={onBack} onContinue={onContinue}/>;
            case FORM_WALK_IN_ENROLL_PAYMENTS : {
                if (state.name) {
                    return <WalkEnrollmentPayment/>
                }
                break;
            }
            case FORM_WALK_IN_ENROLL_CONFIRMATION:
                return <WalkInConfirmation/>
            default:
        }
    }
    goNext(state.currentForm, FORM_WALK_IN_ELIGIBILITY_CRITERIA, initialWalkInEnrollmentState)
    return <Redirect
        to={{
            pathname: config.urlPath + '/' + WALK_IN_ROUTE + '/' + FORM_WALK_IN_ENROLL_FORM
        }}
    />
}


function WalkEnrollmentForm(props) {
    const {state, goNext} = useWalkInEnrollment();
    const stateAndDistricts = useSelector(state => state.flagr.appConfig.stateAndDistricts);
    const {getText, selectLanguage} = useLocale()
    const countryCode = useSelector(state => state.flagr.appConfig.countryCode);
    const [enrollmentSchema, setEnrollmentSchema] = useState(schema);
    const [formData, setFormData] = useState(state);
    const [isFormTranslated, setFormTranslated] = useState(false);

    useEffect(() => {
        setStateListInSchema();
        for (let index in enrollmentSchema.required) {
            const property = enrollmentSchema.required[index]
            const labelText = getText("app.enrollment." + property);
            enrollmentSchema.properties[property].title = labelText
        }
        setEnrollmentSchema(enrollmentSchema)
        setFormTranslated(true)

    }, [selectLanguage]);

    const customFormats = {
        'phone-in': /\(?\d{3}\)?[\s-]?\d{3}[\s-]?\d{4}$/
    };

    const uiSchema = {
        classNames: "form-container",
    };

    function setDistrictListInSchema(exisingFromData) {
        let customeSchema = {...enrollmentSchema};
        let districts = stateAndDistricts['states'].filter(s => s.name === exisingFromData.state)[0].districts;
        customeSchema.properties.district.enum = districts.map(d => d.name);
        let customData = {...exisingFromData, district: customeSchema.properties.district.enum[0]}
        setEnrollmentSchema(customeSchema)
        setFormData(customData)
    }

    function setStateListInSchema() {
        let customeSchema = {...enrollmentSchema};
        customeSchema.properties.state.enum = stateAndDistricts['states'].map(obj => obj.name);
        setFormData({...formData, state: customeSchema.properties.state.enum[0]});
        setEnrollmentSchema(customeSchema)
    }

    return (
        <div className="new-enroll-container">
            <BaseFormCard title={getMessageComponent(LANGUAGE_KEYS.ENROLLMENT_TITLE)}>
                <div className="pt-3 form-wrapper">
                    <Form
                        key={isFormTranslated}
                        schema={enrollmentSchema}
                        customFormats={customFormats}
                        uiSchema={uiSchema}
                        formData={formData}
                        onChange={(e) => {
                            if (e.formData.state !== formData.state) {
                                setDistrictListInSchema((e.formData))
                            }
                        }}
                        onSubmit={(e) => {
                            goNext(FORM_WALK_IN_ENROLL_FORM, FORM_WALK_IN_ENROLL_PAYMENTS, e.formData)
                        }}
                    >
                        <Button type={"submit"} variant="outline-primary"
                                className="action-btn">{getMessageComponent(LANGUAGE_KEYS.BUTTON_NEXT)}</Button>
                    </Form>
                </div>

            </BaseFormCard>
        </div>
    );
}

const paymentMode = [
    {
        key: "government",
        name: getMessageComponent(LANGUAGE_KEYS.PAYMENT_GOVT),
        logo: function (selected) {
            return <ImgGovernment selected={selected}/>
        }

    }
    ,
    {
        key: "voucher",
        name: getMessageComponent(LANGUAGE_KEYS.PAYMENT_VOUCHER),
        logo: function (selected) {
            return <ImgVoucher selected={selected}/>
        }

    }
    ,
    {
        key: "direct",
        name: getMessageComponent(LANGUAGE_KEYS.PAYMENT_DIRECT),
        logo: function (selected) {
            return <ImgDirect selected={selected}/>
        }

    }
]

export function WalkEnrollmentPayment(props) {

    const {goNext, saveWalkInEnrollment} = useWalkInEnrollment()

    const onContinue = (selectPaymentMode) => {
        saveWalkInEnrollment(selectPaymentMode.key)
        goNext(FORM_WALK_IN_ENROLL_PAYMENTS, FORM_WALK_IN_ENROLL_CONFIRMATION, {})
    }
    return (
        <div className="new-enroll-container text-center">
            <BaseFormCard title={getMessageComponent(LANGUAGE_KEYS.ENROLLMENT_TITLE)}>
                <PaymentComponent onContinue={onContinue} />
            </BaseFormCard>
        </div>
    );
}

export function PaymentComponent({onContinue}) {
    const [selectPaymentMode, setSelectPaymentMode] = useState()

    return (
        <div className="content">
            <h3>{getMessageComponent(LANGUAGE_KEYS.PAYMENT_TITLE)}</h3>
            <Row className="payment-container">
                {
                    paymentMode.map((item, index) => {
                        return <PaymentItem
                            title={item.name}
                            key={item.key}
                            logo={item.logo}
                            selected={selectPaymentMode && item.name === selectPaymentMode.name}
                            onClick={(value, key) => {
                                setSelectPaymentMode({name: value, key: key})
                            }}/>
                    })
                }
            </Row>
            <CustomButton className="primary-btn w-100 mt-5 mb-5"
                          onClick={() => onContinue(selectPaymentMode)}>{getMessageComponent(LANGUAGE_KEYS.BUTTON_SEND_FOR_VACCINATION)}</CustomButton>
        </div>
    )

}


PaymentItem.propTypes = {
    title: PropTypes.string.isRequired,
    logo: PropTypes.object.isRequired,
    selected: PropTypes.bool,
    onClick: PropTypes.func
};

function PaymentItem(props) {
    return (
        <div onClick={() => {
            if (props.onClick) {
                props.onClick(props.title, props.key)
            }
        }}>
            <div className={`payment-item ${props.selected ? "active" : ""}`}>
                <div className={"logo"}>
                    {props.logo(props.selected)}
                </div>
                <h6 className="title">{props.title}</h6>
            </div>
        </div>
    );
}
