const sunbirdRegistryService = require('../services/sunbird.service')
const certifyConstants = require('../configs/constants');

async function createCertificate(req, res) {
    try {
        const entityType = req.params.entityType;
        const token = req.header("Authorization");
        console.log("EntityType: ", entityType);
        const certificateAddResponse = await sunbirdRegistryService.createCertificate(req.body, entityType, token)
        res.status(200).json({
            message: "Successfully Certified",
            certificateAddResponse: certificateAddResponse
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
        const certificateAddResponse = await sunbirdRegistryService.createCertificate(req.body, entityType, token);
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
        const certificateRevokeResponse = await sunbirdRegistryService.deleteCertificate(req.body, entityName, entityId, token);
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

module.exports = {
    createCertificate,
    getCertificate,
    updateCertificate,
    deleteCertificate
}
