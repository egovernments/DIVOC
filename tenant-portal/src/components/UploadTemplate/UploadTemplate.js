import React,{useState} from "react";
import {Button , Modal,Row,Col,Stack,Form,InputGroup, FormControl} from "react-bootstrap";
import styles from './UploadTemplate.module.css';
import {useTranslation} from "react-i18next";
import uploadIcon from "../../assets/img/upload-icon.svg"
import axios from "axios";
import config from "../../config.json";
import {getToken} from '../../utils/keycloak';
import FormData from "form-data";
function UploadTemplate(props){
    const {t} = useTranslation();
    const [fileUploaded, setFileUploaded] = useState(false);
    const [file, setFile] = useState(null);
    const [template, setTemplate] = useState(null);

    const handleFileUpload = (e) => {
        e.preventDefault();
        const reader = new FileReader();
        if (e.target.files.length > 0) {
            setFileUploaded(true);
            setFile(e.target.files[0]);
        } else {
            setFileUploaded(false);
            setFile(null);
        }
        reader.onload = async (e) => {
            const template = e.target.result;
            setTemplate(template);
        };
        reader.readAsArrayBuffer(e.target.files[0]);
    }
    

    const saveTemplate = async () => {
        if(!template){
            props.showToast("FAILED");
            props.setShow(false);
            return;
        }
        const data = new FormData();
        data.append("files", file);
        const userToken = await getToken();
        const key = document.getElementById("key").value;
        const schemaId = props.osid;
        axios.put(`${config.schemaUrl}/${schemaId}/updateTemplate?templateKey=${key}`, data, {headers:{"Authorization" :`Bearer ${userToken}`,"Content-Type": "multipart/form-data"}})
            .then((res) => {
                if (res?.data?.templateUpdateResponse) {
                    props.setTemplateUploaded(true);
                    props.showToast("SUCCESS");
                    console.log("Upload template response: ", res.data.templateUpdateResponse);
                    
                }
            }).catch((error) => {
                props.setTemplateUploaded(false);
                props.showToast("FAILED");
                console.error(error);
        });
        
        props.setShow(false);
    }
    return (
        <>
            <Modal show={props.show} onHide={() => props.setShow(false)} backdrop="static" centered>
                <Modal.Header closeButton>
                    <Modal.Title>{t('templateUpload.title')}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <div className="border rounded-2 p-3 text-center mb-3 position-relative">
                        <FormControl type="text" id="key" className={`${styles['input-box']}  w-100`} placeholder={t('templateUpload.placeholder')} />
                        <div className="p-2">
                            <FormControl type="file" className="form-control h-75 opacity-0 position-absolute pt-0 start-0 w-100"  id="file" onChange={handleFileUpload}/>
                            {
                            fileUploaded && <div className="d-flex justify-content-center align-items-center">
                                    <img src={uploadIcon} alt="upload icon" className="me-3"/>
                                    <span>{file.name}</span>
                                </div>
                            }
                            {!fileUploaded && <div>
                                <img src={uploadIcon} alt="upload icon" className="mb-3"/>
                                <p className={styles['upload-help-text']}>{t('templateUpload.uploadComment1')}</p>
                                <p className={styles['upload-help-text']}>{t('templateUpload.or')}</p>
                                <p className={styles['upload-instruction']}>{t('templateUpload.uploadComment2')}</p>
                            </div>}
                        </div>
                    </div>
                </Modal.Body>
                <Modal.Footer className="justify-content-center">
                <Row className="w-100">
                    <Col><Button variant="outline-primary" onClick={() => {props.setShow(false)}}>
                            {t('templateUpload.close')}
                        </Button></Col>
                    <Col><Button variant="primary" onClick={saveTemplate}>
                            {t('templateUpload.upload')}
                        </Button></Col>
                </Row>
                </Modal.Footer>
            </Modal>
        </>
    );
};

export default UploadTemplate;