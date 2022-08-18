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
        const certificateUpdateResponse = await sunbirdRegistryService.updateCertificate(req.body, entityName, entityId, token);
        res.status(200).json({
            message: "Certificate Updated Successfully",
            certificateUpdateResponse: certificateUpdateResponse
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

async function revokeCertificate(req, res) {
    const token = req.header("Authorization");
    const filters = {
        "filters": {
            "osid": {
                "eq": req.body.certificateId
            }
        },
        "limit": 1,
        "offset": 0
    }
    // const flag = await sunbirdRegistryService.searchCertificate(req.body.entityName, filters, token)
    // if(!flag) {
    //     res.status(400).json({
    //         message: `Entry for ${req.body.entityName} not found`
    //     });
    //     return;
    // }
    // let body = {
    //     previousCertificateId: req.body.certificateId,
    //     schema: req.body.entityName,
    //     startDate: new Date(),
    // }
    // if(req.body.endDate) {
    //     body = {...body, endDate: req.body.endDate}
    // }
    // try {
    //     const certificateRevokeResponse = await sunbirdRegistryService.revokeCertificate(body, token);
    //     res.status(200).json({
    //         message: "Certificate Revoked",
    //         certificateRevokeResponse: certificateRevokeResponse
    //     })
    // } catch(err) {
    //     console.error(err);
    //     res.status(err?.response?.status || 500).json({
    //         message: err?.response?.data
    //     });
    // }
    sunbirdRegistryService.searchCertificate(req.body.entityName, filters, token)
    .then(async(result) => {
        if(result === true) {
            let body = {
                previousCertificateId: req.body.certificateId,
                schema: req.body.entityName,
                startDate: new Date(),
            }
            if(req.body.endDate) {
                body = {...body, endDate: req.body.endDate}
            }
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

module.exports = {
    createCertificate,
    getCertificate,
    updateCertificate,
    deleteCertificate,
    revokeCertificate
}
