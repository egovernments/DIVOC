export const CONSTANTS = Object.freeze({
    ADMIN_ROLE: "admin",
    ROLE_CONTROLLER: "controller",
    MONITORING: "monitoring",
    FACILITY_PRINT_STAFF: "facility-print-staff",
    FACILITY_ADMIN_ROLE: "facility-admin",
    PORTAL_CLIENT: "facility-admin-portal",
});

export class SampleCSV {
    static FACILITY_REGISTRY = "https://raw.githubusercontent.com/egovernments/DIVOC/main/interfaces/facilities.csv"
    static VACCINATOR_REGISTRY = "https://raw.githubusercontent.com/egovernments/DIVOC/main/interfaces/vaccinators.csv"
    static PRE_ENROLLMENT = "https://raw.githubusercontent.com/egovernments/DIVOC/main/interfaces/enrollments.csv"
    static BULK_CERTIFY = "https://raw.githubusercontent.com/egovernments/DIVOC/main/interfaces/certificates.csv"
}
