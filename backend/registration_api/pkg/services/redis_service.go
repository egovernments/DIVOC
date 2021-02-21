package services

import (
	"github.com/divoc/registration-api/config"
	"github.com/go-redis/redis"
	"time"
)

var redisClient *redis.Client

func InitRedis() {
	options, err := redis.ParseURL(config.Config.Redis.Url)
	if err != nil {
		panic(err)
	}
	redisClient = redis.NewClient(options)
	_, err = redisClient.Ping().Result()
	if err != nil {
		panic(err)
	}
}

func DeleteValue(key string) error {
	return redisClient.Del(key).Err()
}
func SetValue(key string, val interface{}) error {
	duration := time.Minute * time.Duration(config.Config.Auth.TTLForOtp)
	err := redisClient.Set(key, val, duration).Err()
	return err
}

func GetValue(key string) (string, error) {
	result, err := redisClient.Get(key).Result()
	return result, err
}

func GetValues(key ...string) ([]interface{}, error) {
	result, err := redisClient.MGet(key...).Result()
	return result, err
}

func PushToList(key string, values string) (int64, error) {
	return redisClient.RPush(key, values).Result()
}

func AddToSet(key string, value string, score float64) (int64, error) {
	return redisClient.ZAddNX(key, redis.Z{
		Score:  score,
		Member: value,
	}).Result()
}

func SetValueWithoutExpiry(key string, val interface{}) error {
	err := redisClient.SetNX(key, val, 0).Err()
	return err
}

func GetValuesFromSet(key string, startPosition int64, stopPosition int64) ([]string, error) {
	return redisClient.ZRange(key, startPosition, stopPosition).Result()
}
