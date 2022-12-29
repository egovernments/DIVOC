import React, { useEffect, useState } from 'react';
import { Modal, Table } from 'react-bootstrap';
import {standardizeString} from '../../utils/customUtils';
import DownloadIcon from "../../assets/img/Download.svg";
import DeleteIcon from "../../assets/img/Delete.svg";
import GenericButton from '../../components/GenericButton/GenericButton'
import config from '../../config.json';
import { getToken } from '../../utils/keycloak';
const axios = require('axios');

const ManageTempModal = ({schemaBody, setShowModal}) => {
    var dupSchemaBody = {...schemaBody};
    const [changeSchema, setChangeSchema] = useState(dupSchemaBody);
    var schema = JSON.parse(changeSchema.schema);
    var templates = (schema._osConfig?.certificateTemplates);
    const [dupTemp, setDupTemp] = useState({...templates});
    const [show, setShow] = useState(true);
    const downloadHtml = async (templateUrl) => {
        const templateBody = {template : templateUrl}
        const html = await axios.get(`/vc-management/v1/templates`, { params: templateBody }).then(
            res => res.data.htmlData
        ).catch(error => {
            console.error(error);
            throw error;
        });
        const element = document.createElement("a");
        const file = new Blob([html], {type: 'text/html'});
        element.href = URL.createObjectURL(file);
        element.download = "template.html";
        document.body.appendChild(element); // Required for this to work in FireFox
        element.click();
        }
    const delTemplate = async (key) => {
        const userToken = await getToken();
        delete dupTemp[key];
        dupSchemaBody.schema = JSON.stringify(schema)
        setChangeSchema(dupSchemaBody)
        axios.put(`${config.schemaUrl}/${schemaBody.osid}`, changeSchema, {headers:{"Authorization" :`Bearer ${userToken}`}})
        .then(res => res.data)
        .catch(error => {
                console.error(error);
                throw error;
            });
        return
    }
    
    useEffect(() => {
        setDupTemp(templates)
    }, [])
    
   

  return (
    <Modal show={show} onHide={null}>
       <Modal.Header className='border-0'>
          <Modal.Title>Upload Templates</Modal.Title>
        </Modal.Header>
        <Modal.Body>
            <Table>
                <thead>
                    <tr className='table-col-header'>
                        <th>S.No</th>
                        <th className='col-5'>Name</th>
                        <th className='text-center'>Actions</th>
                    </tr>
                    {Object.keys(dupTemp).map((templatekey, index) => 
                    (<tr key={index}>
                        <td>{index+1}.</td>
                        <td>{standardizeString(templatekey)}</td>
                        <td><div className='d-flex flex-wrap justify-content-around px-3'>
                        <div onClick={() => {delTemplate(templatekey)}} ><img src={DeleteIcon} /></div>
                        <div onClick={() => {downloadHtml(dupTemp[templatekey])}}><img src={DownloadIcon} /></div></div></td>
                    </tr>))}
                </thead>
            </Table>
        </Modal.Body>
        <Modal.Footer className='border-0'>
            <div onClick={() => {setShow(false);setShowModal(false)}} style={{width: "30%"}} >
                <GenericButton img="" text="Close" variant="primary" />
            </div>
        </Modal.Footer>
    </Modal>
  )
}

export default ManageTempModal