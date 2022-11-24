const keycloakService = require('../services/keycloak.service');
const {ROLE_SUFFIX} = require('../configs/constants');

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
module.exports = {
    createAndAssignNewRole
}