package services

import (
	"github.com/divoc/registration-api/config"
	"github.com/go-redis/redis"
	"time"
)

var redisClient = redis.NewClient(&redis.Options{
	Addr: "redis:6379",
	Password: "",
	DB: 0,
})

func SetValue(key string, val interface{}) error {
	duration := time.Minute * time.Duration(config.Config.Auth.TTLForOtp)
	err := redisClient.Set(key, val, duration).Err()
	return err
}

func GetValue(key string) (string, error) {
	result, err := redisClient.Get(key).Result()
	return result, err
}
