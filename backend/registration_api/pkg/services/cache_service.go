package services

import (
	"context"
	"github.com/divoc/registration-api/config"
	"github.com/go-redis/cache/v8"
	"github.com/go-redis/redis/v8"
	"time"
)

var cacheClient *cache.Cache
var ctx context.Context

func InitCache() {
	ctx = context.TODO()
	ring := redis.NewRing(&redis.RingOptions{
		Addrs: map[string]string{
			"server1": config.Config.Redis.Url,
		},
	})
	cacheClient = cache.New(&cache.Options{
		Redis: ring,
	})
}

func SetObjectValue(key string, value map[string]interface{}) error {
	err := cacheClient.Set(&cache.Item{
		Ctx: ctx,
		Key:   key,
		Value: &value,
		TTL:   time.Minute * time.Duration(config.Config.Redis.CacheTTL),
	})
	return err
}

func GetObjectValue(key string, value *map[string]interface{}) error {
	err := cacheClient.Get(ctx, key, &value)
	return err
}
