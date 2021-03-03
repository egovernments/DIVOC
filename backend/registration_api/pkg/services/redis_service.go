package services

import (
	"context"
	"github.com/go-redis/redis/v8"
	"time"

	"github.com/divoc/registration-api/config"
	log "github.com/sirupsen/logrus"
)

var redisClient *redis.Client
var ctx = context.Background()

func InitRedis() {
	options, err := redis.ParseURL(config.Config.Redis.Url)
	if err != nil {
		panic(err)
	}
	redisClient = redis.NewClient(options)
	_, err = redisClient.Ping(ctx).Result()
	if err != nil {
		panic(err)
	}
}

func DeleteValue(key string) error {
	return redisClient.Del(ctx, key).Err()
}
func SetValue(key string, val interface{}, ttl time.Duration) error {
	log.Info("Set value for ", key)
	return redisClient.Set(ctx, key, val, ttl).Err()
}

func GetValue(key string) (string, error) {
	log.Info("Get value for ", key)
	result, err := redisClient.Get(ctx, key).Result()
	return result, err
}

func GetValues(key ...string) ([]interface{}, error) {
	result, err := redisClient.MGet(ctx, key...).Result()
	return result, err
}

func PushToList(key string, values string) (int64, error) {
	return redisClient.RPush(ctx, key, values).Result()
}

func AddToSet(key string, value string, score float64) (int64, error) {
	return redisClient.ZAddNX(ctx, key, &redis.Z{
		Score:  score,
		Member: value,
	}).Result()
}

func RemoveElementsByScoreInSet(key, minScore, maxScore string) error {
	return redisClient.ZRemRangeByScore(ctx, key, minScore, maxScore).Err()
}

func SetValueWithoutExpiry(key string, val interface{}) error {
	err := redisClient.SetNX(ctx, key, val, 0).Err()
	return err
}

func GetValuesFromSet(key string, startPosition int64, stopPosition int64) ([]string, error) {
	return redisClient.ZRange(ctx, key, startPosition, stopPosition).Result()
}

func GetValuesByScoreFromSet(key, minScore, maxScore string, limit, offset int64) ([]string, error) {
	return redisClient.ZRangeByScore(ctx, key, &redis.ZRangeBy{
		Min: minScore, Max: maxScore, Count: limit, Offset: offset,
	}).Result()
}

func KeyExists(key string) (int64, error) {
	return redisClient.Exists(ctx, key).Result()
}

func DecrValue(key string) (int64, error) {
	return redisClient.Decr(ctx, key).Result()
}

func SetHash(key string, field string, value string) (bool, error) {
	return redisClient.HSetNX(ctx, key, field, value).Result()
}

func SetHMSet(key string, fields map[string]interface{}) (bool, error) {
	return redisClient.HMSet(ctx, key, fields).Result()
}

func HashFieldExists(key string, field string) (bool, error) {
	return redisClient.HExists(ctx, key, field).Result()
}

func GetHashValues(key string, ) (map[string]string, error) {
	return redisClient.HGetAll(ctx, key).Result()
}

func IncrValue(key string) (int64, error) {
	return redisClient.Incr(ctx, key).Result()
}

func RemoveHastField(key string, field string) (int64, error) {
	return redisClient.HDel(ctx, key, field).Result()
}

func IncrHashField(key string, field string) (int64, error) {
	return redisClient.HIncrBy(ctx, key, field, 1).Result()
}

func SetTTLForHash(key string, ttl time.Duration) (bool, error) {
	return redisClient.Expire(ctx, key, ttl).Result()
}