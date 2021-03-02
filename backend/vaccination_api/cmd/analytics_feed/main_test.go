package main

import (
	"reflect"
	"testing"
	"time"
)

func Test_getDate(t *testing.T) {
	type args struct {
		dateTime string
	}
	tests := []struct {
		name string
		args args
		want time.Time
	}{
		{name: "date", args:args{dateTime:"2021-03-01T00:00:00.000Z",},want:time.Unix(1614556800, 0).UTC()},
		{name: "date", args:args{dateTime:"",},want:nil},
		//{name: "date", args:args{dateTime:"2021-03-01 12:12:00",},},
		//{name: "date", args:args{dateTime:"2021-01-19T10:16:04.085Z",},},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			if got := getDate(tt.args.dateTime); !reflect.DeepEqual(got, tt.want) {
				t.Errorf("getDate() = %v, want %v", got, tt.want)
			}
		})
	}
}