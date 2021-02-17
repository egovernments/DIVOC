package main

import (
	"testing"
)


func Test_getVaccineValidDays(t *testing.T) {
	type args struct {
		start string
		end   string
	}
	tests := []struct {
		name string
		args args
		want string
	}{
		{"check due date from validity",
			args{start: "2020-01-16", end: "2020-01-30"},
			"after 14 days"},
		{"check due date when effective until is same as start",
			args{start: "2020-01-16", end: "2020-01-16"},
			"after 28 days"},
		{"check due date when effective until is same as start",
			args{start: "2020-01-16", end: "2020-01-16"},
			"after 28 days"},
		{"check due date when effective until invalid",
			args{start: "2020-01-16", end: ""},
			"after 28 days"},
		{"check due date when effective start invalid",
			args{start: "", end: ""},
			"after 28 days"},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			if got := getVaccineValidDays(tt.args.start, tt.args.end); got != tt.want {
				t.Errorf("getVaccineValidDays() = %v, want %v", got, tt.want)
			}
		})
	}
}

func Test_maskId(t *testing.T) {
	type args struct {
		id string
	}
	tests := []struct {
		name string
		args args
		want string
	}{
		{"aadhaar format", args{"123456789012"}, "XXXXXXXX9012",},
		{"blank id", args{""}, "",},
		{"one chars", args{"a"}, "X",},
		{"two chars", args{"aa"}, "XX",},
		{"three chars", args{"123"}, "XX3",},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			if got := maskId(tt.args.id); got != tt.want {
				t.Errorf("maskId() = %v, want %v", got, tt.want)
			}
		})
	}
}