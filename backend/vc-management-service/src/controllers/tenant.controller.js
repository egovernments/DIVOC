const sunbirdRegistryService = require('../services/sunbird.service')
const keycloakService = require('../services/keycloak.service')
const utils = require('../utils/utils')
const {ROLE_SUFFIX} = require('../configs/constants');

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
        res.status(err?.response?.status || 500).json({
            message: err?.response?.data
        });
    }
}

async function createAndAssignNewRole(userName, token) {
    console.log("creating new role");
    const roleName = userName + ROLE_SUFFIX;
    const adminRoleName = "admin";
    try {
        await keycloakService.createNewRole(roleName, token);
        const users = await keycloakService.getUserInfo(userName, token);
        const userId = users[0]?.id;
        const role = await keycloakService.getRoleInfo(roleName, token);
        const roleId = role?.id;
        const assigningRoles = [
            {
                "id": roleId,
                "name": roleName
            }
        ]
        await keycloakService.assignNewRole(assigningRoles, userId, token);
    } catch (err) {
        console.log("error while creating and assigning role to a user ", err)
        throw err;
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
        res.status(err?.response?.status || 500).json({
            message: err?.response?.data
        });
    }
}

module.exports = {
    createTenant,
    generateToken
}
