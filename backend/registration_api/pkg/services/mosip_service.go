package services

import (
	"crypto/rsa"
	"crypto/x509"
	"encoding/base64"
	"encoding/json"
	"encoding/pem"
	"fmt"
	"github.com/divoc/registration-api/config"
	"github.com/divoc/registration-api/pkg/utils"
	"github.com/gospotcheck/jwt-go"
	"github.com/imroc/req"
	"github.com/lestrrat-go/jwx/jwa"
	"github.com/lestrrat-go/jwx/jws"
	log "github.com/sirupsen/logrus"
	"time"
)

type OTPRequest struct {
	Id               string   `json:"id"`
	Version          string   `json:"version"`
	TransactionId    string   `json:"transactionID"`
	RequestTime      string   `json:"requestTime"`
	IndividualId     string   `json:"individualId"`
	IndividualIdType string   `json:"individualIdType"`
	OtpChannel       []string `json:"otpChannel"`
}

type RequestHeader struct {
	Signature     string `json:"signature"`
	ContentType   string `json:"Content-type"`
	Authorisation string `json:"Authorization"`
}

type AuthRequest struct {
	Id               string   `json:"id"`
	Version          string   `json:"version"`
	RequestedAuth          map[string]bool   `json:"requestedAuth"`
	TransactionId    string   `json:"transactionID"`
	RequestTime      string   `json:"requestTime"`
	Request      string   `json:"request"`
	ConsentObtained      bool   `json:"consentObtained"`
	IndividualId     string   `json:"individualId"`
	IndividualIdType string   `json:"individualIdType"`
	RequestHMAC string   `json:"requestHMAC"`
	Thumbprint string   `json:"thumbprint"`
	RequestSessionKey       string `json:"requestSessionKey"`
}

func MosipOTPRequest(individualIDType string, individualId string) error {

	authToken := getMosipAuthToken()
	requestBody := OTPRequest{
		Id:               "mosip.identity.otp",
		Version:          "1.0",
		TransactionId:    "1234567890",
		RequestTime:      time.Now().UTC().Format("2006-01-02T15:04:05.999Z"),
		IndividualId:     individualId,
		IndividualIdType: individualIDType,
		OtpChannel:       []string{"email"},
	}

	reqJson, err :=json.Marshal(requestBody)
	if err != nil {
		log.Errorf("Error occurred while trying to unmarshal the array of enrollments (%v)", err)
		return err
	}
	log.Infof("requestBody before signature - %s", reqJson)
	signedPayload := getSignature(reqJson, config.Config.Mosip.PrivateKey, config.Config.Mosip.PublicKey)
	log.Debugf("signed payload - %v", signedPayload)

	resp, err := generateOTP(requestBody, RequestHeader{
		Signature:   signedPayload,
		ContentType: "application/json",
		Authorisation: "Authorization="+authToken,
	});

	if err != nil {
		log.Errorf("Error Response from MOSIP OTP Generate API - %v", err)
		return err
	}

	log.Debugf("Response of OTP request - %V", resp)

	return nil
}

func MosipAuthRequest(individualIDType string, individualId string, otp string) (*req.Resp, error) {

	requestTime := time.Now().UTC().Format("2006-01-02T15:04:05.999Z")
	identityBlock, _ := json.Marshal(map[string] string {
		"timestamp": requestTime,
		"otp": otp,
	})
	secretKey := utils.GenSecKey()
	encryptedIdentityBlock := utils.SymmetricEncrypt(identityBlock, secretKey)
	block, _ := pem.Decode([]byte(config.Config.Mosip.IDACertKey))

	var cert* x509.Certificate
	cert, _ = x509.ParseCertificate(block.Bytes)
	rsaPublicKey := cert.PublicKey.(*rsa.PublicKey)
	encryptedSessionKeyByte, err := utils.AsymmetricEncrypt(secretKey, rsaPublicKey)
	if err != nil {
		return nil, err
	}
	RequestHMAC := utils.SymmetricEncrypt([]byte(utils.DigestAsPlainText(identityBlock)), secretKey)

	pemBlock, _ := pem.Decode([]byte(config.Config.Mosip.IDACertKey))
	certificateThumbnail := utils.Sha256Hash(pemBlock.Bytes)

	authBody := AuthRequest{
		Id:                "mosip.identity.auth",
		Version:           "1.0",
		RequestedAuth: 		map[string]bool{"otp": true},
		TransactionId:     "1234567890",
		RequestTime:       requestTime,
		Request:           base64.URLEncoding.EncodeToString([]byte(encryptedIdentityBlock)),
		ConsentObtained:   true,
		IndividualId:      individualId,
		IndividualIdType:  individualIDType,
		RequestHMAC:       base64.URLEncoding.EncodeToString([]byte(RequestHMAC)),
		Thumbprint:        base64.URLEncoding.EncodeToString(certificateThumbnail),
		RequestSessionKey: base64.URLEncoding.EncodeToString(encryptedSessionKeyByte),
	}

	reqJson, err :=json.Marshal(authBody)
	if err != nil {
		log.Errorf("Error occurred while trying to unmarshal authBody (%v)", err)
		return nil, err
	}
	log.Debugf("requestBody before signature - %s", reqJson)

	signedPayload := getSignature(reqJson, config.Config.Mosip.PrivateKey, config.Config.Mosip.PublicKey)
	log.Debugf("signed payload - %v", signedPayload)

	authToken := getMosipAuthToken()

	resp, err := requestAuth(authBody, RequestHeader{
		Signature:   signedPayload,
		ContentType: "application/json",
		Authorisation: "Authorization="+authToken,
	})

	if err != nil {
		log.Errorf("HTTP call to MOSIP Auth API failed - %v", err)
		return nil, err
	}

	log.Debugf("Response of Auth request - %V", resp)

	return resp, nil
}

func generateOTP(requestBody OTPRequest, header RequestHeader) (*req.Resp, error) {
	return req.Post(config.Config.Mosip.OTPUrl, req.BodyJSON(requestBody), req.HeaderFromStruct(header))
}

func requestAuth(requestBody AuthRequest, header RequestHeader) (*req.Resp, error) {
	return req.Post(config.Config.Mosip.AuthUrl, req.BodyJSON(requestBody), req.HeaderFromStruct(header))
}
func getMosipAuthToken() string {
	// TODO: Generate the token from API
	return config.Config.Mosip.AuthHeader
}

func getSignature(data []byte, privateKey string, certificate string) string {

	keyFromPem, _ := jwt.ParseRSAPrivateKeyFromPEM([]byte(privateKey))

	pemBlock, _ := pem.Decode([]byte(certificate))
	publicCert := base64.StdEncoding.EncodeToString(pemBlock.Bytes)

	var certs [] string
	certs = append(certs, publicCert)

	hdrs := jws.NewHeaders()
	err := hdrs.Set(jws.X509CertChainKey, certs)

	buf, err := jws.Sign(data, jwa.RS256, keyFromPem, jws.WithHeaders(hdrs))
	if err != nil {
		fmt.Printf("failed to sign payload: %s\n", err)
		return ""
	}

	return string(buf)

}