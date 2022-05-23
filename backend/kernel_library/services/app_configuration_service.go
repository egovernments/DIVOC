package services

import (
	"context"
	"encoding/json"
	"github.com/divoc/kernel_library/config"
	log "github.com/sirupsen/logrus"
	clientv3 "go.etcd.io/etcd/client/v3"
	"strings"
)

type NotificationTemplatesType map[string]struct {
	Subject string
	Message string
}

type ProgramComorbiditiesType map[string]struct {
	Comorbidities []string
	MaxAge        int
	MinAge        int
}

type CountrySpecificFeaturesType map[string]struct {
	Features interface{}
}

var AppConfigs = struct {
	// add other keys which need tracking here
	NotificationTemplates   NotificationTemplatesType
	ProgramComorbidities    ProgramComorbiditiesType
	CountrySpecificFeatures CountrySpecificFeaturesType
}{}
var etcdClient *clientv3.Client
var clientErr error
var etcdKeysToWatch []string

const NotificationTemplates = "NOTIFICATION_TEMPLATES"
const ProgramComorbidities = "PROGRAM_COMORBIDITIES"
const CountrySpecificFeatures = "COUNTRY_SPECIFIC_FEATURES"

func Initialize() {
	log.Println("Etcd init")
	if config.Config.Etcd.Url == "" {
		log.Errorf("ETCD Url is not configured")
		return
	}
	etcdClientConfig := clientv3.Config{
		Endpoints: []string{config.Config.Etcd.Url},
	}
	if config.Config.Etcd.AuthEnabled {
		etcdClientConfig.Username = config.Config.Etcd.UserName
		etcdClientConfig.Password = config.Config.Etcd.Password
	}
	etcdKeysToWatch = strings.Split(config.Config.Etcd.Keys, ",")
	etcdClient, clientErr = clientv3.New(etcdClientConfig)
	if clientErr != nil {
		log.Errorf("Error while creating etcd client, %v", clientErr)
		return
	}

	loadInitialConfig()

	// watchers
	for _, key := range etcdKeysToWatch {
		go setupWatcher(key)
	}
}

func loadInitialConfig() {
	for _, key := range etcdKeysToWatch {
		getUpdatedValueForKey(key)
	}
}

func GetConfig(key string) interface{} {
	switch key {
	case ProgramComorbidities:
		return AppConfigs.ProgramComorbidities
	case CountrySpecificFeatures:
		return AppConfigs.CountrySpecificFeatures
	case NotificationTemplates:
		return AppConfigs.NotificationTemplates
	default:
		return nil
	}
}

func setupWatcher(key string) {
	watchRespChannel := etcdClient.Watch(context.Background(), key)
	for watchResp := range watchRespChannel {
		for _, ev := range watchResp.Events {
			if ev.IsCreate() || ev.IsModify() {
				getUpdatedValueForKey(string(ev.Kv.Key))
			}
		}
	}
}

func getUpdatedValueForKey(key string) {
	ctx, cancel := context.WithCancel(context.Background())
	resp, err := etcdClient.Get(ctx, key)
	cancel()
	if err != nil {
		log.Errorf("Error while getting KV, %v", err)
		return
	}
	switch key {
	case NotificationTemplates:
		notificationTemplate := NotificationTemplatesType{}
		for _, kv := range resp.Kvs {
			err = json.Unmarshal(kv.Value, &notificationTemplate)
			if err != nil {
				log.Errorf("notification templates not in defined format, %v", err)
			} else {
				AppConfigs.NotificationTemplates = notificationTemplate
			}
		}
	case ProgramComorbidities:
		comorbidities := ProgramComorbiditiesType{}
		for _, kv := range resp.Kvs {
			err = json.Unmarshal(kv.Value, &comorbidities)
			if err != nil {
				log.Errorf("comorbidities are not in defined format, %v", err)
			} else {
				AppConfigs.ProgramComorbidities = comorbidities
			}
		}
	case CountrySpecificFeatures:
		features := CountrySpecificFeaturesType{}
		for _, kv := range resp.Kvs {
			err = json.Unmarshal(kv.Value, &features)
			if err != nil {
				log.Errorf("features are not in defined format, %v", err)
			} else {
				AppConfigs.CountrySpecificFeatures = features
			}
		}
	default:
		log.Errorln("None of the keys matched")
	}
}
