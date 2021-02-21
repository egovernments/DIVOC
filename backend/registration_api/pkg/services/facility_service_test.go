package services

import "testing"

func TestGetFacilityAppointmentSchedule(t *testing.T) {
	type args struct {
		facilityId string
	}
	tests := []struct {
		name string
		args args
	}{
		{
			name: "shouldAllocate",
			args: args{
				"dasd",
			},
		},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			GetFacilityAppointmentSchedule(tt.args.facilityId)
		})
	}
}
