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

var AppConfigs = struct {
	// add other keys which need tracking here
	NotificationTemplates NotificationTemplatesType
}{}
var etcdClient *clientv3.Client
var clientErr error
var etcdKeysToWatch []string

const NotificationTemplates = "NOTIFICATION_TEMPLATES"

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
		//TODO: check what should happen if there is an error while getting from etcd
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
	default:
		log.Errorln("None of the keys matched")
	}
}
