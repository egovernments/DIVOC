import React, {useEffect, useState} from "react";
import {Col, Container, Row} from "react-bootstrap";
import "./index.css";
import {useHistory} from "react-router-dom";
import Form from "@rjsf/core";
import {CustomCheckboxWidget} from "../CustomCheckboxWidget";
import {CustomRangeWidget} from "../CustomRangeWidget";
import {CustomButton} from "../CustomButton";
import {SmallInfoCards} from "../CertificateStatus";
import VerifyCertificateImg from '../../assets/img/verify-certificate-home.svg'
import LearnMoreImg from '../../assets/img/leanr_more_small.png'
import {useKeycloak} from "@react-keycloak/web";
import {RECIPIENT_CLIENT_ID, RECIPIENT_ROLE, SIDE_EFFECTS_DATA} from "../../constants";
import axios from "axios";
import {useTranslation} from "react-i18next";

export const SideEffects = () => {
    const history = useHistory();
    const {keycloak} = useKeycloak();
    const [formSchema, setFormSchema] = useState({schema:{}, uiSchema: {}});
    const {t} = useTranslation();
    useEffect(() => {
        axios
            .get("/divoc/api/v1/sideEffects")
            .then((res) => {
                setFormSchema(res.data);
                return res.data;
            });
    }, []);

    const widgets = {
        CheckboxWidget: CustomCheckboxWidget,
        RangeWidget: CustomRangeWidget
    };
    useEffect(() => {
        if (keycloak.authenticated) {
            if (!keycloak.hasResourceRole(RECIPIENT_ROLE, RECIPIENT_CLIENT_ID)) {
                keycloak.logout();
            }
        }
    }, []);
    const onSideEffectsSubmit = async ({formData}, e) => {
        if (Object.keys(formData).length > 0) {
            localStorage.setItem(SIDE_EFFECTS_DATA, JSON.stringify(formData));
            history.push("/feedback/verify")
        } else {
            alert("No symptoms selected")
        }
    };

    return (
        <div className="main-container">
            <Container fluid>
                <div className="side-effect-container">
                    <h3 className="text-center">{t('sideEffect.title')}</h3>
                    <span className="text-center d-block">{t('sideEffect.subTitle')}</span>
                    <Container className="pt-5">
                        <Row>
                            <Col>
                                <h4 align="">{t('sideEffect.formTitle')}</h4>
                                <h5 align="">{t('sideEffect.formSubTitle')}</h5>
                                <Form schema={formSchema.schema}
                                      uiSchema={formSchema.uiSchema} widgets={widgets} onSubmit={onSideEffectsSubmit}>
                                    <div className="d-flex justify-content-center">
                                        <CustomButton className="green-btn" type="submit" onClick={() => {
                                        }}>
                                            <span>{t('sideEffect.confirmSymptom')}</span>
                                        </CustomButton>
                                    </div>
                                </Form>
                            </Col>
                        </Row>
                    </Container>
                    <SmallInfoCards
                        text={t('sideEffect.infoCard.0.text')}
                        img={VerifyCertificateImg}
                        onClick={() => {
                            history.push("/verify-certificate/")
                        }}
                        backgroundColor={"#F2FAF6"}
                    />
                    <br/>
                    <SmallInfoCards text={t('sideEffect.infoCard.1.text')} img={LearnMoreImg}
                                    onClick={() => {
                                        history.push("/learn/")
                                    }}
                                    backgroundColor={"#EFF5FD"}/>


                </div>
            </Container>
        </div>
    );
};
