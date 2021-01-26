package pkg

import (
    "time"
    "strconv"
	"github.com/go-openapi/strfmt"
)

func contains(s []string, e string) bool {
    for _, a := range s {
        if a == e {
            return true
        }
    }
    return false
}

func getDiff(a []string, b []string) map[string]bool {
    diffSet := make(map[string]bool)
    for _, i := range a {
        diffSet[i] = true
    }
    for _, i := range b {
        if diffSet[i] {
            diffSet[i] = false
        }
    }
    return diffSet
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

func calcAge(dob strfmt.Date) string {
    t0 := time.Time{}
    return strconv.Itoa(
        t0.Add(time.Since(time.Time(dob))).Year() - t0.Year(),
    )
    
}