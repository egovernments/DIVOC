package pkg

import (
	"errors"
	"github.com/divoc/portal-api/pkg/db"
	"github.com/go-openapi/runtime/middleware"
	"github.com/jinzhu/gorm"
	"strings"
)

type GetCSVUpload struct {
	Columns    []string
	UserId     string
	UploadType string
}

func (getCSVUpload GetCSVUpload) GetCSVUploadsForUser() ([]*db.CSVUploads, error) {
	return db.GetCSVUploadsForUser(getCSVUpload.UserId, getCSVUpload.UploadType)
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
	columnHeaders := getCSVUpload.Columns

	if err == nil {
		var csvRows []map[string]string = nil
		if len(csvUploadErrors) > 0 {
			for _, uploadError := range csvUploadErrors {
				newMap := make(map[string]string)
				rowData := uploadError.RowData
				rowValue := strings.Split(rowData, ",")
				for i, header := range fileHeader {
					newMap[header] = rowValue[i]
				}
				newMap["errors"] = uploadError.Errors
				csvRows = append(csvRows, newMap)
			}
		}
		columnHeaders = append(columnHeaders, "errors")
		var response map[string]interface{}
		if len(csvRows) > 0 {
			response = map[string]interface{}{
				"columns":   columnHeaders,
				"errorRows": csvRows,
			}
		} else {
			response = map[string]interface{}{
				"columns":   columnHeaders,
				"errorRows": []map[string]string{},
			}
		}
		return NewGenericJSONResponse(response)
	}
	return NewGenericServerError()
}
