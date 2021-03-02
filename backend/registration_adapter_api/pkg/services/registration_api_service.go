package services

import (
	"github.com/divoc/registration-adapter-api/config"
	"github.com/imroc/req"
	log "github.com/sirupsen/logrus"
)

func CallRegistrationAPI(method string, url string, queryParam interface{}, header interface{}, body interface{}) (*req.Resp, error) {
	log.Info("Calling registry url ", url)
	log.Infof("Request >> %+v", body)
	resp, err := req.Do(method, config.Config.Registration.BaseUrl+url, queryParam, header, req.BodyJSON(body))
	log.Infof("%v", resp)
	log.Infof("%v", err)
	return resp, err
}
