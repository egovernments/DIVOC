import config from '../config.json';
import {getToken, getUserId} from '../utils/keycloak'
const axios = require('axios');


const standardizeString = (str) => {
    return (str.charAt(0).toUpperCase()+str.slice(1)).match(/[A-Z][a-z]+|[0-9]+/g).join(" ");
};
const publish = async (schema) => {
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
const previewSchemaFunc = async (previewReqBody, setSamplefile) => {
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
const downloadPdf = (samplefile) => {
    var dlAnchorElem = document.createElement('a');
    dlAnchorElem.setAttribute("href", samplefile);
    dlAnchorElem.setAttribute("download", "sample.pdf");
    dlAnchorElem.click();
};

export {standardizeString, publish, previewSchemaFunc, downloadPdf};