import {React, useEffect, useState} from 'react'
import { Col, Form, FormControl, FormGroup, FormLabel, Row } from 'react-bootstrap';
import {useTranslation} from "react-i18next";
import config from '../../config.json';
import GenericButton from '../GenericButton/GenericButton';
import { Link, useNavigate } from 'react-router-dom';
import PrintIcon from '../../assets/img/print.svg';
import {getToken, getUserId} from '../../utils/keycloak';
import { standardizeString, downloadPdf} from '../../utils/customUtils';
const axios = require('axios');

const TestAndPublish = ({schema}) => {
    const { t } = useTranslation();
    const publish = async () => {
        const userToken = await getToken();
        schema.status = "PUBLISHED"
        const osid= schema.osid.slice(2);
        axios.put(`${config.schemaUrl}/${osid}`, schema, {headers:{"Authorization" :`Bearer ${userToken}`}})
        .then((res) => {window.location.reload(true)})
        .catch(error => {
                console.error(error);
                throw error;
            });
    };
    const [samplefile, setSamplefile] = useState(null);
    const requiredFeilds = (JSON.parse(schema.schema).definitions[schema.name].required).toString().split(",");
    var formObj = {}; requiredFeilds.forEach(key => formObj[key] = "");
    const [data, setData] = useState(formObj);
    const [formErrors, setFormErrors] = useState({});
    const previewReqBody = ({
            credentialTemplate:JSON.parse(schema.schema)._osConfig.credentialTemplate,
            template: JSON.parse(schema.schema)._osConfig.certificateTemplates.html.split("://")[1],
            data: data
        });
    const previewSchemaFunc = async () => {
        const userToken = await getToken();
        return axios.post(`${config.previewUrl}`, previewReqBody,
        {headers:{Authorization :{userToken}},responseType:"arraybuffer"}
        ).then(res =>{
            const data = new Blob([res.data], {type: 'application/pdf'});
            let file = URL.createObjectURL(data);
            setSamplefile(file)
            document.querySelector('#ifmcontentPrint').src = file+"#toolbar=0&navpanes=0&scrollbar=0";
            file = URL.revokeObjectURL(data);
            }
        ).catch(error => {
            console.error(error);
            throw error;
        });
    };
    const formInputHandler = (e) => {
        setData({...data, [e.target.name]:e.target.value})
    };
    const handleTest = () => {
        let errors={};
        if(data["issuer"]===""){errors.issuer="should be valid issuer"}
        if(data["issuanceDate"]===""){errors.issuanceDate="should be a valid Issuance Date"}
        setFormErrors(errors);
        console.log(formErrors);
        if(Object.keys(formErrors).length === 0) {
            previewSchemaFunc();
        }
    }

  return (
    <div >
        <div className='row mx-5 px-5'>
        <div className='col-6'>
            <h1>{t('testAndPublish.title')}</h1>
            <small>{t('testAndPublish.text')}</small>
            <Form className='tp-form'>
                {data && Object.keys(data).map((index) => 
                <div className='m-3'>
                    <FormGroup>
                        <FormLabel>{standardizeString(index)}</FormLabel>
                        <FormControl type='text' name={index} onChange={formInputHandler}/>
                        {formErrors[index] && (
                        <p className="text-danger">{formErrors[index]}</p>
                        )}
                    </FormGroup>
                </div>)}
            </Form>
            <div onClick={handleTest} className="my-3"><GenericButton img='' text='Test' variant='primary'/></div>
        </div>
        <div className='col-6'>
            <div className='w-50 m-auto border'>
                <iframe width="100%" height="400px"  id="ifmcontentPrint" src="" />
            </div>
            <div style={{margin:"auto"}} className='w-50' onClick={() =>{downloadPdf(samplefile)}}>
                <GenericButton img={PrintIcon} text='Print' variant='outline-light' />
            </div>
        </div>
        </div>
        <div style={{ "bottom":"0", "marginBottom":"3rem", width:"100%"}} >
            <hr />
        <Row gutter='3' xs={1} sm={2} md={3} lg={5} xl={6} className="justify-content-end">
            <Col className="my-1 h-100">
                <Link to={`${config.urlPath}/manage-schema`} reloadDocument={true} >
                    <GenericButton img='' text={t('testAndPublish.backButton')} variant='outline-primary'/> 
                </Link>
            </Col>
            <Col className="my-1 h-100">
                <Link onClick={publish} to='/manage-schema'>
                    <GenericButton img='' text={t('testAndPublish.publishButton')} variant='primary'/> 
                </Link>
            </Col>
        </Row>
        </div>
    </div>
  )
}

export default TestAndPublish