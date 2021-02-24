import React, {useEffect, useState} from "react";
import {Redirect} from "react-router";
import {BaseFormCard} from "../BaseFormCard";
import "./index.scss"
import {Button} from "react-bootstrap";
import {useWalkInEnrollment, WALK_IN_ROUTE, WalkInEnrollmentProvider} from "./context";
import Row from "react-bootstrap/Row";
import PropTypes from 'prop-types';
import schema from '../../jsonSchema/walk_in_form.json';
import Form from "@rjsf/core/lib/components/Form";
import {ImgDirect, ImgGovernment, ImgVoucher} from "../../assets/img/ImageComponents";
import config from "config.json"
import {useSelector} from "react-redux";
import {useLocale} from "../../lang/LocaleContext";

export const FORM_WALK_IN_ENROLL_FORM = "form";
export const FORM_WALK_IN_ENROLL_PAYMENTS = "payments";

export function WalkEnrollmentFlow(props) {
    return (
        <WalkInEnrollmentProvider>
            <WalkInEnrollmentRouteCheck pageName={props.match.params.pageName}/>
        </WalkInEnrollmentProvider>
    );
}

function WalkInEnrollmentRouteCheck({pageName}) {
    const {state} = useWalkInEnrollment();
    switch (pageName) {
        case FORM_WALK_IN_ENROLL_FORM :
            return <WalkEnrollment/>;
        case FORM_WALK_IN_ENROLL_PAYMENTS : {
            if (state.name) {
                return <WalkEnrollmentPayment/>
            }
            break;
        }
        default:
    }
    return <Redirect
        to={{
            pathname: config.urlPath + '/' + WALK_IN_ROUTE + '/' + FORM_WALK_IN_ENROLL_FORM
        }}
    />
}


function WalkEnrollment(props) {
    const {state, goNext} = useWalkInEnrollment();
    const {getText, selectLanguage} = useLocale()
    const countryCode = useSelector(state => state.flagr.appConfig.countryCode);
    const stateAndDistricts = useSelector(state => state.flagr.appConfig.stateAndDistricts);
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
        console.log(enrollmentSchema)
        setEnrollmentSchema(enrollmentSchema)
        setFormTranslated(true)

    }, [selectLanguage]);

    const customFormats = {
        'phone-in': /\(?\d{3}\)?[\s-]?\d{3}[\s-]?\d{4}$/
    };

    const uiSchema = {
        classNames: "form-container",
        phone: {
            "ui:placeholder": countryCode
        },
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
            <BaseFormCard title={"Enroll Recipient"}>
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
                        <Button type={"submit"} variant="outline-primary" className="action-btn">Done</Button>
                    </Form>
                </div>

            </BaseFormCard>
        </div>
    );
}

const paymentMode = [
    {
        name: "Government",
        logo: function (selected) {
            return <ImgGovernment selected={selected}/>
        }

    }
    ,
    {
        name: "Voucher",
        logo: function (selected) {
            return <ImgVoucher selected={selected}/>
        }

    }
    ,
    {
        name: "Direct",
        logo: function (selected) {
            return <ImgDirect selected={selected}/>
        }

    }
]

function WalkEnrollmentPayment(props) {

    const {goNext, saveWalkInEnrollment} = useWalkInEnrollment()
    const [selectPaymentMode, setSelectPaymentMode] = useState()
    return (
        <div className="new-enroll-container">
            <BaseFormCard title={"Enroll Recipient"}>
                <div className="content">
                    <h3>Please select mode of payment</h3>
                    <Row className="payment-container">
                        {
                            paymentMode.map((item, index) => {
                                return <PaymentItem
                                    title={item.name}
                                    logo={item.logo}
                                    selected={item.name === selectPaymentMode}
                                    onClick={(value) => {
                                        setSelectPaymentMode(value)
                                    }}/>
                            })
                        }
                    </Row>
                    <Button variant="outline-primary"
                            className="action-btn"
                            onClick={() => {
                                saveWalkInEnrollment(selectPaymentMode)
                                    .then(() => {
                                        goNext(FORM_WALK_IN_ENROLL_PAYMENTS, "/", {})
                                    })
                            }}>Send for vaccination</Button>
                </div>
            </BaseFormCard>
        </div>
    );
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
                props.onClick(props.title)
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
