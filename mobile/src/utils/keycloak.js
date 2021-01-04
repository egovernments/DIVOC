import Keycloak from 'keycloak-js';
import config from "../config"
const keycloak = Keycloak(config.urlPath + '/keycloak.json');

export default keycloak