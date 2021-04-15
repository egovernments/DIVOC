package pkg

import (
	"encoding/json"
	"fmt"
	"github.com/divoc/api/swagger_gen/models"
	"github.com/divoc/api/swagger_gen/restapi/operations/certification"
	"reflect"
	"testing"
)

func
Test_certify(t *testing.T) {

	type args struct {
		params    certification.CertifyParams
		principal *models.JWTClaimBody
	}
	var fromJson = func(s string) args {
		var requests certification.CertifyParams
		if err := json.Unmarshal([]byte(s), &requests.Body); err != nil {
			fmt.Printf("Error parsing json %s, %+v", s, err)
		}

		return args{params: requests, principal: nil}
	}
	tests := []struct {
		name string
		args args
		want bool
	}{
		{name: "empty certify request", args:fromJson(`[]`), want:false},
		{name: "empty certify request", args:fromJson(`[{"preEnrollmentCode": "123469"}]`), want:false},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			if got, _ := validateCertifyRequest(tt.args.params); !reflect.DeepEqual(got, tt.want) {
				t.Errorf("certify() = %v, want %v", got, tt.want)
			}
		})
	}

}

