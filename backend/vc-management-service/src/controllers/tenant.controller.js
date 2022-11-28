const sunbirdRegistryService = require('../services/sunbird.service')
const keycloakService = require('../services/keycloak.service')
const utils = require('../utils/utils')
const {ROLE_SUFFIX} = require('../configs/constants');
const { createAndAssignNewRole } = require('../utils/tenant.utils')

async function createTenant(req, res) {
    try {
        const userId = req.body?.accountDetails?.userId.toLowerCase();
        const token = req.header("Authorization");
        const isValidUserId = utils.isValidUserId(userId);
        if (isValidUserId) {
            let tenantAddResponse;
            await sunbirdRegistryService.createTenant(req.body).then(async (res) => {
                tenantAddResponse = res;
                await createAndAssignNewRole(userId, token)
                                
            }).catch(err => {
                throw err
            });
            res.status(200).json({
                message: "Successfully created Tenant",
                tenantAddResponse: tenantAddResponse
            });
            return;
        }
        res.status(400).json({
            message: "Invalid userId. It must be a valid email address"
        })
    } catch (err) {
        console.error(err);
        res.status(err?.response?.status || err?.status || 500).json({
            message: err?.response?.data || err?.message
        });
    }
}

async function generateToken(req, res) {
    const userId = req.params.userId.toLowerCase();
    try {
        const isValidUserId = utils.isValidUserId(userId);
        if (isValidUserId) {
            await keycloakService.generateUserToken(userId).then(async (result) => {
                res.status(200).json({
                    access_token: result
                });
            }).catch(err => {
                throw err
            });
            return;
        }
        res.status(400).json({
            message: "Invalid userId. It must start with an alphabet or a number and can only contain .-_@"
        })
    } catch (err) {
        console.error(err);
        res.status(err?.response?.status || err?.status || 500).json({
            message: err?.response?.data || err?.message
        });
    }
}

module.exports = {
    createTenant,
    generateToken
}
