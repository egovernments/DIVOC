package pkg

import (
	"errors"
	"strings"

	"github.com/divoc/portal-api/pkg/db"
	"github.com/go-openapi/runtime/middleware"
	"github.com/jinzhu/gorm"
)

type GetCSVUpload struct {
	Columns    []string
	UserId     string
	UploadType string
}

func (getCSVUpload GetCSVUpload) GetCSVUploadsForUser() ([]*db.CSVUploadInfo, error) {
	return db.GetUploadsForUser(getCSVUpload.UserId, getCSVUpload.UploadType)
}

func (getCSVUpload GetCSVUpload) GetCSVUploadErrors(uploadID int64) middleware.Responder {

	// check if user has permission to get errors
	csvUpload, err := db.GetCSVUploadsForID(uploadID)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			// csvUpload itself not there
			// then throw 404 error
			return NewGenericNotFoundError()
		}
		return NewGenericServerError()
	}
	// user in csvUpload doesnt match preferredUsername
	// then throw 403 error
	if csvUpload.UserID != getCSVUpload.UserId {
		return NewGenericForbiddenError()
	}

	csvUploadErrors, err := db.GetCSVUploadErrorsForUploadID(uploadID)
	fileHeader := strings.Split(csvUpload.FileHeaders, ",")

	if err == nil {
		erroredString := getErrorRows(csvUpload.FileHeaders, csvUploadErrors)
		if len(csvUploadErrors) > 0 {
			columnHeaders, errorRows := getCSVUpload.getErrorRowForResponse(erroredString, fileHeader)
			return NewGenericJSONResponse(map[string]interface{}{
				"columns":   columnHeaders,
				"errorRows": errorRows,
			})
		} else {
			return NewGenericJSONResponse(map[string]interface{}{
				"columns":   []map[string]string{},
				"errorRows": []map[string]string{},
			})
		}
	}
	return NewGenericServerError()
}

func (getCSVUpload GetCSVUpload) getErrorRowForResponse(erroredString string, fileHeader []string) ([]string, []map[string]string) {
	columnHeaders := getCSVUpload.Columns
	reader := strings.NewReader(erroredString)
	scanner := NewScanner(reader)
	columnHeaders = append(columnHeaders, "errors")

	var errorRows []map[string]string
	for scanner.Scan() {
		newErrorRow := make(map[string]string)
		for _, head := range fileHeader {
			newErrorRow[head] = scanner.Text(head)
		}
		newErrorRow["errors"] = scanner.Text("errors")
		errorRows = append(errorRows, newErrorRow)
	}
	return columnHeaders, errorRows
}

func getErrorRows(headers string, csvUploadErrors []*db.CSVUploadErrors) string {
	var erroredString strings.Builder
	erroredString.WriteString(headers + ",errors")
	erroredString.WriteString("\n")
	for _, uploadError := range csvUploadErrors {
		erroredString.WriteString(uploadError.RowData)
		erroredString.WriteString(",\"" + uploadError.Errors + "\"")
		erroredString.WriteString("\n")
	}
	return erroredString.String()
}
