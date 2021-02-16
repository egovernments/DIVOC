package services

import (
	kernelService "github.com/divoc/kernel_library/services"
	"github.com/divoc/registration-api/config"
	"github.com/divoc/registration-api/pkg/utils"
	"github.com/divoc/registration-api/swagger_gen/models"
)

func CreateEnrollment(enrollment models.Enrollment, currentRetryCount int) error {
	enrollment.Code = utils.GenerateEnrollmentCode(*enrollment.Phone)
	err := kernelService.CreateNewRegistry(enrollment, "Enrollment")
	// If the generated Code is not unique, try again
	// code + programId should be unique
	if err != nil && currentRetryCount <= config.Config.EnrollmentCreation.MaxRetryCount {
		return CreateEnrollment(enrollment, currentRetryCount+1)
	}
	return err
}
