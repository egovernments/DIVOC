import Keycloak from 'keycloak-js';

const keycloak = Keycloak('/portal/keycloak.json');
// const keycloak = Keycloak({'realm':'divoc','oidcProvider':"http://localhost/auth/realms/divoc/.well-known/openid-configuration", 'clientId':'facility-admin-portal'});

export default keycloak