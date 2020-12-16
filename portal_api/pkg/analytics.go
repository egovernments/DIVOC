package pkg

import (
	"database/sql"
	"fmt"
	"github.com/ClickHouse/clickhouse-go"
	"github.com/divoc/portal-api/config"
	log "github.com/sirupsen/logrus"
)

type AnalyticsResponse struct {
	NumberOfCertificatesIssued   map[string]int64 `json:"numberOfCertificatesIssued"`
}

var connect *sql.DB = initConnection()

func initConnection() *sql.DB {
	log.Infof("Using analytics db %+v", config.Config.Analytics.Datasource)
	connect, err := sql.Open("clickhouse", "tcp://127.0.0.1:9000?debug=true")
	if err != nil {
		log.Fatal(err)
	}
	if err := connect.Ping(); err != nil {
		if exception, ok := err.(*clickhouse.Exception); ok {
			fmt.Printf("[%d] %s \n%s\n", exception.Code, exception.Message, exception.StackTrace)
		} else {
			fmt.Println(err)
		}
		return nil
	}
	return connect
}

func getAnalyticsInfo() AnalyticsResponse {
	numberOfCertificatesIssued := getCount()
	analyticsResponse := AnalyticsResponse{
		NumberOfCertificatesIssued:   numberOfCertificatesIssued,
	}



	return analyticsResponse
}

func getCount() map[string]int64 {
	result := map[string]int64{}
	rows, err := connect.Query(`
SELECT 'all', count() from certificatesv1 
union all 
select gender, count() from certificatesv1 group by gender
`)
	if err != nil {
		return result
	}
	defer rows.Close()

	for rows.Next() {
		var tag string
		var number int64
		if err := rows.Scan(&tag, &number); err != nil {
			log.Errorf("Error while reading from results %+v", err)
			return result
		}
		result[tag] = number
	}
	return result
}