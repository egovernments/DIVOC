package main

import (
	"flag"
	"fmt"
	"github.com/gorilla/mux"
	"github.com/jinzhu/configor"
	"github.com/patrickmn/go-cache"
	"github.com/prometheus/client_golang/prometheus/promhttp"
	log "github.com/sirupsen/logrus"
	"io"
	"io/ioutil"
	"net/http"
	"net/url"
	"time"
)

type ResponseType struct {
	response    []byte
	contentType string
}

var cacheStore = cache.New(60*time.Minute, 10*time.Minute)

var defaultExpiry = time.Minute * 5

func get(cacheStore *cache.Cache, k string, fallback func(k string) (interface{}, error)) interface{} {
	if value, found := cacheStore.Get(k); found {
		return value
	} else {
		value, err := fallback(k)
		if err != nil {
			log.Errorf("Fallback returned error %+v", err)
			return nil
		} else {
			cacheStore.Set(k, value, defaultExpiry)
			return value
		}
	}
}

func getContent(url string) (*ResponseType) {
	return get(cacheStore, url, func(url string) (interface{}, error) {
		log.Infof("Cache miss getting the url %s", url)
		resp, err := http.Get(url)
		if err != nil {
			return nil, fmt.Errorf("GET error: %v", err)
		}
		defer resp.Body.Close()

		if resp.StatusCode != http.StatusOK {
			return nil, fmt.Errorf("Status error: %v", resp.StatusCode)
		}

		data, err := ioutil.ReadAll(resp.Body)
		log.Infof("All header %+v", resp.Header)
		contentType := resp.Header.Get("Content-Type")
		log.Infof("Got content type %s", contentType)
		if err != nil {
			return nil, fmt.Errorf("Read body: %v", err)
		}
		response := ResponseType{
			response:    data,
			contentType: contentType,
		}
		cacheStore.Set(url, &response, defaultExpiry)

		return &response, nil
	}).(*ResponseType);
}

func postContent(url string, contentType string, body io.Reader) (*ResponseType) {
	request, _ := http.NewRequest("POST", url, body)
	request.Header.Set("Authorization", "Key "+Config.DashKey)
	resp, err := http.DefaultClient.Do(request)
	if err != nil {
		log.Errorf("POST error: %+v", err)
		return nil
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		log.Errorf("POST error: %+v", resp)
		return nil
	}

	data, err := ioutil.ReadAll(resp.Body)
	if err != nil {
		log.Errorf("POST error in reading body from %s: %+v", url, err)
		return nil
	}

	return &ResponseType{
		response:    data,
		contentType: resp.Header.Get("Content-Type"),
	}
}
func postContentCaching(url string, contentType string, body io.Reader) (*ResponseType) {
	if requestBodyBytes, err := ioutil.ReadAll(body); err != nil {
		log.Errorf("Error in reading the request body in post request %+v", err)
		return nil
	} else {
		key := url + string(requestBodyBytes)
		if resp, found := cacheStore.Get(key); found {
			return resp.(*ResponseType)
		} else {
			log.Infof("Cache missed for post request %v", key)
			if resp := postContent(url, contentType, body); resp != nil {
				cacheStore.Set(key, resp, defaultExpiry)
				return resp
			}
		}
	}
	return nil
}

func okHandler(w http.ResponseWriter, req *http.Request) {
	w.WriteHeader(200)
}

func relayingProxy(w http.ResponseWriter, req *http.Request) {
	log.Info(req.URL);
	url := getUrl(req.URL)
	uri := req.URL.RequestURI()

	if uri == "/api/session" || uri == "/api/events" {
		w.WriteHeader(200)
		return
	}
	if uri == "/" {
		w.Header().Set("Location", "/public/dashboards/"+Config.DashKey)
		w.WriteHeader(301)
		return
	}
	if req.Method == "POST" {
		if resp := postContentCaching(url, "application/json", req.Body); resp == nil {
			log.Errorf("Error %+v", resp)
			w.WriteHeader(500)
		} else {
			w.WriteHeader(200)
			w.Header().Set("Content-Type", resp.contentType)
			cacheSince := time.Now().Format(http.TimeFormat)
			cacheUntil := time.Now().Add(defaultExpiry).Format(http.TimeFormat)
			w.Header().Set("Last-Modified", cacheSince)
			w.Header().Set("Expires", cacheUntil)
			_, _ = w.Write(resp.response)
		}
		return
	} else {
		if resp := getContent(url); resp == nil {
			log.Errorf("Error %+v", resp)
			w.WriteHeader(500)
			return
		} else {
			w.Header().Set("Content-Type", resp.contentType)
			cacheSince := time.Now().Format(http.TimeFormat)
			cacheUntil := time.Now().AddDate(0, 0, 7).Add(time.Hour).Format(http.TimeFormat)
			w.Header().Set("Last-Modified", cacheSince)
			w.Header().Set("Expires", cacheUntil)
			w.WriteHeader(200)
			_, _ = w.Write(resp.response)
			return
		}
	}
}

func getUrl(url *url.URL) string {
	return fmt.Sprintf("%s%s", Config.RedashBaseURL, url.Path)
}

var Config = struct {
	RedashBaseURL 				  string `env:"REDASH_BASE_URL"`
	DashKey                       string `env:"REDASH_KEY"`
	DefaultCacheDurationInMinutes uint `default:"60" env:"CACHE_DURATION_MINUTES"`
}{}

var addr = flag.String("listen-address", ":8004", "The address to listen on for HTTP requests.")

func main() {
	if err := configor.Load(&Config); err != nil {
		panic("Error initializing configuration")
	}
	log.Infof("Using RedashBaseURL %s or Key %s", Config.RedashBaseURL, Config.DashKey)
	if Config.RedashBaseURL == "" || Config.DashKey == "" {
		panic("Missing configuration url or key")
	}
	defaultExpiry = time.Minute * time.Duration(Config.DefaultCacheDurationInMinutes)
	r := mux.NewRouter()
	r.Handle("/metrics", promhttp.Handler())
	r.HandleFunc("/health", okHandler)
	http.HandleFunc("/", relayingProxy)
	log.Infof("Running caching support for dashboard on %s", *addr)
	_ = http.ListenAndServe(*addr, nil)
}
