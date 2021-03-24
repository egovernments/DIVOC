package models

type enrollmentType string

const (
	SelfEnrolled enrollmentType = "SELF_ENRL"
	PreEnrolled enrollmentType = "PRE_ENRL"
	WalkIn enrollmentType = "WALK_IN"
)