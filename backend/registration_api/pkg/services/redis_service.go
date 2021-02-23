package services

import (
	"github.com/divoc/registration-api/config"
	"github.com/go-redis/redis"
	log "github.com/sirupsen/logrus"
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
func SetValue(key string, val interface{}, ttlInMin time.Duration) error {
	log.Info("Set value for ", key)
	duration := time.Minute * ttlInMin
	err := redisClient.Set(key, val, duration).Err()
	return err
}

func GetValue(key string) (string, error) {
	log.Info("Get value for ", key)
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

func KeyExists(key string) (int64, error) {
	return redisClient.Exists(key).Result()
}

func DecrValue(key string) (int64, error) {
	return redisClient.Decr(key).Result()
}

func SetHash(key string, field string, value string) (bool, error) {
	return redisClient.HSetNX(key, field, value).Result()
}

func SetHMSet(key string, fields map[string]interface{}) (string, error) {
	return redisClient.HMSet(key, fields).Result()
}

func HashFieldExists(key string, field string) (bool, error) {
	return redisClient.HExists(key, field).Result()
}

func GetHashValues(key string, ) (map[string]string, error) {
	return redisClient.HGetAll(key).Result()
}

func IncrValue(key string) (int64, error) {
	return redisClient.Incr(key).Result()
}

func RemoveHastField(key string, field string) (int64, error) {
	return redisClient.HDel(key, field).Result()
}

func IncrHashField(key string, field string) (int64, error) {
	return redisClient.HIncrBy(key, field, 1).Result()
}