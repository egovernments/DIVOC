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
function JsonUpload() {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [fileUploaded, setFileUploaded] = useState(false);
    const [file, setFile] = useState(null);
    const [schema, setSchema] = useState(null);
    const [schemaUploaded, setSchemaUploaded] = useState(false);
    const [schemaCreated, setSchemaCreated] = useState(false);
    const [viewSchema, setViewSchema] = useState(false);
    const [uploadedSchema, setUploadedSchema] = useState(null);
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
    const uploadSchema = async () => {
        if (!schema) {
            return
        }
        const schemaName = JSON.parse(schema)?.title;
        const addSchemaPayload = {
            "name": schemaName,
            "schema": schema,
            "status": "DRAFT"
        }
        const userToken = await getToken();
        axios.post(`${config.schemaUrl}`, addSchemaPayload, {headers:{"Authorization" :`Bearer ${userToken}`}})
            .then((res) => {
                setSchemaUploaded(true);
                if (res?.data) {
                    setSchemaCreated(true);
                    setUploadedSchema({
                        "osid": res.data.schemaAddResponse?.result?.Schema?.osid.substring(2),
                        ...addSchemaPayload
                    });
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
            navigate('/manage-schema');
        }
    }
    return (
        (!schemaUploaded &&
            <Container className="d-flex justify-content-between align-items-center flex-column flex-md-row my-3 offset-1 offset-md-2 col-10 col-md-9">
                <Col className={`col-12 col-md-7 me-md-3 ${styles['upload-container']}`}>
                    <p className="title">{t('jsonSchemaUpload.title')}</p>
                    <div className="border rounded-2 p-3 text-center mb-3 position-relative">
                        <div className="d-flex align-items-stretch h-100">
                            <input type="file" className="w-100 position-absolute top-0 start-0 h-100 opacity-0" onChange={handleFileUpload}/>
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
                                <Link onClick={uploadSchema} to='' className='col-12 col-lg-6 my-2 pe-0 pe-lg-2'>
                                    <GenericButton img='' text={t('jsonSchemaUpload.draftButtonText')} type='button' variant='secondary'/>
                                </Link>
                                <Link onClick={uploadSchema} to='' className='col-12 col-lg-6 my-2 ps-0 ps-lg-2'>
                                    <GenericButton img='' text={t('jsonSchemaUpload.saveButtonText')} type='button' variant='primary'/>
                                </Link>
                            </div>
                        </div>
                    </div>
                </Col>
                <Col className="col-12 col-md-5 text-center">
                    <img src={uploadTheme} className="mw-100" alt="upload theme img"/>
                </Col>
            </Container>
        ) || (
            schemaUploaded && !viewSchema &&
            <ActionInfoComponent
                isActionSuccessful={schemaCreated}
                actionHeaderMessage={schemaCreated ? t('jsonSchemaUpload.successfulUploadMessageTitle') : t('jsonSchemaUpload.errorUploadMessageTitle')}
                actionBodyMessage={schemaCreated ? t('jsonSchemaUpload.successfulUploadMessageBody') : t('jsonSchemaUpload.errorUploadMessageBody')}
                primaryButtonText={schemaCreated ? t('jsonSchemaUpload.view') : t('jsonSchemaUpload.goBack')}
                primaryActionKey={schemaCreated ? 'view' : 'goBack'}
                nextActionHandler={handleNextAction}>
            </ActionInfoComponent>
        ) || (
            schemaUploaded && viewSchema &&
            <SchemaAttributes props={uploadedSchema}></SchemaAttributes>
        )
    )
}

export default JsonUpload;