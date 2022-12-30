import React, { useEffect, useState } from 'react';
import { Modal, Table } from 'react-bootstrap';
import {standardizeString} from '../../utils/customUtils';
import DownloadIcon from "../../assets/img/Download.svg";
import DeleteIcon from "../../assets/img/Delete.svg";
import GenericButton from '../../components/GenericButton/GenericButton'
import config from '../../config.json';
import { getToken } from '../../utils/keycloak';
const axios = require('axios');

const ManageTempModal = ({schemaBody, setShowModal, showToast}) => {
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
        var requestBody;
    const delTemplate = async (key) => {
        const userToken = await getToken();
        var dummyTemp = dupTemp
        delete dummyTemp[key];
        setDupTemp(dummyTemp);
        schema._osConfig.certificateTemplates = dupTemp;
        dupSchemaBody.schema = JSON.stringify(schema);
        requestBody = {"name": schema.title,
                          "schema": dupSchemaBody.schema }
        setChangeSchema(requestBody);
        console.log(schemaBody);
        axios.put(`${config.schemaUrl}/${schemaBody.osid.slice(2)}`, requestBody, {headers:{"Authorization" :`Bearer ${userToken}`}})
        .then((res) => {
            if(res?.data) {
                showToast("DELETE_SUCCESS");
            }
        })
        .catch(error => {
            showToast("DELETE_FAILED");
                console.error(error);
                throw error;
            });
        return
    }

    const handleClose = () => {
        setShow(false);
        setShowModal(false); 
        setTimeout(() => {
            window.location.reload()
        }, 1500);
        
    }
    useEffect(() => {
        setDupTemp(JSON.parse(changeSchema.schema)._osConfig?.certificateTemplates)
    }, [])
    
   

  return (
    <Modal show={show} onHide={null}>
       <Modal.Header className='border-0'>
          <Modal.Title>Uploaded Templates</Modal.Title>
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
                        <td style={{color: "#6493E0"}}>{standardizeString(templatekey)}</td>
                        <td><div className='d-flex flex-wrap justify-content-around px-5'>
                        <div onClick={() => {delTemplate(templatekey)}} ><img src={DeleteIcon} /></div>
                        <div onClick={() => {downloadHtml(dupTemp[templatekey])}}><img src={DownloadIcon} /></div></div></td>
                    </tr>))}
                </thead>
            </Table>
        </Modal.Body>
        <Modal.Footer className='border-0'>
            <div onClick={handleClose} style={{width: "30%"}} >
                <GenericButton img="" text="Close" variant="primary" />
            </div>
        </Modal.Footer>
    </Modal>
  )
}

export default ManageTempModal