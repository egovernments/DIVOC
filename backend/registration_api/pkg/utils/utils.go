package utils

import (
	"encoding/json"
	"math"
	"math/rand"
	"strconv"
	"time"

	"github.com/divoc/registration-api/config"
	log "github.com/sirupsen/logrus"

	"github.com/aws/aws-sdk-go/aws"
	"github.com/aws/aws-sdk-go/aws/session"
	"github.com/aws/aws-sdk-go/service/sns"
)

func GenerateEnrollmentCode(phoneNumber string, code int) string {
	generatedCode := phoneNumber + "-" + strconv.Itoa(code)
	log.Info("Generated Code: " + generatedCode)
	return generatedCode
}

func GenerateOTP() string {
	if config.Config.MockOtp {
		return "123456"
	} else {
		n := config.Config.Auth.OTPLength
		otp := int(math.Pow10(n-1)) + rand.Intn(int(math.Pow10(n)-math.Pow10(n-1)))
		return strconv.Itoa(otp)
	}
}

//todo: move to notification service with priority as transactional
func SendOTP(prefix string, phone string, otp string) (*sns.PublishOutput, error) {
	sess := session.Must(session.NewSession())
	log.Info("session created")
	svc := sns.New(sess)
	log.Info("service created")
	msgType := "Transactional"
	dataType := "String"
	svc.SetSMSAttributesRequest(&sns.SetSMSAttributesInput{
		Attributes: map[string]*string{"DefaultSMSType": &msgType},
	})
	params := &sns.PublishInput{
		Message:     aws.String("OTP for registration " + otp),
		PhoneNumber: aws.String(prefix + phone),
		MessageAttributes: map[string]*sns.MessageAttributeValue{
			"AWS.SNS.SMS.SMSType": &sns.MessageAttributeValue{
				DataType:    &dataType,
				StringValue: &msgType,
			},
		},
	}
	resp, err := svc.Publish(params)
	log.Infof("Message sent %s %+v", phone, resp)
	return resp, err
}

func ToMap(obj interface{}) map[string]interface{}{
	if bytes, err := json.Marshal(obj); err == nil {
		var resp map[string]interface{}
		if err := json.Unmarshal(bytes, &resp); err == nil {
			return resp
		}
	}
	return nil
}

func GetTomorrowStart() time.Time {
	return time.Now().Truncate(24 * time.Hour).AddDate(0, 0, 1)
}

//Filter returns new slice with elements that fit the criteria
func Filter(entries []string, criteria func(s string) bool) []string {
	var res []string
	for _, e := range entries {
		if criteria(e) {
			res = append(res, e)
		}
	}
	return res
}
