import {React, useEffect, useLayoutEffect, useState} from 'react'
import { Col, Form, FormControl, FormGroup, FormLabel, Row } from 'react-bootstrap';
import config from '../../config.json';
import {useKeycloak} from '@react-keycloak/web';
import GenericButton from '../GenericButton/GenericButton';
import { Link } from 'react-router-dom';
const axios = require('axios');

const TestAndPublish = (props) => {
    const {keycloak} = useKeycloak();
    const [rF, setRf] = useState([]);
    const [pdf, setPdf] = useState("");
    const setAsPublish = () => {
        return
    }
    const previewRequestBody = {
        "credentialTemplate":JSON.parse(props.schema.schema)._osConfig.credentialTemplate,
        "data": "",
        "template": JSON.parse(props.schema.schema)._osConfig.certificateTemplates.html
    }
    const schema = {
        "name":"TrainingCertificateC",
        "schema":"{\n    \"$schema\": \"http://json-schema.org/draft-07/schema\",\n \"type\": \"object\",\n \"properties\": {\n \"TrainingCertificateC\": {\n \"$ref\": \"#/definitions/TrainingCertificateC\"\n }\n },\n \"required\": [\n \"TrainingCertificateC\"\n ],\n \"title\": \"TrainingCertificateC\",\n \"definitions\": {\n \"TrainingCertificateC\": {\n \"type\": \"object\",\n \"title\": \"NHAUIP Certificates\",\n \"required\": [\n \"name\",\n \"organisation\",\n \"email\",\n \"courseName\",\n \"issuer\",\n \"issuanceDate\"\n ],\n \"properties\": {\n \"name\": {\n \"type\": \"string\"\n },\n \"issuer\": {\n \"type\": \"string\"\n },\n \"organisation\": {\n \"type\": \"string\"\n },\n \"email\": {\n \"type\": \"string\"\n },\n \"mobileNo\": {\n \"type\": \"string\"\n },\n \"courseName\": {\n \"type\": \"string\"\n },\n \"issuanceDate\": {\n \"type\": \"string\"\n },\n \"courseStartDate\": {\n \"type\": \"string\"\n },\n \"courseEndDate\": {\n \"type\": \"string\"\n }\n }\n }\n },\n \"_osConfig\": {\n \"uniqueIndexFields\": [],\n \"ownershipAttributes\": [],\n \"roles\": [],\n \"inviteRoles\": [\n \"anonymous\"\n ],\n \"enableLogin\": false,\n \"credentialTemplate\": {\n \"@context\": [\n \"https://www.w3.org/2018/credentials/v1\",\n \"http://vc-management-service:7655/vc-management/v1/context/958eac51-f82e-4867-abbb-4db3637e54be\"\n ],\n \"type\": [\n \"VerifiableCredential\",\n \"ProofOfTraining\"\n ],\n \"credentialSubject\": {\n \"type\": \"Person\",\n \"name\": \"{{name}}\",\n          \"email\": \"{{email}}\",\n          \"mobileNo\": \"{{mobileNo}}\"\n        },\n        \"issuer\": \"{{{issuer}}}\",\n        \"issuanceDate\": \"{{issuanceDate}}\",\n        \"evidence\": {\n          \"type\": \"TrainingCertificateC\",\n          \"organisation\": \"{{organisation}}\",\n          \"courseName\": \"{{courseName}}\",\n          \"courseStartDate\": \"{{courseStartDate}}\",\n          \"courseEndDate\": \"{{courseEndDate}}\"\n          \n        },\n        \"nonTransferable\": \"true\"\n      },\n      \"certificateTemplates\": {\n        \"html\": \"minio://Tenant/e1005413-8c47-41b5-b5a8-c555ce65f85a/templates/documents/0d86bb17-b163-4faa-99d3-fd4495e20b96-TrainingSvgTemplate.svg\"\n      }\n    }\n  }"};
    const credentialTemplate = JSON.parse(schema.schema)._osConfig.credentialTemplate
    const template =  "Tenant/969b7d5c-4c2a-42a2-9d8f-5cd1348cf54d/templates/documents/527f7650-a8d0-42ae-a480-f01b9396bf72-trainingCert.html"    
    const data = {

                "name": "neha--17",
        
                "dob": "1991-11-29",
        
                "registrationId": "12345-6",
        
                "gender": "female",
        
                "registrationCouncil": "Karnataka",
        
                "latestQualification": "quali",
        
                "university": "Test university",
        
                "degreeYear": "2019",
        
                "systemOfMedicine": "test system",
        
                "registrationDate": "2021-09-09",
        
                "registrationExpiry": "2022-09-09",
        
                "issuer": "http://www.india.gov.in",
        
                "issuedOn": "2021-09-09",
        
                "validFrom": "2021-09-09T21:01:01.121Z",
        
                "validTill": "2021-09-09T21:01:01.121Z",
        
                "issuanceDate": "2021-09-09T21:01:01.121Z"
        
            }
    const previewReqBody = {"credentialTemplate":{"@context":["https://www.w3.org/2018/credentials/v1","http://vc-management-service:7655/vc-management/v1/context/958eac51-f82e-4867-abbb-4db3637e54be"],"type":["VerifiableCredential","ProofOfTraining"],"credentialSubject":{"type":"Person","name":"{{name}}","email":"{{email}}","mobileNo":"{{mobileNo}}"},"issuer":"{{{issuer}}}","issuanceDate":"{{issuanceDate}}","evidence":{"type":"TrainingCertificateC","organisation":"{{organisation}}","courseName":"{{courseName}}","courseStartDate":"{{courseStartDate}}","courseEndDate":"{{courseEndDate}}"},"nonTransferable":"true"},"template":"Tenant/969b7d5c-4c2a-42a2-9d8f-5cd1348cf54d/templates/documents/527f7650-a8d0-42ae-a480-f01b9396bf72-trainingCert.html","data":{"name":"neha--17","dob":"1991-11-29","registrationId":"12345-6","gender":"female","registrationCouncil":"Karnataka","latestQualification":"quali","university":"Test university","degreeYear":"2019","systemOfMedicine":"test system","registrationDate":"2021-09-09","registrationExpiry":"2022-09-09","issuer":"http://www.india.gov.in","issuedOn":"2021-09-09","validFrom":"2021-09-09T21:01:01.121Z","validTill":"2021-09-09T21:01:01.121Z","issuanceDate":"2021-09-09T21:01:01.121Z"}}
        const getUserId = async () => {    
        const userInfo = await keycloak.loadUserInfo();
        return userInfo.email;
    }
    const getToken = async () => {
      const userId = await getUserId();
      return axios.get(`${config.tokenEndPoint}/${userId}`).then(res =>
      res.data.access_token.access_token
    ).catch(error => {
      console.error(error);
      throw error;
    });
    };
    const previewSchemaFunc = async () => {
        const userToken = await getToken();
        return axios.post(`/vc-management/v1/schema/preview`, previewReqBody,
        {headers:{Authorization :{userToken}}}
        ).then(res =>res.data
        ).catch(error => {
            console.error(error);
            throw error;
        });
    };

    const setPdfFunc = async () => {
        const res = await previewSchemaFunc();
        console.log(res);
        const data = new Blob([res], {type: 'application/pdf'});
        const file = URL.createObjectURL(res);
        window.open(file)
        setPdf(file);
    }
    
    useLayoutEffect(() => {
        
        const getSchemaList = async () =>{
            const userToken = await getToken();
            console.log(userToken);
            return axios.get(`/vc-management/v1/schema`, {headers:{"Authorization" :`Bearer ${userToken}`}}).then(res =>
                res.data.schemas
            ).catch(error => {
                console.error(error);
                throw error;
            });
        };
        const setSchemListFunc = async () => {
            const schemasList  = await getSchemaList();
            const schemaName = "TrainingCertificateA"
            const reqs =  [JSON.parse(schemasList[0].schema).definitions[schemaName].required]
            const rfi = reqs.toString().split(",")
            setRf(rfi);
        }
        setSchemListFunc();
    }, [])
    
  return (
    <div>
       
        <div className='row mx-5 my-5 py-5 px-5'>
        <div className='col-6'>
            <Form>
                {Object.keys(rF).map((index) => 
                <div>
                    <FormGroup>
                        <FormLabel>{rF[index]}</FormLabel>
                        <FormControl type='text' placeholder={rF[index]}/>
                    </FormGroup>
                </div>)}
            </Form>
            <div onClick={setPdfFunc}><GenericButton img='' text='Test' type='outline-primary'/></div>
        </div>
        <div className='col-6'>
        <div>
      <iframe width="100%" height="600px" src={pdf}/>
    </div>
            <GenericButton img="" text='Print' type='primary'/>
        </div>
        </div>
        <div>
            <hr />
        <Row gutter='3' xs={1} sm={2} md={3} lg={4} className="justify-content-end">
            <Col className="my-1 h-100">
                <Link to={`${config.urlPath}/manage-schema`} >
                    <GenericButton img='' text='Go Back' type='secondary'/> 
                </Link>
            </Col>
            <Col className="my-1 h-100">
                <div onClick={setAsPublish}>
                    <GenericButton img='' text='Publish' type='primary'/> 
                </div>
            </Col>
        </Row>
        </div>
    </div>
  )
}

export default TestAndPublish