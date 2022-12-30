import uploadTheme from "../../assets/img/upload-theme.png"
import uploadIcon from "../../assets/img/upload-icon.svg"
import {useTranslation} from "react-i18next";
import GenericButton from "../GenericButton/GenericButton";
import styles from './JsonUpload.module.css';
import {useState} from "react";
import axios from "axios";
import config from "../../config.json";
import {getToken} from '../../utils/keycloak';
import {Link, useNavigate} from "react-router-dom";
import {Col, Container} from "react-bootstrap";
import ActionInfoComponent from "../ActionInfoComponent/ActionInfoComponent";
import SchemaAttributes from "../SchemaAttributes/SchemaAttributes";
import TestAndPublish from "../TestAndPublish/TestAndPublish";
import ToastComponent from "../ToastComponent/ToastComponent";
import {ATTRIBUTE_MODIFY_ACTIONS, SCHEMA_STATUS} from "../../constants";
import AddSchemaFieldComponent from "../AddSchemaFieldComponent/AddSchemaFieldComponent";
import {transformSchemaToAttributes} from "../../utils/schema";
function JsonUpload() {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [schemaPreview, setschemaPreview] = useState(false);
    const [fileUploaded, setFileUploaded] = useState(false);
    const [file, setFile] = useState(null);
    const [schema, setSchema] = useState(null);
    const [schemaUploaded, setSchemaUploaded] = useState(false);
    const [schemaCreated, setSchemaCreated] = useState(false);
    const [viewSchema, setViewSchema] = useState(false);
    const [uploadedSchema, setUploadedSchema] = useState(null);
    const [toast, setToast] = useState("");
    const [createAttribute, setCreateAttribute] = useState(false);
    const [attributes, setAttributes] = useState([]);
    const handleFileUpload = (e) => {
        e.preventDefault();
        const reader = new FileReader();
        if (e.target.files.length > 0) {
            setFileUploaded(true);
            setFile(e.target.files[0])
        } else {
            setFileUploaded(false);
            setFile(null);
        }
        reader.onload = async (e) => {
            const schema = e.target.result;
            setSchema(schema);
        };
        reader.readAsText(e.target.files[0]);
    }
    const uploadSchema = async (saveAsDraft) => {
        if (!schema || file.type.replace(/(.*)\//g, '') !== "json") {
            showToastFunc("Upload a valid JSON schema file", "danger");
            return
        }
        let schemaName = "";
        try {
            schemaName = JSON.parse(schema)?.title;
        } catch (err) {
            showToastFunc("Invalid JSON uploaded for schema", "danger");
        }

        const addSchemaPayload = {
            "name": schemaName,
            "schema": schema,
            "status": SCHEMA_STATUS.DRAFT
        }
        const userToken = await getToken();
        axios.post(`${config.schemaUrl}`, addSchemaPayload, {headers:{"Authorization" :`Bearer ${userToken}`}})
            .then((res) => {
                setSchemaUploaded(true);
                if (res?.data) {
                    if (saveAsDraft) {
                        showToastFunc("Successfully saved as draft", "success");
                        navigate("/manage-schema");
                    } else {
                        setSchemaCreated(true);
                        const schemaAttributes = transformSchemaToAttributes(JSON.parse(addSchemaPayload["schema"]));
                        setAttributes([...schemaAttributes]);
                        setUploadedSchema({
                            "osid": res.data.schemaAddResponse?.result?.Schema?.osid,
                            ...addSchemaPayload
                        });
                    }
                }
            }).catch((error) => {
                setSchemaUploaded(true);
                setSchemaCreated(false);
                console.error(error);
            });
    }
    const handleNextAction = (action) => {
        if (action==="view") {
            setViewSchema(true);
        } else if (action === "goBack") {
            navigate(0);
        }
    }
    const showToastFunc = (toastMessage, variant) => {
        setToast (<ToastComponent header={toastMessage}
                                  variant={variant} delay='2000' position="top-center" className="copy-toast" />);
        setTimeout(() => {
            setToast("");
        }, 2000);
    }
    const addNewAttributeToSchema = (attr) => {
        console.log(attr);
        setAttributes([attr, ...attributes]);
        setCreateAttribute(false);
    }
    const createNewFieldInSchema = () => {
        setCreateAttribute(true);
    }
    const updateSchema = (schema) => {
        setUploadedSchema(schema);
        const updatedAttributes = transformSchemaToAttributes(JSON.parse(schema?.schema));
        setAttributes([...updatedAttributes]);
    }
    const modifyAttribute = (index, action, newDetails) => {
        switch (action) {
            case ATTRIBUTE_MODIFY_ACTIONS.DELETE:
                setAttributes([...attributes.slice(index, 1)]);
                break;
            case ATTRIBUTE_MODIFY_ACTIONS.EDIT:
                attributes[index].editMode = true;
                setAttributes([...attributes]);
                break;
            case ATTRIBUTE_MODIFY_ACTIONS.UPDATE:
                for (const [key, value] of Object.entries(newDetails)) {
                    attributes[index][key]=value;
                }
                attributes[index].editMode = false;
                setAttributes([...attributes]);
                break;
            case ATTRIBUTE_MODIFY_ACTIONS.CANCEL:
                attributes[index].editMode = false;
                setAttributes([...attributes]);
                break;
            default:
                console.log("Invalid action");
        }
    }
    return (
        <div>
            {(!schemaUploaded && !schemaPreview && !createAttribute &&
            <Container className="d-flex justify-content-between align-items-center flex-column flex-md-row my-3 offset-1 offset-md-2 col-10 col-md-9">
                <Col className={`col-12 col-md-7 me-md-3 ${styles['upload-container']}`}>
                    <p className="title">{t('jsonSchemaUpload.title')}</p>
                    <div className="border rounded-2 p-3 text-center mb-3 position-relative">
                        <div className="d-flex align-items-stretch h-100">
                            <input type="file" accept=".json" className="w-100 position-absolute top-0 start-0 h-100 opacity-0" onChange={handleFileUpload}/>
                        </div>
                        {
                            fileUploaded && <div className="d-flex justify-content-center align-items-center">
                                <img src={uploadIcon} alt="upload icon" className="me-3"/>
                                <span>{file.name}</span>
                            </div>
                        }
                        {!fileUploaded && <div>
                            <img src={uploadIcon} alt="upload icon" className="mb-3"/>
                            <p className={styles['upload-help-text']}>{t('jsonSchemaUpload.uploadComment1')}</p>
                            <p className={styles['upload-help-text']}>{t('jsonSchemaUpload.or')}</p>
                            <p className={styles['upload-instruction']}>{t('jsonSchemaUpload.uploadComment2')}</p>
                        </div>}
                    </div>
                    <div className="d-flex justify-content-between align-items-center flex-column flex-md-row">
                        <div className='container-fluid my-3 px-0'>
                            <div className='px-0 mx-0 d-flex flex-wrap'>
                                <Link onClick={() => {uploadSchema(true)}} to='' className='col-12 col-lg-6 my-2 pe-0 pe-lg-2'>
                                    <GenericButton img='' text={t('jsonSchemaUpload.draftButtonText')} type='button' variant='outline-primary'/>
                                </Link>
                                <Link onClick={() => {uploadSchema(false)}} to='' className='col-12 col-lg-6 my-2 ps-0 ps-lg-2'>
                                    <GenericButton img='' text={t('jsonSchemaUpload.saveButtonText')} type='button' variant='primary'/>
                                </Link>
                            </div>
                        </div>
                    </div>
                </Col>
                <Col className="col-12 col-md-5 text-center">
                    <img src={uploadTheme} className="mw-100" alt="upload theme img"/>
                </Col>
            </Container>) || (
            schemaUploaded && !viewSchema && !schemaPreview && !createAttribute &&
            <ActionInfoComponent
                isActionSuccessful={schemaCreated}
                actionHeaderMessage={schemaCreated ? t('jsonSchemaUpload.successfulUploadMessageTitle') : t('jsonSchemaUpload.errorUploadMessageTitle')}
                actionBodyMessage={schemaCreated ? t('jsonSchemaUpload.successfulUploadMessageBody') : t('jsonSchemaUpload.errorUploadMessageBody')}
                primaryButtonText={schemaCreated ? t('jsonSchemaUpload.view') : t('jsonSchemaUpload.goBack')}
                primaryActionKey={schemaCreated ? 'view' : 'goBack'}
                nextActionHandler={handleNextAction}>
            </ActionInfoComponent>) || (
            schemaUploaded && viewSchema && !schemaPreview && !createAttribute &&
            <SchemaAttributes
                schemaDetails={uploadedSchema}
                setschemaPreview={setschemaPreview}
                setUpdatedSchema={updateSchema}
                attributes={attributes}
                modifyAttribute={modifyAttribute}
                createNewFieldInSchema={createNewFieldInSchema}>
            </SchemaAttributes>) || (
            schemaPreview &&  !createAttribute &&
            <div>
                <TestAndPublish schema={uploadedSchema}/>
            </div>) || (
                createAttribute &&
                <div>
                    <AddSchemaFieldComponent addNewAttributeToSchema={addNewAttributeToSchema}></AddSchemaFieldComponent>
                </div>
            )}
            {
                toast
            }
        </div>
    )
}

export default JsonUpload;