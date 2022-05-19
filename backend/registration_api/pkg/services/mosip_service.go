package services

import (
	"encoding/base64"
	"encoding/json"
	"encoding/pem"
	"fmt"
	"github.com/divoc/registration-api/config"
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
	log.Infof("signed payload - %v", signedPayload)

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

func generateOTP(requestBody OTPRequest, header RequestHeader) (*req.Resp, error) {
	return req.Post(config.Config.Mosip.OTPUrl, req.BodyJSON(requestBody), req.HeaderFromStruct(header))
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