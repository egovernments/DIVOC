package services

import (
	"github.com/go-redis/redis"
	"time"
)

var redisClient = redis.NewClient(&redis.Options{
	Addr: "redis:6379",
	Password: "",
	DB: 0,
})

func SetValue(key string, val string, expiry time.Duration) error {
	err := redisClient.Set(key, val, expiry).Err()
	return err
}

func GetValue(key string) (string, error) {
	result, err := redisClient.Get(key).Result()
	return result, err
}
