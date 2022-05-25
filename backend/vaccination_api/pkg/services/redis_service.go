package services

import (
	"context"

	"github.com/divoc/api/config"
	redis "github.com/go-redis/redis/v8"
	log "github.com/sirupsen/logrus"
)

var redisClient *redis.Client
var ctx = context.Background()

func InitRedis() {
	log.Infof("In Init REDIS Function of Vaccination API")
	options, err := redis.ParseURL(config.Config.Redis.Url)
	if err != nil {
		log.Errorf("Error while parsing Redis URL : %v", err)
	}
	redisClient = redis.NewClient(&redis.Options{
		Addr:     options.Addr,  // Addr is part of options struct
		Password: config.Config.Redis.Password,
	})
	_, err = redisClient.Ping(ctx).Result()
	if err != nil {
		panic(err)
	}
}

func DeleteValue(key string) error {
	_, err := redisClient.Get(ctx, key).Result()
	if err == redis.Nil {
		log.Infof("key does not exist")
		return nil
	} else if err != nil {
		return err
	}
	return redisClient.Del(ctx, key).Err()
}
