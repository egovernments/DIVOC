package pkg

import (
	"encoding/json"
	"errors"
	"strconv"
)

func isEqual(arr1 []string, arr2 []string) bool {
	// If one is nil, the other must also be nil.
	if (arr1 == nil) != (arr2 == nil) {
		return false
	}

	if len(arr1) != len(arr2) {
		return false
	}

	for _, e := range arr1 {
		if !contains(arr2, e) {
			return false
		}
	}
	return true
}

func contains(arr []string, str string) bool {
	for _, a := range arr {
		if a == str {
			return true
		}
	}
	return false
}

// ToString Change arg to string
func ToString(arg interface{}) string {
	switch v := arg.(type) {
	case int:
		return strconv.Itoa(v)
	case int8:
		return strconv.FormatInt(int64(v), 10)
	case int16:
		return strconv.FormatInt(int64(v), 10)
	case int32:
		return strconv.FormatInt(int64(v), 10)
	case int64:
		return strconv.FormatInt(v, 10)
	case string:
		return v
	case float32:
		return strconv.FormatFloat(float64(v), 'f', -1, 32)
	case float64:
		return strconv.FormatFloat(v, 'f', -1, 64)
	default:
		return ""
	}
}

func convertStructToInterface(structToConvert interface{}, result interface{}) error {
	b, e := json.Marshal(structToConvert)
	if e != nil {
		return errors.New("JSON marshelling error")
	}
	e = json.Unmarshal(b, result)
	if e != nil {
		return errors.New("JSON unmarshelling error")
	}
	return nil
}

func SetMapValueIfNotEmpty(m map[string]interface{}, key string, value string) {
	if value != "" {
		m[key] = value
	}
}