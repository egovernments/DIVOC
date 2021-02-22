package main

import "testing"

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
		{
			name: "should return difference days",
			args: args{
				start: "2020-01-01",
				end:   "2020-01-10",
			},
			want: "after 9 days",
		},
		{
			name: "should return default 28 days if difference is 0",
			args: args{
				start: "2020-01-10",
				end:   "2020-01-10",
			},
			want: "after 28 days",
		},
		{
			name: "should return default 28 days if error in date format",
			args: args{
				start: "2020/01/01",
				end:   "2020-01-10",
			},
			want: "after 28 days",
		},
		{
			name: "should return default 28 days if start and end dates are invalid",
			args: args{
				start: "2020-02-01",
				end:   "2020-01-10",
			},
			want: "after 28 days",
		},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			if got := getVaccineValidDays(tt.args.start, tt.args.end); got != tt.want {
				t.Errorf("getVaccineValidDays() = %v, want %v", got, tt.want)
			}
		})
	}
}

func Test_formatId(t *testing.T) {
	type args struct {
		identity string
	}
	tests := []struct {
		name string
		args args
		want string
	}{
		{
			name: "should return last 4 digits for aadhaar id",
			args: args{
				identity: "did:aadhaar:123456",
			},
			want: "Aadhaar # XXXX XXXX XXXX 3456",
		},
		{
			name: "should return complete id if aadhaar has length less than 4",
			args: args{
				identity: "did:aadhaar:456",
			},
			want: "456",
		},
		{
			name: "should return driving license id",
			args: args{
				identity: "did:Driving License:123as12",
			},
			want: "Driver’s License # 123as12",
		},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			if got := formatId(tt.args.identity); got != tt.want {
				t.Errorf("formatId() = %v, want %v", got, tt.want)
			}
		})
	}
}