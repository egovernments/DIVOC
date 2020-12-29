package pkg

import (
	"database/sql"
	"fmt"
	"github.com/ClickHouse/clickhouse-go"
	"github.com/divoc/portal-api/config"
	log "github.com/sirupsen/logrus"
)

type AnalyticsResponse struct {
	NumberOfCertificatesIssued           map[string]int64 `json:"numberOfCertificatesIssued"`
	NumberOfCertificatesIssuedByDate     map[string]int64 `json:"numberOfCertificatesIssuedByDate"`
	NumberOfCertificatesIssuedByState    map[string]int64 `json:"numberOfCertificatesIssuedByState"`
	NumberOfCertificatesIssuedByAge      map[string]int64 `json:"numberOfCertificatesIssuedByAge"`
	DownloadByDate                       map[string]int64 `json:"downloadByDate"`
	ValidVerificationByDate              map[string]int64 `json:"validVerificationByDate"`
	InValidVerificationByDate            map[string]int64 `json:"inValidVerificationByDate"`
	FacilitiesCount                      map[string]int64 `json:"facilitiesCount"`
	RateOfCertificateIssuedByFacilities  map[string]int64 `json:"rateOfCertificateIssuedByFacilities"`
	VaccinatorsCount                     map[string]int64 `json:"vaccinatorsCount"`
	AvgRateAcrossFacilities              map[string]int64 `json:"avgRateAcrossFacilities"`
	NumberOfCertificatesIssuedByDistrict map[string]int64 `json:"numberOfCertificatesIssuedByDistrict"`
}

type PublicAnalyticsResponse struct {
	NumberOfCertificatesIssuedByState    map[string]int64 `json:"numberOfCertificatesIssuedByState"`
	NumberOfCertificatesIssuedByDistrict map[string]int64 `json:"numberOfCertificatesIssuedByDistrict"`
}

var DB *sql.DB

func InitClickHouseConnection() {
	log.Infof("Using analytics db %+v", config.Config.Analytics.Datasource)
	var err error
	DB, err = sql.Open("clickhouse", config.Config.Analytics.Datasource)
	if err != nil {
		log.Fatal(err)
	}
	if err := DB.Ping(); err != nil {
		if exception, ok := err.(*clickhouse.Exception); ok {
			fmt.Printf("[%d] %s \n%s\n", exception.Code, exception.Message, exception.StackTrace)
		} else {
			fmt.Println(err)
		}
		return
	}
}

func getAnalyticsInfo() AnalyticsResponse {
	countQuery := `
SELECT 'all', count() from certificatesv1 
union all 
select gender, count() from certificatesv1 group by gender
`
	byDateQuery := `select d, count() from certificatesv1 group by toYYYYMMDD(effectiveStart) as d`
	byStateQuery := `select facilityState, count() from certificatesv1 where facilityState != '' group by facilityState`
	byAgeQuery := `select a, count() from certificatesv1 group by floor(age/10)*10 as a`
	downloadByDate := `select d, count() from eventsv1 where type='download' group by toYYYYMMDD(dt) as d`
	validVerificationByDate := `select d, count() from eventsv1 where type='valid-verification' group by toYYYYMMDD(dt) as d`
	inValidVerificationByDate := `select d, count() from eventsv1 where type='invalid-verification' group by toYYYYMMDD(dt) as d`
	facilitiesCount := `select 'value', count(distinct facilityName) from certificatesv1`
	vaccinatorsCount := `select 'value', count(distinct vaccinatorName) as count from certificatesv1`
	avgRateAcrossFacilities := `select 'value', toUInt64(avg(count)) from (select facilityName, count() as count from certificatesv1 group by facilityName)`
	rateOfCertificateIssuedByFacilities := `select 'avg' as id, toUInt64(avg(certificateIssued)) as count from ( select facilityName, count(*) as certificateIssued from certificatesv1 group by facilityName)
union all
select 'min' as id, min(certificateIssued) as count from ( select facilityName, count(*) as certificateIssued from certificatesv1 group by facilityName)
union all
select 'max' as id, max(certificateIssued) as count from ( select facilityName, count(*) as certificateIssued from certificatesv1 group by facilityName)
`
	byDistrictQuery := `select facilityDistrict, count() from certificatesv1 where facilityDistrict != '' group by facilityDistrict`

	analyticsResponse := AnalyticsResponse{
		NumberOfCertificatesIssued:           getCount(countQuery),
		NumberOfCertificatesIssuedByDate:     getCount(byDateQuery),
		NumberOfCertificatesIssuedByState:    getCount(byStateQuery),
		NumberOfCertificatesIssuedByAge:      getCount(byAgeQuery),
		DownloadByDate:                       getCount(downloadByDate),
		ValidVerificationByDate:              getCount(validVerificationByDate),
		InValidVerificationByDate:            getCount(inValidVerificationByDate),
		FacilitiesCount:                      getCount(facilitiesCount),
		RateOfCertificateIssuedByFacilities:  getCount(rateOfCertificateIssuedByFacilities),
		VaccinatorsCount:                     getCount(vaccinatorsCount),
		AvgRateAcrossFacilities:              getCount(avgRateAcrossFacilities),
		NumberOfCertificatesIssuedByDistrict: getCount(byDistrictQuery),
	}

	return analyticsResponse
}

func getPublicAnalyticsInfo() PublicAnalyticsResponse {
	byStateQuery := `select facilityState, count() from certificatesv1 where facilityState != '' group by facilityState`
	byDistrictQuery := `select facilityDistrict, count() from certificatesv1 where facilityDistrict != '' group by facilityDistrict`

	publicAnalyticsResponse := PublicAnalyticsResponse{
		NumberOfCertificatesIssuedByState:    getCount(byStateQuery),
		NumberOfCertificatesIssuedByDistrict: getCount(byDistrictQuery),
	}

	return publicAnalyticsResponse
}

func getCount(query string) map[string]int64 {
	result := map[string]int64{}
	if DB == nil {
		InitClickHouseConnection()
	}
	rows, err := DB.Query(query)
	if err != nil {
		log.Errorf("Error while preparing the query %+v", err)
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
	log.Infof("res %+v", result)
	return result
}
