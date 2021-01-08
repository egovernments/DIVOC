package pkg

import (
	"github.com/divoc/portal-api/pkg/db"
	"github.com/divoc/portal-api/swagger_gen/models"
	"strings"
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
	CreateCsvUpload() error
	SaveCsvErrors(rowErrors []string, csvUploadHistoryId uint)
}

func (baseCsv CSVMetadata) ValidateHeaders() *models.Error {
	// csv template validation
	csvHeaders := baseCsv.Data.GetHeaders()
	for _, c := range baseCsv.Columns {
		if !contains(csvHeaders, c) {
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

func (baseCsv CSVMetadata) CreateCsvUploadHistory(uploadType string) *db.CSVUploads {
	headers := strings.Join(baseCsv.Data.GetHeaders(), ",")
	// Initializing CSVUploads entity
	uploadEntry := db.CSVUploads{}
	uploadEntry.Filename = baseCsv.FileName
	uploadEntry.UserID = baseCsv.UserName
	uploadEntry.FileHeaders = headers
	uploadEntry.Status = "Processing"
	uploadEntry.UploadType = uploadType
	uploadEntry.TotalRecords = 0
	uploadEntry.TotalErrorRows = 0
	_ = db.CreateCSVUpload(&uploadEntry)
	return &uploadEntry
}

func (baseCsv CSVMetadata) SaveCsvErrors(rowErrors []string, csvUploadHistoryId uint) {
	csvUploadErrors := db.CSVUploadErrors{}
	csvUploadErrors.Errors = strings.Join(rowErrors, ",")
	csvUploadErrors.CSVUploadID = csvUploadHistoryId
	csvUploadErrors.RowData = strings.Join(baseCsv.Data.Row, ",")
	_ = db.CreateCSVUploadError(&csvUploadErrors)
}

type CSVUpload struct {
	BaseCSV
}

func ProcessCSV(baseCsv BaseCSV, data *Scanner) *models.Error {
	csvUploadHistory := baseCsv.CreateCsvUploadHistory()

	var totalRowErrors int64 = 0
	var totalRecords int64 = 0
	for data.Scan() {
		rowErrors := baseCsv.ValidateRow()
		if len(rowErrors) > 0 {
			totalRowErrors += 1
			baseCsv.SaveCsvErrors(rowErrors, csvUploadHistory.ID)
		} else {
			_ = baseCsv.CreateCsvUpload()
		}
		totalRecords += 1
	}

	csvUploadHistory.TotalRecords = totalRecords
	csvUploadHistory.TotalErrorRows = totalRowErrors
	if csvUploadHistory.TotalErrorRows > 0 {
		csvUploadHistory.Status = "Failed"
	} else {
		csvUploadHistory.Status = "Success"
	}
	db.UpdateCSVUpload(csvUploadHistory)
	return nil
}
