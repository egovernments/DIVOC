import {React, useState} from 'react'
import { Col, Form, FormControl, FormGroup, FormLabel, Row } from 'react-bootstrap';
import config from '../../config.json';
import {useKeycloak} from '@react-keycloak/web';
import GenericButton from '../GenericButton/GenericButton';
import { Link } from 'react-router-dom';
import PrintIcon from '../../assets/img/print.svg';
const axios = require('axios');

const TestAndPublish = (props) => {
    const schema = props.schema;
    const {keycloak} = useKeycloak();
    const setAsPublish = async () => {
        const userToken = await getToken();
        schema.status = "PUBLISHED"
        axios.post('/vc-management/v1/schema', schema, {headers:{Authorization:{userToken}}})
        .then(res =>res.data
            ).catch(error => {
                console.error(error);
                throw error;
            });
    }
    const [samplefile, setSamplefile] = useState(null);
    // const schema = {
    //     "name":"TrainingCertificateE",
    //     "schema": "{\"$schema\":\"http://json-schema.org/draft-07/schema\",\"type\":\"object\",\"properties\":{\"TrainingCertificateE\":{\"$ref\":\"#/definitions/TrainingCertificateE\"}},\"required\":[\"TrainingCertificateE\"],\"title\":\"TrainingCertificateE\",\"definitions\":{\"TrainingCertificateE\":{\"type\":\"object\",\"title\":\"NHAUIP Certificates\",\"required\":[\"name\",\"organisation\",\"email\",\"courseName\",\"issuer\",\"issuanceDate\",\"certificateId\"],\"properties\":{\"name\":{\"type\":\"string\"},\"issuer\":{\"type\":\"string\"},\"organisation\":{\"type\":\"string\"},\"email\":{\"type\":\"string\"},\"mobileNo\":{\"type\":\"string\"},\"courseName\":{\"type\":\"string\"},\"issuanceDate\":{\"type\":\"string\"},\"courseStartDate\":{\"type\":\"string\"},\"courseEndDate\":{\"type\":\"string\"},\"certificateId\":{\"type\":\"string\"}}}},\"_osConfig\":{\"uniqueIndexFields\":[],\"ownershipAttributes\":[],\"roles\":[\"bhanu1@gmail.com-realm-role\"],\"inviteRoles\":[\"anonymous\"],\"enableLogin\":false,\"credentialTemplate\":{\"@context\":[\"https://www.w3.org/2018/credentials/v1\",\"http://vc-management-service:7655/vc-management/v1/context/0104783d-0ba9-46c0-a9c9-73eb43c03018\"],\"type\":[\"VerifiableCredential\",\"ProofOfTraining\"],\"credentialSubject\":{\"type\":\"Person\",\"name\":\"{{name}}\",\"email\":\"{{email}}\",\"mobileNo\":\"{{mobileNo}}\"},\"issuer\":\"{{{issuer}}}\",\"issuanceDate\":\"{{issuanceDate}}\",\"evidence\":{\"type\":\"TrainingCertificateE\",\"organisation\":\"{{organisation}}\",\"courseName\":\"{{courseName}}\",\"courseStartDate\":\"{{courseStartDate}}\",\"courseEndDate\":\"{{courseEndDate}}\",\"certificateId\":\"{{certificateId}}\"},\"nonTransferable\":\"true\"},\"certificateTemplates\":{\"html\":\"minio://Tenant/e1005413-8c47-41b5-b5a8-c555ce65f85a/templates/documents/0d86bb17-b163-4faa-99d3-fd4495e20b96-TrainingSvgTemplate.svg\"}}}",
    //     "status": "DRAFT" 
    // }
    const requiredFeilds = (JSON.parse(schema.schema).definitions[schema.name].required).toString().split(",");
    var formObj = {}; requiredFeilds.forEach(key => formObj[key] = "");
    const [data, setData] = useState(formObj);
    const previewReqBody = ({
            credentialTemplate:JSON.parse(schema.schema)._osConfig.credentialTemplate,
            // template:"Tenant/969b7d5c-4c2a-42a2-9d8f-5cd1348cf54d/templates/documents/527f7650-a8d0-42ae-a480-f01b9396bf72-trainingCert.html",
            template: props.template,
            data: data
        })

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
    const downloadPdf = () => {
        var dlAnchorElem = document.createElement('a');
        dlAnchorElem.setAttribute("href", samplefile);
        dlAnchorElem.setAttribute("download", "sample.pdf");
        dlAnchorElem.click();
    }
    const formInputHandler = (e) => {
        setData({...data, [e.target.name]:e.target.value})
    }
  
  return (
    <div>
        <div className='row mx-5 px-5'>
        <div className='col-6'>
            <h1>Test & Publish</h1>
            <small>Add sample data to test the template</small>
            <Form style={{"max-height":"600px", "overflowY":"scroll"}}>
                {Object.keys(data).map((index) => 
                <div className='my-3'>
                    <FormGroup>
                        <FormLabel>{index}</FormLabel>
                        <FormControl type='text' name={index} placeholder={data[index]} onChange={formInputHandler} />
                    </FormGroup>
                </div>)}
            </Form>
            <div onClick={previewSchemaFunc} className="my-3"><GenericButton img='' text='Test' variant='primary'/></div>
        </div>
        <div className='col-6'>
            <div className='w-50 m-auto'>
                <iframe width="100%" height="400px"  id="ifmcontentPrint" src="" />
            </div>
            <div style={{margin:"auto"}} className='w-50' onClick={downloadPdf}>
                <GenericButton img={PrintIcon} text='Print' variant='outline-light' />
            </div>
        </div>
        </div>
        <div style={{ "bottom":"0", "marginBottom":"3rem", width:"100%"}} >
            <hr />
        <Row gutter='3' xs={1} sm={2} md={3} lg={4} className="justify-content-end">
            <Col className="my-1 h-100">
                <Link to={`${config.urlPath}/manage-schema`} >
                    <GenericButton img='' text='Go Back' variant='outline-primary'/> 
                </Link>
            </Col>
            <Col className="my-1 h-100">
                <Link onClick={setAsPublish} to='/manage-schema'>
                    <GenericButton img='' text='Publish' variant='primary'/> 
                </Link>
            </Col>
        </Row>
        </div>
    </div>
  )
}

export default TestAndPublish