package main

import (
	"github.com/divoc/api/pkg"
	"reflect"
	"testing"
)

func Test_sortCertificatesByCreateAt(t *testing.T) {
	type args struct {
		certificateArr []interface{}
	}
	tests := []struct {
		name string
		args args
		want []interface{}
	}{
		{name:"Sort by create",
			args:args{certificateArr:[]interface{}{
				map[string]interface{}{"_osCreatedAt":"2021-01-27T08:33:31.027Z"},
				map[string]interface{}{"_osCreatedAt":"2021-03-10T14:15:05.164Z"},
			},
			},
			want:
				[]interface{}{
					map[string]interface{}{"_osCreatedAt":"2021-01-27T08:33:31.027Z"},
					map[string]interface{}{"_osCreatedAt":"2021-03-10T14:15:05.164Z"},
				},

		},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			if got := pkg.SortCertificatesByCreateAt(tt.args.certificateArr); !reflect.DeepEqual(got, tt.want) {
				t.Errorf("sortCertificatesByCreateAt() = %v, want %v", got, tt.want)
			}
		})
	}
}
