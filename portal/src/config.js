const urlPath = "/portal";
const ETCD_URL = process.env.REACT_APP_ETCD_URL || 'etcd:2379';
const CONFIGURATION_LAYER = process.env.REACT_APP_CONFIGURATION_LAYER || 'etcd';
const ETCD_AUTH_ENABLED = process.env.REACT_APP_ETCD_AUTH_ENABLED === "true"
const ETCD_USERNAME = process.env.REACT_APP_ETCD_USERNAME;
const ETCD_PASSWORD = process.env.REACT_APP_ETCD_PASSWORD;


module.exports = {
  urlPath,
  ETCD_URL,
  CONFIGURATION_LAYER,
  ETCD_AUTH_ENABLED,
  ETCD_USERNAME,
  ETCD_PASSWORD
};