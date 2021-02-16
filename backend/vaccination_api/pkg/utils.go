package pkg

import (
    "strconv"
)

func contains(s []string, e string) bool {
    for _, a := range s {
        if a == e {
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

func ToInt(i interface{}) (int) {
    switch s := i.(type) {
    case float64:
        return int(s)
    case float32:
        return int(s)
    case string:
        v, err := strconv.ParseInt(s, 0, 0)
        if err == nil {
            return int(v)
        }
        return 0
    case bool:
        if s {
            return 1
        }
        return 0
    case nil:
        return 0
    default:
        return 0
    }
}