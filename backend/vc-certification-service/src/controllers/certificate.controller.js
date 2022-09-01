const uuid = require('uuid');

const sunbirdRegistryService = require('../services/sunbird.service')
const certifyConstants = require('../configs/constants');
const {validationResult} = require('express-validator');
const validationService = require('../services/validation.service')
async function createCertificate(req, res, kafkaProducer) {
    try {
        validationService.validateCertificateInput(req);
        await kafkaProducer.connect();
        const transactionId = uuid.v4();
        kafkaProducer.send({
            topic: certifyConstants.VC_CERTIFY_TOPIC,
            messages: [
                {key: null, value: JSON.stringify({body: req.body, transactionId: transactionId, entityType: req.params.entityType, token: req.header("Authorization")})}
            ]
        });
        res.status(200).json({
            transactionId 
        });
    } catch (err) {
        console.error(err);
        res.status(err?.response?.status || 500).json({
            message: err?.response?.data
        });
    }
}

async function getCertificate(req, res) {
    try {
        const entityName = req.params.entityName;
        const certificateId = req.params.certificateId;
        const {data} = await sunbirdRegistryService.getCertificate(entityName, certificateId, req.headers);
        if (req.headers.accept === certifyConstants.SVG_ACCEPT_HEADER) {
            res.type(certifyConstants.IMAGE_RESPONSE_TYPE);
        };
        data.pipe(res);
    } catch (err) {
        console.error(err);
        res.status(err?.response?.status || 500).json({
            message: err
        });
    }
}

async function updateCertificate(req, res) {
    const entityName = req.params.entityName;
    const entityId = req.params.certificateId;
    const token = req.header("Authorization");
    try {
        //Update request in Sunbird RC , not used in DIVOC
        //const certificateUpdateResponse = await sunbirdRegistryService.updateCertificate(req.body, entityName, entityId, token);
        //Get details of the cert to be updated
        const data = await sunbirdRegistryService.getCertificateForUpdate(entityName, entityId, token);
        //Creates a new certificate
        const certificateAddResponse = await sunbirdRegistryService.createCertificate(req.body, entityName, token);
        //Get the osid of new cert
        const newCertID = certificateAddResponse.result.osid;
       //Prepare the data for inserting into revoke list table
        const dataForUpdate = createDataForUpdate(newCertID , entityId , data.issuanceDate);
       //Insert data into revoke list table
        await sunbirdRegistryService.createCertificate(dataForUpdate, "RevokedCertificate", token);
       //Soft delete from the certificate table
        await sunbirdRegistryService.deleteCertificate(req.body, entityName, entityId, token);
               res.status(200).json({
            message: "Certificate Updated Successfully",
            certificateUpdateResponse: certificateAddResponse
        });
    } catch(err) {
        console.error(err);
        res.status(err?.response?.status || 500).json({
            message: err?.response?.data
        });
    }
}

async function deleteCertificate(req, res) {
    const entityName = req.params.entityName;
    const entityId = req.params.certificateId;
    const token = req.header("Authorization");
    try {
        const certificateRevokeResponse = await sunbirdRegistryService.deleteCertificate(entityName, entityId, token);
        res.status(200).json({
            message: "Certificate revoked",
            certificateRevokeResponse: certificateRevokeResponse
        });
    } catch(err) {
        console.error(err);
        res.status(err?.response?.status || 500).json({
            message: err?.response?.data
        });
    }
}


function createDataForUpdate (certID , prevCertID , startDate){
 const dataForUpdate = {
    certificateId : certID,
    previousCertificateId : prevCertID,
    startDate : startDate,
    
 }
 return dataForUpdate;
}

async function revokeCertificate(req, res) {
    const errors = validationResult(req);
    console.log(errors);
    if (!errors.isEmpty()) {
        res.status(400).json(errors);
        return;
    }
    const token = req.header("Authorization");
    const filters = {
        "filters": {
            "certificateId": {
                "eq": req.body.certificateId
            }
        },
        "limit": 1,
        "offset": 0
    }
    sunbirdRegistryService.searchCertificate(req.body.entityName, filters, token)
    .then(async(result) => {
        if(result === true) {
            let body = getRevokeBody(req);
            const certificateRevokeResponse = await sunbirdRegistryService.revokeCertificate(body, token);
            res.status(200).json({
                message: "Certificate Revoked",
                certificateRevokeResponse: certificateRevokeResponse
            });
        }
        else {
            console.log('RESULT : ',result);
            res.status(400).json({
                message: `Entry for ${req.body.entityName} not found`
            })
        }
    }).catch(err => {
        console.log('ERROR : ',err?.response?.status || '');
        res.status(err?.response?.status || 500).json({
            message: err?.response?.data
        })
    })
}

function getRevokeBody(req) {
    let body = {
        previousCertificateId: req.body.certificateId,
        schema: req.body.entityName,
        startDate: new Date(),
    }
    if(req.body.endDate) {
        body = {...body, endDate: req.body.endDate}
    }
    return body;

}

module.exports = {
    createCertificate,
    getCertificate,
    updateCertificate,
    deleteCertificate,
    revokeCertificate
}

