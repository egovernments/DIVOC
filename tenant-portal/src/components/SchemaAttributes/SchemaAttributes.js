import React,{useState} from "react";
import 'react-bootstrap';
import {  Stack, Row, Table, Container,Button, Col } from "react-bootstrap";
import styles from "./SchemaAttributes.module.css";
import GenericButton from "../GenericButton/GenericButton";
import {useTranslation} from "react-i18next";
import {
    transformAttributesToContext,
    transformAttributesToSchema,
    transformSchemaToAttributes
} from "../../utils/schema.js"
import Attribute  from "../Attribute/Attribute";
import {Link, useNavigate} from "react-router-dom";
import UploadTemplate from "../UploadTemplate/UploadTemplate";
import ToastComponent from "../ToastComponent/ToastComponent";
import successCheckmark from "../../assets/img/success_check_transparent.svg";
import failedAlert from "../../assets/img/alert_check_transparent.svg";
import config from "../../config.json";
import ManageTempModal from "../ManageTempModal/ManageTempModal";
import {getToken} from '../../utils/keycloak';
import {CONTEXT_BODY, SAMPLE_TEMPLATE_WITH_QR, SCHEMA_BODY, SCHEMA_STATUS, W3C_CONTEXT} from "../../constants";
import axios from "axios";
function SchemaAttributes({props, setschemaPreview, attributes, setUpdatedSchema}){
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [show, setShow] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [templateUploaded, setTemplateUploaded] = useState(false);
    const [toast,setToast] = useState("");
    const osid = props.osid;
    const Attributes = attributes ? attributes : transformSchemaToAttributes(JSON.parse(props.schema));

    const showToast = (status) => {
            switch (status) {
                case "SUCCESS":
                    setToast(<div className="d-flex justify-content-center">
                        <ToastComponent header={<div className="d-flex gap-3"><img src={successCheckmark}/><div>{t('schemaAttributesPage.templateUploadSuccess')}</div></div>}
                            headerClassName={`${styles['toastHeaderSuccess']}  `} toastClass="w-100" toastContainerClass={`${styles['templateToast']} w-50`} />
                        </div>)
                    break;
                case "FAILED":
                    setToast(<div className="d-flex justify-content-center">
                        <ToastComponent header={<div className="d-flex gap-3"><img src={failedAlert}/><div>{t('schemaAttributesPage.templateUploadFailed')}</div></div>}
                            headerClassName={`${styles['toastHeaderFailed']}  `} toastClass="w-100" toastContainerClass={`${styles['templateToast']} w-50`} />
                    </div>)
                    break;
                default: setToast("")
            }
        setTimeout(() => {setToast("")}, 3000);
    };
    const upsertSchema = async (saveAsDraft) => {
        const currentSchema = {
            schemaName: props.name,
            schemaDescription: props.description,
            credentialTemplate: {
                context:[W3C_CONTEXT]
            },
            certificateTemplates: {
                html : SAMPLE_TEMPLATE_WITH_QR
            },
            Attributes: Attributes
        }
        const currentContext = transformAttributesToContext(currentSchema, CONTEXT_BODY);

        const json = JSON.stringify(currentContext);
        const blob = new Blob([json], {
            type: "application/json"
        });
        const data = new FormData();
        data.append("files", blob);
        const userToken = await getToken();
        await (async () => {
            axios.post(`${config.contextUrl}`, data, {
                headers: {Authorization: `Bearer ${userToken}`}
            }).then((response) => {
                const contextUrls = currentSchema["credentialTemplate"]["context"];
                console.log(contextUrls);
                currentSchema["credentialTemplate"]["context"] = [response.data.url, ...contextUrls];
                console.log(currentSchema["credentialTemplate"]["context"]);
              }).catch((error) => console.log(error))
                .then(() => {
                    const updatedSchema = transformAttributesToSchema(currentSchema, SCHEMA_BODY);
                    const draftSchemaPayload = {
                        name: props.name,
                        status: SCHEMA_STATUS.DRAFT,
                        schema: JSON.stringify(updatedSchema)
                    }
                    axios({
                        method: props.osid ? 'PUT' : 'POST',
                        url: `${config.schemaUrl}/${props?.osid ? props.osid?.slice(2) : ''}`,
                        data: draftSchemaPayload,
                        headers: {
                            "Authorization": `Bearer ${userToken}`,
                        },
                    }).then((res) => {
                        console.log(res?.data);
                        setUpdatedSchema({
                            osid: props.osid || res?.data?.schemaAddResponse?.result?.Schema?.osid,
                            ...draftSchemaPayload
                        })
                        if (saveAsDraft) {
                            navigate('/manage-schema');
                            window.location.reload();
                        } else {
                            setschemaPreview(true);
                        }
                    }).catch(error => {
                        console.error(error);
                        throw error;
                    });
                })
        })()
    }

    return (
        <div>
            <Container>
                <Stack gap={3}>
                    <Row className="justify-content-between align-items-center">
                        <Container className="col-6">
                            <Row className="title">{props.name}</Row>
                            <Row>{props.description}</Row>
                        </Container>
                        <Row className="justify-content-end col-6">
                            <Col className={props.schema && (props.status === SCHEMA_STATUS.DRAFT) && Object.keys(JSON.parse(props.schema)._osConfig?.certificateTemplates).length===0? 'd-none': '' } >
                                <div onClick={()=>{setShowModal(true);}}>
                                    <GenericButton text={t('schemaAttributesPage.manageTemplate')} variant="outline-primary" /></div>
                                {showModal && <ManageTempModal setShowModal={setShowModal} schemaBody={props}/>}
                            </Col>
                            <Col>
                                <div onClick={() => setShow(true)}>
                                    <GenericButton text={t('schemaAttributesPage.uploadTemplate')} variant="primary"/>
                                </div>
                                <UploadTemplate {...{show, setShow, osid, setTemplateUploaded,showToast}}/>
                            </Col>
                        </Row>
                    </Row>
                    <Row className="p-3 border overflow-auto d-xxl-inline-block">
                            <Row className="table-heading py-2">{t('schemaAttributesPage.fields')}</Row>
                            <Table className={styles["SchemaAttributesTable"]}>
                                <thead className="table-col-header">
                                    <th>{t('schemaAttributesPage.label')}</th>
                                    <th>{t('schemaAttributesPage.fieldType')}</th>
                                    <th className="text-center">{t('schemaAttributesPage.mandatory')}</th>
                                    <th className="text-center">{t('schemaAttributesPage.indexed')}</th>
                                    <th className="text-center">{t('schemaAttributesPage.unique')}</th>
                                    <th>{t('schemaAttributesPage.description')}</th>
                                </thead>
                                <tbody>
                                {
                                    Attributes.map((attribute) => {
                                        return <Attribute schemaAttribute={attribute}></Attribute>
                                    })
                                }
                                </tbody>
                            </Table>
                    </Row>
                </Stack>
            </Container>
            
                {toast}
            
            <hr className="mt-5 mb-3"/>
                { (props.status === SCHEMA_STATUS.DRAFT || props.status === SCHEMA_STATUS.INPROGRESS) &&
                    <Row gutter='3' xs={1} sm={2} md={4} className="justify-content-end pe-4" >
                    <div onClick={() => {upsertSchema(true)}} >
                        <GenericButton img={''} text='Save as Draft' type='button' form="schema-attributes" variant='outline-primary' />
                     </div>
                     <Col onClick={() => {upsertSchema(false)}}>
                        <GenericButton img={''} text='Test & Publish' type='button' form="schema-attributes" variant='primary' />
                    </Col>
                    </Row>  
                }
        </div>
    ); 
}
export default SchemaAttributes;