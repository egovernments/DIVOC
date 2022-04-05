const urlPath = "/certificate";
const registerMemberLimit = 4;
const certificatePublicKey = process.env.REACT_APP_CERTIFICATE_PUBLIC_KEY || "-----BEGIN PUBLIC KEY-----\nMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAnXQalrgztecTpc+INjRQ8s73FSE1kU5QSlwBdICCVJBUKiuQUt7s+Z5epgCvLVAOCbP1mm5lV7bfgV/iYWDio7lzX4MlJwDedWLiufr3Ajq+79CQiqPaIbZTo0i13zijKtX7wgxQ78wT/HkJRLkFpmGeK3za21tEfttytkhmJYlwaDTEc+Kx3RJqVhVh/dfwJGeuV4Xc/e2NH++ht0ENGuTk44KpQ+pwQVqtW7lmbDZQJoOJ7HYmmoKGJ0qt2hrj15uwcD1WEYfY5N7N0ArTzPgctExtZFDmituLGzuAZfv2AZZ9/7Y+igshzfB0reIFdUKw3cdVTzfv5FNrIqN5pwIDAQAB\n-----END PUBLIC KEY-----\n"

const CERTIFICATE_CONTROLLER_ID = process.env.REACT_APP_CERTIFICATE_CONTROLLER_ID || 'https://divoc.dev/';
const CERTIFICATE_NAMESPACE = process.env.REACT_APP_CERTIFICATE_NAMESPACE || "https://divoc.dev/credentials/vaccination/v1";
const CERTIFICATE_NAMESPACE_V2 = process.env.REACT_APP_CERTIFICATE_NAMESPACE_V2 || "https://divoc.dev/credentials/vaccination/v2";
const CERTIFICATE_PUBKEY_ID = process.env.REACT_APP_CERTIFICATE_PUBKEY_ID || 'https://example.com/i/india';
const CERTIFICATE_DID = process.env.REACT_APP_CERTIFICATE_DID || 'did:india';
const CERTIFICATE_SCAN_TIMEOUT = process.env.REACT_APP_CERTIFICATE_SCAN_TIMEOUT || '45000';
const CERTIFICATE_SIGNED_KEY_TYPE = process.env.REACT_APP_CERTIFICATE_SIGNED_KEY_TYPE || 'RSA';
const certificatePublicKeyBase58 = process.env.REACT_APP_CERTIFICATE_PUBLIC_KEY_BASE58 || "DaipNW4xaH2bh1XGNNdqjnSYyru3hLnUgTBSfSvmZ2hi";

module.exports = {
    urlPath,
    certificatePublicKey,
    registerMemberLimit,
    CERTIFICATE_CONTROLLER_ID,
    CERTIFICATE_DID,
    CERTIFICATE_NAMESPACE,
    CERTIFICATE_NAMESPACE_V2,
    CERTIFICATE_PUBKEY_ID,
    CERTIFICATE_SCAN_TIMEOUT,
    CERTIFICATE_SIGNED_KEY_TYPE,
    certificatePublicKeyBase58
};
