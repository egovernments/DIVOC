package main

import (
	"encoding/base64"
	"fmt"
	"github.com/divoc/api/config"
	"strings"
	"testing"
)

func Test_getToken(t *testing.T) {
	config.Initialize()
	initRedis()
	id := "b5cab167-7977-4df1-8027-a63aa144f04e"
	token := getToken(id)
	if token == "" {
		t.Fail()
	}
	split := strings.Split(token, ".")
	bs := make([]byte, len(token))
	n, _ := base64.NewDecoder(base64.StdEncoding, strings.NewReader(split[0])).Read(bs)
	firstHeader := string(bs[:n])
	fmt.Printf("\n%+v", firstHeader)
	if firstHeader != `{"alg":"HS256","typ":"JWT"}` {
		t.Fail()
	}

}

