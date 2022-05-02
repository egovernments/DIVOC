select  
ROW_NUMBER () OVER (ORDER BY "preEnrollmentCode"),"preEnrollmentCode", "osCreatedAt" , dose
from(
    select DISTINCT ON("preEnrollmentCode",dose) "preEnrollmentCode", "osCreatedAt",
    (json_array_elements((certificate::json) -> 'evidence') ->> 'dose')::int as dose
    from public."V_VaccinationCertificate"
    order by "preEnrollmentCode" ASC, dose ASC, "osCreatedAt" DESC
) listOfDistinctPreEnCodeDose ;

select  
ROW_NUMBER () OVER (ORDER BY "preEnrollmentCode"),"preEnrollmentCode", "osCreatedAt" , dose
from(
    select "preEnrollmentCode", "osCreatedAt",
    (json_array_elements((certificate::json) -> 'evidence') ->> 'dose')::int as dose
    from public."V_VaccinationCertificate"
    order by "preEnrollmentCode" ASC, "osCreatedAt" ASC
) list ;

