package main

import (
	"encoding/base64"
	"fmt"
	"github.com/divoc/api/config"
	"os"
	"path"
	"runtime"
	"strings"
	"testing"
)

func init() {
	_, filename, _, _ := runtime.Caller(0)
	// The ".." may change depending on you folder structure
	dir := path.Join(path.Dir(filename), "../../")
	err := os.Chdir(dir)
	fmt.Printf("Using directory %s %s\n", dir, filename)
	if err != nil {
		panic(err)
	}
}

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

