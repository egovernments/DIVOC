const urlPath = "/certificate";
const registerMemberLimit = 4;
//const certificatePublicKey = "-----BEGIN PUBLIC KEY-----\nMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAnXQalrgztecTpc+INjRQ8s73FSE1kU5QSlwBdICCVJBUKiuQUt7s+Z5epgCvLVAOCbP1mm5lV7bfgV/iYWDio7lzX4MlJwDedWLiufr3Ajq+79CQiqPaIbZTo0i13zijKtX7wgxQ78wT/HkJRLkFpmGeK3za21tEfttytkhmJYlwaDTEc+Kx3RJqVhVh/dfwJGeuV4Xc/e2NH++ht0ENGuTk44KpQ+pwQVqtW7lmbDZQJoOJ7HYmmoKGJ0qt2hrj15uwcD1WEYfY5N7N0ArTzPgctExtZFDmituLGzuAZfv2AZZ9/7Y+igshzfB0reIFdUKw3cdVTzfv5FNrIqN5pwIDAQAB\n-----END PUBLIC KEY-----\n"
const certificatePublicKey ="-----BEGIN PUBLIC KEY-----\nMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAnhht8e5qjjnzcpA8fWbdv7whEbseWdvDcwEptGqyGpLGen2bLUZ2KeKloF1+BxeNOHyd8/Po79uogLVs5TvlJvjYCyj668ZjNaqsqvvNz27izQuvUDsaDIawFO10o7QqBC1YhCeRzSfjpbzQr3bcCJ4+hdNH30os6jBa7TMlNJk+N297bQ+vI1TDl6AR3bl/bYIDx56aKIyK6APi5mdZUPyYbVw+gHv/4FTTnuWH76XQHkQBHOWvCSH1JTmB+HjX9xtDBt9BBW7z00H3sAf0gsYauDgjfNxKhm/boHdjJxUGDwxIkYIrz85fJCjL3sNvHI0l4kn4IrREsTUKZ1cBEwIDAQAB\n-----END PUBLIC KEY-----\n";

const CERTIFICATE_CONTROLLER_ID ='https://divoc.lgcc.gov.lk/';
const CERTIFICATE_NAMESPACE = "https://divoc.lgcc.gov.lk/credentials/vaccination/v1";
const CERTIFICATE_NAMESPACE_V2 = "https://divoc.lgcc.gov.lk/credentials/vaccination/v2";
const CERTIFICATE_PUBKEY_ID = 'https://example.com/i/india';
const CERTIFICATE_DID = 'did:srilanka:moh';

module.exports = {
    urlPath,
    certificatePublicKey,
    registerMemberLimit,
    CERTIFICATE_CONTROLLER_ID,
    CERTIFICATE_DID,
    CERTIFICATE_NAMESPACE,
    CERTIFICATE_NAMESPACE_V2,
    CERTIFICATE_PUBKEY_ID
};
