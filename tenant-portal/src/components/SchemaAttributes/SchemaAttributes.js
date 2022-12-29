import React,{useState} from "react";
import 'react-bootstrap';
import {  Stack, Row, Table, Container,Button, Col  } from "react-bootstrap";
import styles from "./SchemaAttributes.module.css";
import GenericButton from "../GenericButton/GenericButton";
import {useTranslation} from "react-i18next";
import {transformSchemaToAttributes} from "../../utils/schema.js"
import Attribute  from "../Attribute/Attribute";
import { Link } from "react-router-dom";
import UploadTemplate from "../UploadTemplate/UploadTemplate";
import ToastComponent from "../ToastComponent/ToastComponent";
import successCheckmark from "../../assets/img/success_check_transparent.svg";
import failedAlert from "../../assets/img/alert_check_transparent.svg";
import config from "../../config.json";
import ManageTempModal from "../ManageTempModal/ManageTempModal";

function SchemaAttributes({props, setschemaPreview}){
    const { t } = useTranslation();
    const [show, setShow] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [templateUploaded, setTemplateUploaded] = useState(false);
    const [toast,setToast] = useState(""); 
    const osid = props.osid;
    const Attributes = transformSchemaToAttributes(JSON.parse(props.schema));

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
    return (
        <div>
            <Container>
                <Stack gap={3}>
                    <Row className="justify-content-end" sm= {4}>
                        <Col>
                            <Button variant="primary" onClick={() => setShow(true)} className="w-25">
                                {t('schemaAttributesPage.uploadTemplate')}
                            </Button>
                            <UploadTemplate {...{show, setShow, osid, setTemplateUploaded,showToast}}/>
                        </Col>
                        <Col className={Object.keys(JSON.parse(props.schema)._osConfig.certificateTemplates).length===0? 'd-none': '' } >
                            <div onClick={()=>{setShowModal(true);}}>
                            <GenericButton text={t('schemaAttributesPage.manageTemplate')} variant="outline-primary" /></div>
                            {showModal && <ManageTempModal setShowModal={setShowModal} schemaBody={props}/>}
                        </Col>
                        
                    </Row>
                    <Row className="title">{props.name}</Row>
                    <Row>{props.description}</Row>
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
                { props.status === "DRAFT" && 
                    <Row gutter='3' xs={1} sm={2} md={4} className="justify-content-end" >
                    <Link to={`${config.urlPath}/manage-schema`} reloadDocument={true}>
                        <GenericButton img={''} text='Save as Draft' type='button' form="schema-attributes" variant='outline-primary' />
                     </Link>
                     <Col onClick={()=> setschemaPreview(true)}>
                        <GenericButton img={''} text='Test & Publish' type='button' form="schema-attributes" variant='primary' />
                    </Col>
                    </Row>  
                }
        </div>
    ); 
}
export default SchemaAttributes;