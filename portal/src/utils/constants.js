export const CONSTANTS = Object.freeze({
    ADMIN_ROLE: "admin",
    ROLE_CONTROLLER: "controller",
    MONITORING: "monitoring",
    FACILITY_PRINT_STAFF: "facility-print-staff",
    FACILITY_ADMIN_ROLE: "facility-admin",
    PORTAL_CLIENT: "facility-admin-portal",
    WEEK: "Week",
    MONTH: "Month",
    ALL: "All",
    GOVT: "GOVT",
    PRIVATE: "PRIVATE",
    ACTIVE: "Active",
    IN_ACTIVE: "Inactive"
});

export const FACILITY_TYPE = Object.freeze({
    GOVT: "Government",
    PRIVATE: "Private",
});

export const API_URL = Object.freeze({
    FACILITY_API: "/divoc/admin/api/v1/facilities",
    USER_FACILITY_API: "/divoc/admin/api/v1/facility",
    FACILITY_NOTIFY_API: "/divoc/admin/api/v1/facilities/notify",
    PROGRAM_API: "/divoc/admin/api/v1/programs",
    MEDICINE_API: "/divoc/admin/api/v1/medicines",
    FACILITY_FILE_UPLOAD_HISTORY_API: '/divoc/admin/api/v1/facility/uploads',
    FACILITY_FILE_UPLOAD_ERRORS_API: '/divoc/admin/api/v1/facility/uploads/:id/errors',
    VACCINATORS_API: '/divoc/admin/api/v1/vaccinators',
    VACCINATOR_FILE_UPLOAD_HISTORY_API: '/divoc/admin/api/v1/vaccinators/uploads',
    VACCINATOR_FILE_UPLOAD_ERRORS_API: '/divoc/admin/api/v1/vaccinators/uploads/:id/errors',
    PRE_ENROLLMENT_FILE_UPLOAD_API: '/divoc/admin/api/v1/enrollments',
    PRE_ENROLLMENT_FILE_UPLOAD_HISTORY_API: '/divoc/admin/api/v1/enrollments/uploads',
    PRE_ENROLLMENT_FILE_UPLOAD_ERRORS_API: '/divoc/admin/api/v1/enrollments/uploads/:id/errors',
    FACILITY_PROGRAM_SCHEDULE_API: '/divoc/admin/api/v1/facility/:facilityId/program/:programId/schedule'
});

export class SampleCSV {
    static FACILITY_REGISTRY = "https://raw.githubusercontent.com/egovernments/DIVOC/main/interfaces/facilities.csv"
    static VACCINATOR_REGISTRY = "https://raw.githubusercontent.com/egovernments/DIVOC/main/interfaces/vaccinators.csv"
    static PRE_ENROLLMENT = "https://raw.githubusercontent.com/egovernments/DIVOC/main/interfaces/enrollments.csv"
    static BULK_CERTIFY = "https://raw.githubusercontent.com/egovernments/DIVOC/main/interfaces/certificates.csv"
}
