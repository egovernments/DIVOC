package pkg

import (
	"strings"
	"time"

	"github.com/divoc/portal-api/pkg/db"
	"github.com/divoc/portal-api/pkg/utils"
	"github.com/divoc/portal-api/swagger_gen/models"
	log "github.com/sirupsen/logrus"
)

type CSVMetadata struct {
	Data     *Scanner
	Columns  []string
	FileName string
	UserName string
}

type BaseCSV interface {
	ValidateHeaders() *models.Error
	CreateCsvUploadHistory() *db.CSVUploads
	ValidateRow() []string
	ProcessRow(uploadID uint) error
	SaveCsvErrors(rowErrors []string, csvUploadHistoryId uint) *db.CSVUploadErrors
}

func (baseCsv CSVMetadata) ValidateHeaders() *models.Error {
	// csv template validation
	csvHeaders := baseCsv.Data.GetHeaders()
	for _, c := range baseCsv.Columns {
		if !utils.Contains(csvHeaders, c) {
			code := "INVALID_TEMPLATE"
			message := c + " column doesn't exist in uploaded csv file"
			e := &models.Error{
				Code:    &code,
				Message: &message,
			}
			return e
		}
	}
	return nil
}

func (baseCsv CSVMetadata) ValidateRow(requireHeader []string) []string {
	var errorMsgs []string
	for _, headerKey := range requireHeader {
		if baseCsv.Data.Text(headerKey) == "" {
			errorMsgs = append(errorMsgs, headerKey+" is missing")
		}
	}
	return errorMsgs
}

func (baseCsv CSVMetadata) CreateCsvUploadHistory(uploadType string) *db.CSVUploads {
	headers := strings.Join(baseCsv.Data.GetHeaders(), ",")
	// Initializing CSVUploads entity
	uploadEntry := db.CSVUploads{}
	uploadEntry.Filename = baseCsv.FileName
	uploadEntry.UserID = baseCsv.UserName
	uploadEntry.FileHeaders = headers
	uploadEntry.UploadType = uploadType
	uploadEntry.TotalRecords = 0
	_ = db.CreateCSVUpload(&uploadEntry)
	return &uploadEntry
}

func (baseCsv CSVMetadata) SaveCsvErrors(rowErrors []string, csvUploadHistoryId uint) *db.CSVUploadErrors {
	csvUploadErrors := db.CSVUploadErrors{}
	csvUploadErrors.Errors = strings.Join(rowErrors, ",")
	csvUploadErrors.CSVUploadID = csvUploadHistoryId
	var row []string
	for _, item := range baseCsv.Data.Row {
		row = append(row, "\""+item+"\"")
	}
	csvUploadErrors.RowData = strings.Join(row, ",")
	_ = db.CreateCSVUploadError(&csvUploadErrors)
	return &csvUploadErrors
}

type CSVUpload struct {
	BaseCSV
}

func ProcessCSV(baseCsv BaseCSV, data *Scanner) {
	csvUploadHistory := baseCsv.CreateCsvUploadHistory()
	var totalRecords int64 = 0
	// start time
	startTime := time.Now()
	log.Infof("CSV file ingestion started at %v", startTime)

	saveErrors := func (errors []string) {
		log.Error("Error while processing row : ", errors)
		baseCsv.SaveCsvErrors(errors, csvUploadHistory.ID)
	}

	for data.Scan() {
		totalRecords++
		rowErrors := baseCsv.ValidateRow()
		if len(rowErrors) > 0 {
			saveErrors(rowErrors)
			continue
		}
		err := baseCsv.ProcessRow(csvUploadHistory.ID)
		if err != nil {
			saveErrors([]string{err.Error()})
		}
	}
	// end time
	endTime := time.Now()
	log.Infof("CSV file ingestion ended at %v", endTime)
	var d = time.Duration(endTime.UnixNano() - startTime.UnixNano())
	log.Infof("Total Time taken %v", d.Seconds())

	csvUploadHistory.TotalRecords = totalRecords
	db.UpdateCSVUpload(csvUploadHistory)
}
