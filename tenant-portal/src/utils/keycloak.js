import Keycloak from 'keycloak-js';
import config from '../config.json';
const axios = require('axios');

const keycloak = new Keycloak('/keycloak.json');

const getUserId = async () => {
    const userInfo = await keycloak.loadUserInfo();
    return userInfo.email;
}
const getToken = async () => {
  const userId = await getUserId();
  return axios.get(`${config.tokenEndPoint}/${userId}`).then(res =>
  res.data.access_token.access_token
).catch(error => {
  console.error(error);
  throw error;
});
};

export  {keycloak, getToken, getUserId};
