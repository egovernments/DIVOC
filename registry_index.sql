CREATE UNIQUE INDEX "public_V_Facility_facilityCode_sqlgIdx" ON "public"."V_Facility" ("facilityCode");
CREATE UNIQUE INDEX "public_V_Enrollment_scope_code_sqlgIdx" ON "public"."V_Enrollment" ("enrollmentScopeId", "code");
CREATE INDEX "public_V_Enrollment_enrlType_sqlgIdx" ON "public"."V_Enrollment" ("enrollmentType");
CREATE UNIQUE INDEX "public_V_Medicine_name_sqlgIdx" ON "public"."V_Medicine" ("name");
CREATE UNIQUE INDEX "public_V_Program_name_sqlgIdx" ON "public"."V_Program" ("name");
CREATE INDEX "public_V_VaccinationCertificate_preEnrollmentCode_sqlgIdx" ON "public"."V_VaccinationCertificate" ("preEnrollmentCode");
CREATE UNIQUE INDEX "public_V_VaccinationCertificate_certificateId_sqlgIdx" ON "public"."V_VaccinationCertificate" ("certificateId");
CREATE INDEX "public_V_VaccinationCertificate_contact_sqlgIdx" ON "public"."V_VaccinationCertificate" ("contact");
CREATE INDEX "public_V_VaccinationCertificate_mobile_sqlgIdx" ON "public"."V_VaccinationCertificate" ("mobile");
CREATE UNIQUE INDEX "public_V_Vaccinator_code_sqlgIdx" ON "public"."V_Vaccinator" ("code");

